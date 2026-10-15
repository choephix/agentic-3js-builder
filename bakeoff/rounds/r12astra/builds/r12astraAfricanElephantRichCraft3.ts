import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  frame,
  paint,
  noise,
  mix,
  grain,
  svg,
} from "../../../../src/index";
import type { Joint, Fill } from "../../../../src/index";

export const meta = {
  name: "African Bush Elephant",
  description:
    "An adult African bush elephant, built in broad, low-poly volumes, with great continent-shaped ears, weathered slate skin, curved ivory tusks, and an articulated, gently extended trunk.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "AfricanBushElephant",
    detail: 1,
    paintSize: 2048,
  });

  // A restrained palette: warm dust over blue-grey skin, dark creases,
  // muted ear interiors and old ivory. The large facets remain visible.
  const SKIN = paint((p, n) => {
    const cloud = noise(p, 0.37, 14);
    let c = mix("#626d70", "#8c918a", cloud * 0.65 + Math.max(n.y, 0) * 0.2);
    const dust =
      Math.max(0, n.y) * 0.15 +
      Math.max(0, 0.65 - p.y) * 0.25;
    c = mix(c, "#a6967e", dust);
    return c;
  });

  const FACE = paint((p, n) =>
    mix(
      "#6f7878",
      "#95988e",
      0.18 + noise(p, 0.21, 19) * 0.42 + Math.max(n.y, 0) * 0.14,
    ),
  );

  const EAR = paint((p, n) => {
    const warm = noise(p, 0.27, 24);
    return mix(
      "#737d7c",
      "#a39788",
      warm * 0.56 + Math.max(0, n.z) * 0.12,
    );
  });

  const IVORY = grain("#d4c49f", "#f1e7cb", {
    size: 0.028,
    axis: "z",
    seed: 9,
  });

  const NAIL = grain("#a9a899", "#d3cfbb", {
    size: 0.017,
    axis: "y",
    seed: 5,
  });

  const CREASE = "#586467";
  const LIGHT_CREASE = "#90968e";
  const DEEP = "#39484c";
  const MOUTH = "#3e4949";
  const HAIR = "#333d3d";

  // Drawings carry the fine details rather than extra tessellation.
  const EYE = svg(
    `<svg viewBox="0 0 160 110">
      <path d="M8 58 Q29 15 81 23 Q131 27 153 57 Q126 93 77 91 Q31 90 8 58Z"
        fill="#354244" stroke="#93998e" stroke-width="5"/>
      <path d="M18 58 Q46 32 83 34 Q122 36 144 58 Q120 80 78 80 Q39 78 18 58Z"
        fill="#222b2b"/>
      <ellipse cx="85" cy="57" rx="27" ry="28" fill="#82704d"/>
      <ellipse cx="86" cy="60" rx="21" ry="23" fill="#af9160"/>
      <ellipse cx="88" cy="57" rx="14" ry="23" fill="#172526"/>
      <path d="M62 69 Q76 84 101 74" fill="none" stroke="#cead76" stroke-width="4"/>
      <ellipse cx="78" cy="44" rx="7" ry="5" fill="#eee9d5"/>
      <circle cx="96" cy="66" r="3" fill="#c5d4cb"/>
      <path d="M10 55 Q65 8 151 55" fill="none" stroke="#3a4849" stroke-width="10"
        stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const EAR_LINES = svg(
    `<svg viewBox="0 0 220 300">
      <g fill="none" stroke="#5b6969" stroke-width="3" stroke-linecap="round" opacity=".65">
        <path d="M23 145 Q82 100 173 40 M67 112 Q88 62 106 29"/>
        <path d="M32 151 Q104 142 199 94 M101 136 Q141 97 160 70"/>
        <path d="M31 163 Q110 186 199 153 M89 178 Q153 171 177 183"/>
        <path d="M36 177 Q104 227 162 238 M83 211 Q117 246 119 275"/>
        <path d="M37 150 Q65 90 62 55"/>
        <path d="M40 182 Q60 238 77 264"/>
      </g>
      <g fill="none" stroke="#bec0ab" stroke-width="2.5" opacity=".5">
        <path d="M27 139 Q91 93 171 36"/>
        <path d="M38 157 Q119 150 196 100"/>
        <path d="M40 172 Q115 195 195 160"/>
        <path d="M44 183 Q110 233 158 243"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const FOREHEAD_LINES = svg(
    `<svg viewBox="0 0 240 220">
      <g fill="none" stroke-linecap="round">
        <g stroke="#59696a" stroke-width="4">
          <path d="M30 39 Q119 9 209 38"/>
          <path d="M22 66 Q121 38 216 66"/>
          <path d="M37 93 Q117 70 203 94"/>
          <path d="M57 120 Q122 101 183 121"/>
          <path d="M72 149 Q117 133 169 151"/>
          <path d="M91 175 Q120 167 149 177"/>
        </g>
        <g stroke="#acafa0" stroke-width="3">
          <path d="M35 32 Q119 3 204 31"/>
          <path d="M29 59 Q119 32 209 59"/>
          <path d="M42 86 Q118 64 197 87"/>
        </g>
      </g>
    </svg>`,
    { size: 384 },
  );

  const CHEEK_LINES = svg(
    `<svg viewBox="0 0 160 200">
      <g fill="none" stroke="#536366" stroke-width="3.5" stroke-linecap="round">
        <path d="M30 20 Q72 32 123 22"/>
        <path d="M19 42 Q65 59 137 39"/>
        <path d="M21 64 Q55 81 130 64"/>
        <path d="M33 85 Q63 103 120 91"/>
        <path d="M44 106 Q77 126 112 116"/>
        <path d="M57 128 Q79 143 100 140"/>
        <path d="M43 22 Q25 62 53 108"/>
        <path d="M135 57 Q142 97 116 151"/>
      </g>
      <g fill="none" stroke="#b0b2a2" stroke-width="2.7" opacity=".65">
        <path d="M25 37 Q68 52 132 34"/>
        <path d="M26 59 Q58 75 127 59"/>
        <path d="M37 80 Q63 96 116 85"/>
      </g>
    </svg>`,
    { size: 320 },
  );

  const LEG_LINES = svg(
    `<svg viewBox="0 0 220 150">
      <g fill="none" stroke="#536266" stroke-width="4" stroke-linecap="round">
        <path d="M13 31 Q99 7 205 30"/>
        <path d="M6 56 Q112 35 213 56"/>
        <path d="M15 79 Q113 64 205 80"/>
        <path d="M25 101 Q108 89 195 103"/>
        <path d="M50 123 Q113 115 174 125"/>
      </g>
      <g fill="none" stroke="#a3a89b" stroke-width="3">
        <path d="M18 24 Q101 2 200 23"/>
        <path d="M11 49 Q112 29 209 49"/>
        <path d="M20 72 Q112 58 201 73"/>
      </g>
    </svg>`,
    { size: 320 },
  );

  const NAIL_LINES = svg(
    `<svg viewBox="0 0 100 100">
      <g fill="none" stroke="#797f75" stroke-width="3" opacity=".65">
        <path d="M22 14 Q18 49 26 86"/>
        <path d="M41 9 Q37 49 43 91"/>
        <path d="M61 10 Q58 55 63 91"/>
        <path d="M80 16 Q77 53 80 83"/>
        <path d="M17 78 Q51 90 85 77"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------
  // Skeleton first. Body is approximately 3.5 m high at the shoulder.
  // The feet are planted, while the ears, tail and trunk remain separated.
  // ------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 2.28, -1.15],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 2.28, -1.15],
      [0, 2.39, -0.25],
      [0, 2.48, 0.78],
    ],
    {
      parent: hips,
      names: ["spineLower", "spineUpper", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 2.48, 0.78],
      [0, 2.74, 1.35],
      [0, 2.88, 1.64],
    ],
    {
      parent: spine.tip!,
      names: ["neckBase", "neckUpper"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.88, 1.68],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.22, 1.6],
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  const trunkPath = catmull([
    [0, 2.97, 2.2],
    [0, 2.51, 2.46],
    [0, 1.92, 2.6],
    [0, 1.28, 2.72],
    [0, 0.79, 2.94],
    [0, 0.63, 3.24],
    [0, 0.72, 3.49],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    count: 7,
    role: "tentacle",
  });

  const fingerUpper = b.chain(
    "trunkFingerUpper",
    [
      [0, 0.8, 3.44],
      [0, 0.86, 3.57],
      [0, 0.83, 3.64],
    ],
    { parent: trunk.joints[6], role: "digit" },
  );

  const fingerLower = b.chain(
    "trunkFingerLower",
    [
      [0, 0.66, 3.44],
      [0, 0.65, 3.56],
      [0, 0.68, 3.61],
    ],
    { parent: trunk.joints[6], role: "digit" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.57, -1.72],
      [0.05, 2.27, -2.04],
      [0.1, 1.89, -2.25],
      [0.16, 1.5, -2.38],
      [0.18, 1.28, -2.43],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  const earJoints: Joint[] = [];
  const legs: {
    side: number;
    front: boolean;
    x: number;
    z: number;
    chain: ReturnType<typeof b.chain>;
  }[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJoints.push(
      b.joint(`ear${side}`, {
        parent: head,
        at: [s * 0.61, 2.94, 1.46],
        dir: [s, 0, 0],
        role: "hinge",
      }),
    );

    const front = b.chain(
      `frontLeg${side}`,
      [
        [s * 0.7, 2.62, 0.83],
        [s * 0.79, 1.49, 1.0],
        [s * 0.83, 0.53, 1.08],
        [s * 0.83, 0.27, 1.14],
      ],
      {
        parent: spine.tip!,
        names: [
          `shoulderF${side}`,
          `elbowF${side}`,
          `wristF${side}`,
          `footF${side}`,
        ],
        role: "leg",
        contact: [s * 0.83, 0, 1.14],
      },
    );

    const rear = b.chain(
      `hindLeg${side}`,
      [
        [s * 0.69, 2.32, -1.19],
        [s * 0.8, 1.39, -1.03],
        [s * 0.84, 0.62, -1.38],
        [s * 0.86, 0.27, -1.4],
      ],
      {
        parent: hips,
        names: [
          `hipH${side}`,
          `kneeH${side}`,
          `ankleH${side}`,
          `footH${side}`,
        ],
        role: "leg",
        contact: [s * 0.86, 0, -1.4],
      },
    );

    legs.push(
      { side: s, front: true, x: s * 0.83, z: 1.14, chain: front },
      { side: s, front: false, x: s * 0.86, z: -1.4, chain: rear },
    );
  }

  function ellipsoid(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name,
      bone,
      at,
      scale: size,
      flat: true,
    });
  }

  // ------------------------------------------------------------------
  // Face. Large cranial mass, small alert eyes and a separate lower jaw.
  // ------------------------------------------------------------------

  const skull = ellipsoid(
    "broadCranium",
    [0, 2.91, 1.7],
    [0.76, 0.83, 0.73],
    FACE,
    head,
    12,
  );

  b.loft(
    [
      { at: [0, 2.75, 1.72], w: 1.23, h: 1.14 },
      { at: [0, 2.59, 2.02], w: 1.12, h: 0.9 },
      { at: [0, 2.48, 2.23], w: 0.78, h: 0.62 },
    ],
    { color: FACE, bone: head, sides: 10, smooth: false, name: "upperJaw" },
  );

  const lowerJaw = b.loft(
    [
      { at: [0, 2.16, 1.54], w: 0.77, h: 0.49 },
      { at: [0, 2.08, 1.91], w: 0.73, h: 0.37 },
      { at: [0, 2.05, 2.22], w: 0.43, h: 0.23 },
    ],
    {
      color: SKIN,
      bone: jaw,
      sides: 8,
      smooth: false,
      name: "lowerJaw",
    },
  );

  b.decal(skull, FOREHEAD_LINES, {
    at: [0, 3.21, 2.33],
    dir: [0, 0.12, 1],
    size: [0.66, 0.57],
    segments: 10,
    name: "foreheadCreases",
  });

  for (const s of [1, -1]) {
    const socketHit = b.surface(skull).nearest([s * 0.59, 2.99, 2.24]);

    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 6).scale(0.142, 0.052, 0.105),
      CREASE,
      socketHit,
      { embed: 0.3, name: s > 0 ? "socketL" : "socketR" },
    );

    const eyeHit = b.surface(socket).nearest(
      socketHit.at.clone().addScaledVector(socketHit.n, 0.08),
    );

    const eye = b.stick(
      new THREE.SphereGeometry(1, 10, 6).scale(0.092, 0.038, 0.068),
      "#343e39",
      eyeHit,
      { embed: 0.35, name: s > 0 ? "eyeL" : "eyeR" },
    );

    b.decal(eye, EYE, {
      at: eye,
      dir: socketHit.n,
      size: [0.181, 0.125],
      segments: 7,
      mirror: s < 0,
      bone: head,
      name: "amberEyeDrawing",
    });

    const brow = b.surface(skull).drape(
      [
        [s * 0.41, 3.11, 2.31],
        [s * 0.57, 3.16, 2.22],
        [s * 0.7, 3.1, 2.08],
      ],
      { lift: 0.017 },
    );
    b.sweep(brow, [0.035, 0.046, 0.024], {
      color: FACE,
      bone: head,
      sides: 6,
      name: "heavyBrow",
    });

    b.decal(skull, CHEEK_LINES, {
      at: [s * 0.66, 2.72, 2.13],
      dir: [s * 0.65, 0, 1],
      size: [0.32, 0.4],
      mirror: s < 0,
      segments: 7,
      name: "cheekFolds",
    });

    const mouthLine = b.surface(lowerJaw).drape([
      [s * 0.34, 2.23, 1.77],
      [s * 0.33, 2.2, 1.98],
      [s * 0.19, 2.14, 2.2],
    ]);
    b.sweep(mouthLine, 0.014, {
      color: MOUTH,
      bone: jaw,
      sides: 5,
      name: "mouthCorner",
    });
  }

  // ------------------------------------------------------------------
  // Main mass. Broad shoulders, high back and a deep, heavy abdomen.
  // ------------------------------------------------------------------

  const body = b.loft(
    [
      { at: [0, 2.24, -1.91], w: 0.86, h: 1.48 },
      { at: [0, 2.25, -1.45], w: 1.69, h: 2.01 },
      { at: [0, 2.23, -0.7], w: 2.05, h: 2.29 },
      { at: [0, 2.31, 0.12], w: 2.13, h: 2.36 },
      { at: [0, 2.45, 0.79], w: 1.94, h: 2.22 },
      { at: [0, 2.5, 1.21], w: 1.25, h: 1.67 },
    ],
    {
      bone: [hips, spine, neck],
      color: SKIN,
      sides: 12,
      smooth: false,
      caps: "round",
      name: "elephantTorso",
    },
  );

  b.sweep(neck, () => [0.58, 0.62], {
    color: SKIN,
    sides: 10,
    smooth: false,
    name: "shortMuscularNeck",
  });

  for (const s of [1, -1]) {
    // A few substantial skin folds, not a coating of tiny ridges.
    for (let k = 0; k < 3; k++) {
      const z = 0.45 - k * 0.115;
      const fold = b.surface(body).drape(
        [
          [s * 0.71, 3.1, z],
          [s * 1.04, 2.77, z + 0.08],
          [s * 1.07, 2.26, z + 0.11],
          [s * 0.91, 1.76, z + 0.18],
        ],
        { lift: 0.005 },
      );
      b.sweep(fold, [0.009, 0.015, 0.014, 0.006], {
        color: CREASE,
        sides: 5,
        name: "shoulderSkinFold",
      });
    }

    for (let k = 0; k < 2; k++) {
      const fold = b.surface(body).drape([
        [s * 0.72, 2.8, -1.53 + k * 0.14],
        [s * 0.94, 2.37, -1.38 + k * 0.13],
        [s * 0.88, 1.89, -1.14 + k * 0.1],
      ]);
      b.sweep(fold, [0.007, 0.014, 0.007], {
        color: CREASE,
        sides: 5,
        name: "haunchCrease",
      });
    }
  }

  // ------------------------------------------------------------------
  // Four columnar legs and broad, flat soles.
  // ------------------------------------------------------------------

  for (const leg of legs) {
    const tube = b.sweep(
      leg.chain,
      leg.front
        ? [0.43, 0.355, 0.285, 0.285]
        : [0.49, 0.38, 0.285, 0.28],
      {
        color: SKIN,
        sides: 10,
        smooth: false,
        caps: "flat",
        name: leg.front ? "frontLegSkin" : "hindLegSkin",
      },
    );

    const footBone = leg.chain.tip!;
    const foot = b.lathe(
      [
        [0, 0],
        [0.28, 0],
        [0.355, 0.055],
        [0.372, 0.18],
        [0.344, 0.34],
        [0.287, 0.48],
        [0, 0.48],
      ],
      {
        at: [leg.x, 0, leg.z],
        axis: [0, 1, 0],
        color: SKIN,
        bone: footBone,
        segments: 12,
        name: "roundFlatFoot",
      },
    );

    b.decal(tube, LEG_LINES, {
      at: [
        leg.side * (leg.front ? 0.81 : 0.82),
        leg.front ? 1.45 : 1.34,
        leg.front ? 1.36 : -0.69,
      ],
      dir: [0, 0, 1],
      size: [0.53, 0.32],
      segments: 7,
      name: "jointWrinkles",
    });

    b.decal(foot, LEG_LINES, {
      at: [leg.x, 0.31, leg.z + 0.35],
      dir: [0, 0, 1],
      size: [0.49, 0.19],
      segments: 7,
      name: "ankleWrinkles",
    });

    const toeAngles = leg.front ? [-62, -21, 21, 62] : [-48, 0, 48];
    for (const angle of toeAngles) {
      const hit = b.surface(foot).around([leg.x, 0.18, leg.z]).at(angle, -8);

      const rim = b.stick(
        new THREE.SphereGeometry(1, 8, 6).scale(0.105, 0.025, 0.122),
        CREASE,
        hit,
        { embed: 0.22, name: "toenailBed" },
      );
      const nailHit = b.surface(rim).nearest(
        hit.at.clone().addScaledVector(hit.n, 0.05),
      );

      const nail = b.stick(
        new THREE.SphereGeometry(1, 8, 6).scale(0.089, 0.023, 0.102),
        NAIL,
        nailHit,
        { embed: 0.38, name: "ivoryGreyToenail" },
      );

      b.decal(nail, NAIL_LINES, {
        at: nail,
        dir: hit.n,
        size: [0.15, 0.18],
        segments: 4,
        bone: footBone,
        name: "toenailGrooves",
      });
    }
  }

  // ------------------------------------------------------------------
  // The great ears: simple angular silhouettes with a shallow fan of
  // broad facets, thickened roots, soft rims and drawn branching folds.
  // ------------------------------------------------------------------

  const earOutline = [
    [0, 0.33],
    [0.35, 0.64],
    [0.83, 0.69],
    [1.21, 0.42],
    [1.47, 0.02],
    [1.43, -0.45],
    [1.2, -0.94],
    [0.79, -1.37],
    [0.44, -1.15],
    [0.25, -0.66],
    [0.035, -0.27],
  ];

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const s = sideIndex === 0 ? 1 : -1;
    const bone = earJoints[sideIndex];

    function ep(u: number, v: number, front = 0) {
      return [
        s * (0.61 + u),
        2.94 + v,
        1.46 - u * 0.23 + front,
      ];
    }

    const outline3 = earOutline.map(([u, v]) => ep(u, v));
    const earBase = b.slab(outline3, {
      thickness: 0.065,
      color: SKIN,
      bone,
      name: s > 0 ? "greatEarL" : "greatEarR",
    });

    const center = ep(0.42, -0.21, 0.088);
    const facets = [];
    for (let i = 0; i < earOutline.length; i++) {
      const next = (i + 1) % earOutline.length;
      const a = earOutline[i];
      const c = earOutline[next];
      facets.push(
        b.slab(
          [
            center,
            ep(a[0], a[1], 0.036),
            ep(c[0], c[1], 0.036),
          ],
          {
            thickness: 0.012,
            color: EAR,
            bone,
            name: "earFanFacet",
          },
        ),
      );
    }

    b.sweep(polyline([...outline3, outline3[0]]), 0.022, {
      bone,
      color: "#7a8580",
      sides: 6,
      name: "earRolledEdge",
    });

    b.sweep(
      catmull([
        ep(0.02, 0.28, 0.04),
        ep(0.14, 0.02, 0.12),
        ep(0.17, -0.37, 0.1),
        ep(0.28, -0.68, 0.04),
      ]),
      [0.076, 0.065, 0.043, 0.015],
      {
        bone,
        color: FACE,
        sides: 7,
        name: "earRootCartilage",
      },
    );

    b.decal([earBase, ...facets], EAR_LINES, {
      at: ep(0.77, -0.28, 0.12),
      dir: [s * 0.23, 0, 1],
      size: [1.12, 1.67],
      mirror: s < 0,
      segments: 12,
      bone,
      name: "earVeinsAndCreases",
    });

    for (const [u, v] of [
      [0.54, 0.58],
      [0.98, 0.48],
      [1.35, 0.0],
      [1.29, -0.49],
      [1.06, -0.92],
      [0.74, -1.22],
    ]) {
      b.sweep(
        [
          ep(u, v, 0.055),
          ep(u - 0.09, v * 0.85, 0.064),
          ep(u - 0.17, v * 0.72, 0.07),
        ],
        [0.008, 0.011, 0.003],
        {
          color: CREASE,
          bone,
          sides: 5,
          name: "earEdgePleat",
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Tusks. Thick at the lips, slender lifted points, visibly independent
  // of the articulated trunk.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const tuskBase = [s * 0.44, 2.3, 2.12];

    b.sweep(
      [
        [s * 0.4, 2.32, 1.99],
        [s * 0.48, 2.23, 2.34],
      ],
      [0.205, 0.175],
      {
        color: FACE,
        bone: head,
        sides: 9,
        name: "tuskLip",
      },
    );

    const tusk = b.sweep(
      bezier(
        tuskBase,
        [s * 0.61, 1.95, 2.65],
        [s * 0.83, 2.02, 3.14],
        [s * 0.83, 2.52, 3.53],
      ),
      [0.158, 0.143, 0.107, 0.062, 0],
      {
        color: IVORY,
        bone: head,
        sides: 10,
        smooth: false,
        caps: "flat",
        name: s > 0 ? "tuskL" : "tuskR",
      },
    );

    for (let i = 0; i < 3; i++) {
      const t = 0.055 + i * 0.036;
      b.sweep(
        [-95, -45, 0, 45, 95].map((a) => tusk.at(t, a, 0.001)),
        0.0035,
        {
          color: "#b7aa8a",
          bone: head,
          sides: 4,
          name: "tuskRootGrowthLine",
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Trunk. Continuous skin with seven rig segments, broad transverse
  // folds and the African elephant's two opposed prehensile fingers.
  // ------------------------------------------------------------------

  const trunkSkin = b.sweep(
    trunk,
    [0.335, 0.291, 0.242, 0.197, 0.158, 0.125, 0.105],
    {
      color: FACE,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "articulatedTrunk",
    },
  );

  for (let i = 0; i < 29; i++) {
    const t = 0.055 + (i / 28) * 0.865;
    const halfArc = i < 18 ? 70 : 85;
    const angles = [-halfArc, -halfArc * 0.5, 0, halfArc * 0.5, halfArc];

    const crease = angles.map((a, j) =>
      trunkSkin.at(
        t + Math.sin(j * 1.7 + i * 0.8) * 0.0023,
        a,
        0.001,
      ),
    );

    b.sweep(crease, 0.0085 - t * 0.0042, {
      color: CREASE,
      sides: 5,
      name: "trunkTransverseFold",
    });

    if (i % 2 === 0) {
      b.sweep(
        angles.map((a) => trunkSkin.at(t - 0.007, a, 0.002)),
        0.0055 - t * 0.002,
        {
          color: LIGHT_CREASE,
          sides: 5,
          name: "trunkFoldLip",
        },
      );
    }
  }

  for (const a of [-104, 104]) {
    b.sweep(trunkSkin.line(a, 0.001).slice(0.15, 0.83), 0.006, {
      color: CREASE,
      sides: 5,
      name: "trunkLongitudinalCrease",
    });
  }

  b.sweep(fingerUpper, [0.057, 0.038, 0.009], {
    color: FACE,
    sides: 7,
    smooth: false,
    name: "upperTrunkFinger",
  });

  b.sweep(fingerLower, [0.047, 0.032, 0.01], {
    color: FACE,
    sides: 7,
    smooth: false,
    name: "lowerTrunkFinger",
  });

  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      DEEP,
      {
        at: [s * 0.043, 0.729, 3.495],
        bone: trunk.joints[6],
        scale: [0.028, 0.043, 0.012],
        dir: [0, 0.36, 1],
        axis: "z",
        name: "trunkNostril",
        flat: true,
      },
    );
  }

  // ------------------------------------------------------------------
  // Tail and sparse coarse hair. The tail is deliberately clear of the
  // hind legs, with a flat, dark terminal brush.
  // ------------------------------------------------------------------

  const tailSkin = b.sweep(tail, [0.105, 0.077, 0.059, 0.037, 0.026], {
    color: SKIN,
    sides: 8,
    smooth: false,
    name: "longTail",
  });

  b.sweep(
    [
      tail.at(0.86),
      [0.18, 1.2, -2.46],
      [0.19, 1.04, -2.49],
    ],
    [0.045, 0.077, 0.012],
    {
      color: HAIR,
      bone: tail.joints[3],
      sides: 7,
      smooth: false,
      name: "tailBrushMass",
    },
  );

  for (let i = 0; i < 11; i++) {
    const fan = (i - 5) / 5;
    b.sweep(
      bezier(
        [0.18 + fan * 0.027, 1.29, -2.44],
        [0.18 + fan * 0.067, 1.13, -2.47],
        [0.18 + fan * 0.09, 1.005 + Math.abs(fan) * 0.055, -2.5],
      ),
      [0.01, 0.002],
      {
        color: i % 3 === 0 ? "#58605a" : HAIR,
        bone: tail.joints[3],
        sides: 4,
        name: "coarseTailBristle",
      },
    );
  }

  // A few short bristles on the crown, seated on its actual surface.
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.075;
    const hit = b.surface(skull).nearest([x, 3.73, 1.7]);
    b.spike(
      hit,
      frame(hit, [x * 0.25, 1, -0.25]),
      0.035 + (i % 3) * 0.009,
      0.004,
      {
        color: HAIR,
        bone: head,
        sides: 4,
        name: "crownBristle",
      },
    );
  }

  // Small folds at the tail root continue the same skin language.
  for (let i = 0; i < 3; i++) {
    b.sweep(
      [-70, -35, 0, 35, 70].map((a) =>
        tailSkin.at(0.11 + i * 0.055, a, 0.001),
      ),
      0.006,
      {
        color: CREASE,
        sides: 5,
        name: "tailRootFold",
      },
    );
  }

  return b.root;
}

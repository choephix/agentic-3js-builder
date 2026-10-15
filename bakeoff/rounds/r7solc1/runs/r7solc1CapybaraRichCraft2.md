```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  mix,
  noise,
  gradient,
} from "agentic-3js-builder";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "A Little Lift",
  description:
    "A wonderfully unhurried capybara carries a tiny turquoise pond companion. Faceted primitive anatomy, properly seated gentle eyes, scalloped bird wings, and a painted lily-pond setting.",
};

/*
 * Art-direction changes:
 * 1. Seat the eyes and brows directly on the skull. The far eye no longer
 *    floats outside the silhouette, and the expression is quieter and kinder.
 * 2. Integrate the cheeks and lower jaw; keep the unmistakable blunt muzzle,
 *    but replace the wide dark mouth gap with a delicate resting smile.
 * 3. Unify the legs and body paint, and simplify the sparse guard hairs.
 *    Warm, broad facets now read as fur rather than scratched bark.
 * 4. Make the passenger slightly smaller, with broad scalloped wing fans,
 *    layered coverts, painted feather tips, and clearly planted little toes.
 * 5. Preserve the restrained pond setting and its excellent clear silhouette.
 */

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "aLittleLift",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(84017);

  const C = {
    bark: "#654a36",
    honey: "#b88c5b",
    pale: "#d9b783",
    cream: "#f4dfad",
    dark: "#322b29",
    gold: "#e9b847",
    teal: "#249eaa",
    turquoise: "#65d4cc",
    blue: "#237080",
    navy: "#224d60",
    orange: "#f39444",
    coral: "#d86c49",
    rim: "#25535a",
    leaf: "#557d53",
    leafLight: "#8eac65",
    reed: "#71916a",
  };

  const coat = paint((p, n) => {
    const variation = noise(p, 0.19, 9);
    const warm = mix("#99734f", "#bd9564", variation);
    const lit = mix(warm, "#d6b17a", Math.max(0, n.y) * 0.24);
    return mix(lit, "#805e46", Math.max(0, -n.y) * 0.22);
  });
  const muzzlePaint = paint((p, n) =>
    mix(
      "#b48f64",
      "#d6b78a",
      0.28 + noise(p, 0.16, 12) * 0.35 + Math.max(0, n.y) * 0.19,
    ),
  );
  const legPaint = gradient(
    coat,
    paint((p, n) =>
      mix(
        "#96734f",
        "#b18d60",
        noise(p, 0.12, 4) * 0.5 + Math.max(0, n.y) * 0.25,
      ),
    ),
    [0, 0.38, 0],
    [0, 0.09, 0],
  );
  const sandPaint = paint((p, n) =>
    mix(
      "#aa9e75",
      "#dacda1",
      0.3 + noise(p, 0.055, 32) * 0.42 + Math.max(0, n.y) * 0.22,
    ),
  );
  const stonePaint = paint((p, n) =>
    mix(
      "#6c8179",
      "#a7b6a0",
      noise(p, 0.07, 6) * 0.6 + Math.max(0, n.y) * 0.3,
    ),
  );
  const featherPaint = paint((_p, _n, s) =>
    mix("#26788c", "#60cfc7", Math.max(0, Math.min(1, s[1] / 0.115))),
  );

  function drawing(w: number, h: number, content: string, size = 256) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${content}</svg>`,
      { size },
    );
  }

  const capyEye = drawing(
    100,
    100,
    `
      <ellipse cx="50" cy="55" rx="43" ry="38" fill="#765139"/>
      <ellipse cx="50" cy="55" rx="34" ry="32" fill="#302b25"/>
      <path d="M22 66 Q49 84 77 64 Q64 85 45 85 Q29 82 22 66Z"
        fill="#966c43"/>
      <ellipse cx="39" cy="43" rx="9" ry="8" fill="#fff5d8"/>
      <circle cx="65" cy="66" r="3.8" fill="#d4bc88"/>
      <path d="M9 38 Q46 17 89 36 L88 17 L10 17Z" fill="#b59161"/>
      <path d="M10 38 Q47 18 89 36" fill="none" stroke="#684a35"
        stroke-width="5" stroke-linecap="round"/>
      <path d="M18 29 Q49 13 79 28" fill="none" stroke="#d8b786"
        stroke-width="4" stroke-linecap="round"/>
    `,
  );

  const noseDrawing = drawing(
    240,
    105,
    `
      <path d="M35 29 Q53 7 73 29 Q57 43 35 29Z" fill="#654d38"/>
      <path d="M167 29 Q187 7 205 29 Q183 43 167 29Z" fill="#654d38"/>
      <path d="M42 22 Q54 16 63 23 M177 23 Q188 16 199 22"
        fill="none" stroke="#e6c796" stroke-width="4" stroke-linecap="round"/>
      <g fill="#8c6949">
        <circle cx="29" cy="61" r="3.2"/><circle cx="53" cy="70" r="3.2"/>
        <circle cx="73" cy="58" r="2.8"/><circle cx="167" cy="58" r="2.8"/>
        <circle cx="187" cy="70" r="3.2"/><circle cx="211" cy="61" r="3.2"/>
      </g>
      <path d="M113 46 Q120 53 127 46" fill="none" stroke="#a17c55"
        stroke-width="3.5" stroke-linecap="round"/>
    `,
    512,
  );

  const innerEar = drawing(
    80,
    96,
    `
      <path d="M18 85 Q5 57 17 28 Q28 6 49 12 Q78 20 65 64 L57 85Z"
        fill="#8c6150"/>
      <path d="M26 76 Q14 47 31 27 Q44 16 57 30 Q66 46 52 76Z"
        fill="#c69378"/>
      <path d="M30 64 Q24 42 38 30" fill="none" stroke="#e0b58d"
        stroke-width="5" stroke-linecap="round"/>
    `,
  );

  const hairDrawing = drawing(
    64,
    64,
    `
      <g fill="none" stroke-linecap="round">
        <path d="M17 58 Q21 39 17 24" stroke="#987346" stroke-width="4"/>
        <path d="M31 59 Q37 32 32 12" stroke="#e2be83" stroke-width="4.5"/>
        <path d="M45 58 Q45 43 49 29" stroke="#ab8653" stroke-width="4"/>
      </g>
    `,
  );

  const cheekDrawing = drawing(
    100,
    80,
    `
      <g fill="none" stroke-linecap="round">
        <path d="M22 35 Q27 44 37 44 M44 32 Q51 42 60 42
                 M64 28 Q70 37 79 37"
          stroke="#96704d" stroke-width="4"/>
        <path d="M28 52 Q34 58 43 57 M51 50 Q57 56 66 54"
          stroke="#d4b17d" stroke-width="4"/>
      </g>
    `,
  );

  const birdEye = drawing(
    100,
    100,
    `
      <circle cx="50" cy="50" r="46" fill="#fff1bc"/>
      <circle cx="50" cy="51" r="35" fill="#203b43"/>
      <circle cx="53" cy="54" r="24" fill="#172d34"/>
      <ellipse cx="40" cy="37" rx="11" ry="13" fill="#ffffff"/>
      <circle cx="64" cy="66" r="5" fill="#a7ece0"/>
      <path d="M16 29 Q45 2 76 22" fill="none" stroke="#245a64"
        stroke-width="6" stroke-linecap="round"/>
    `,
  );

  const breastDrawing = drawing(
    120,
    160,
    `
      <g fill="none" stroke="#ce9c3e" stroke-width="5" stroke-linecap="round">
        <path d="M16 29 Q28 45 40 29 M51 29 Q63 45 75 29 M86 29 Q98 45 110 29"/>
        <path d="M1 62 Q13 78 25 62 M35 62 Q47 78 59 62 M69 62 Q81 78 93 62"/>
        <path d="M18 96 Q30 112 42 96 M53 96 Q65 112 77 96 M88 96 Q100 112 112 96"/>
        <path d="M35 130 Q47 146 59 130 M69 130 Q81 146 93 130"/>
      </g>
      <g fill="#fff1bd">
        <ellipse cx="31" cy="21" rx="5" ry="3"/>
        <ellipse cx="65" cy="88" rx="5" ry="3"/>
      </g>
    `,
  );

  const waterDrawing = drawing(
    600,
    760,
    `
      <rect width="600" height="760" fill="#68aaa4"/>
      <g fill="none" stroke-linecap="round">
        <g stroke="#a6d2bc" stroke-width="4">
          <path d="M49 209 Q99 185 147 207 M36 224 Q98 199 165 225"/>
          <path d="M414 118 Q464 92 523 115 M400 134 Q465 105 542 134"/>
          <path d="M70 580 Q138 548 205 576 M54 600 Q140 565 220 599"/>
          <path d="M391 607 Q451 581 512 609 M375 628 Q448 598 530 632"/>
          <path d="M241 704 Q285 685 326 704"/>
        </g>
        <g stroke="#438c8a" stroke-width="3">
          <path d="M62 239 Q101 225 143 240"/>
          <path d="M431 151 Q471 137 513 151"/>
          <path d="M92 618 Q141 599 186 617"/>
          <path d="M410 646 Q452 630 500 646"/>
        </g>
        <g fill="#d4e4bf" stroke="none">
          <ellipse cx="89" cy="333" rx="4" ry="3"/>
          <ellipse cx="517" cy="450" rx="4" ry="3"/>
          <ellipse cx="364" cy="690" rx="4" ry="3"/>
          <ellipse cx="170" cy="96" rx="4" ry="3"/>
        </g>
      </g>
    `,
    1024,
  );

  const padDrawing = drawing(
    100,
    100,
    `
      <circle cx="50" cy="50" r="49" fill="#74915b"/>
      <path d="M50 50 L18 8 Q34 0 50 1Z" fill="#527a54"/>
      <g stroke="#a9ba74" stroke-width="2.6" fill="none" stroke-linecap="round">
        <path d="M50 50 L87 25 M50 50 L96 53 M50 50 L78 87"/>
        <path d="M50 50 L46 96 M50 50 L13 79 M50 50 L5 42"/>
      </g>
      <path d="M58 8 Q83 13 91 34" stroke="#b6c57d" stroke-width="3" fill="none"/>
    `,
  );

  const plaqueDrawing = drawing(
    340,
    110,
    `
      <rect x="3" y="3" width="334" height="104" rx="24" fill="#315b59"/>
      <rect x="11" y="11" width="318" height="88" rx="18" fill="none"
        stroke="#c6c291" stroke-width="3"/>
      <text x="170" y="49" text-anchor="middle" font-family="Georgia,serif"
        font-size="28" font-weight="bold" fill="#f5e4b3">A LITTLE LIFT</text>
      <path d="M50 70 H111 M229 70 H290" stroke="#c6c291" stroke-width="2.5"/>
      <text x="170" y="80" text-anchor="middle" font-family="Georgia,serif"
        font-size="15" fill="#d4d6ad">pond companions</text>
    `,
    512,
  );

  // Skeleton first.
  const hips = b.joint("hips", {
    at: [0, 0.49, -0.4],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.49, -0.4],
      [0, 0.52, -0.1],
      [0, 0.54, 0.19],
    ],
    {
      parent: hips,
      names: ["spine1", "chest", "withers"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.57, 0.2],
      [0, 0.69, 0.34],
      [0, 0.76, 0.43],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.76, 0.43],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.573, 0.43],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const legSpecs = [
    { side: "L", s: 1, end: "F", z: 0.24, hipZ: 0.22 },
    { side: "R", s: -1, end: "F", z: 0.24, hipZ: 0.22 },
    { side: "L", s: 1, end: "H", z: -0.49, hipZ: -0.43 },
    { side: "R", s: -1, end: "H", z: -0.49, hipZ: -0.43 },
  ];
  const legs = legSpecs.map((spec) => {
    const name = `${spec.end}${spec.side}`;
    const x = spec.s * 0.255;
    const chain = b.chain(
      `leg${name}`,
      [
        [x, 0.465, spec.hipZ],
        [x + spec.s * 0.025, 0.285, spec.z - 0.035],
        [x + spec.s * 0.035, 0.145, spec.z + 0.025],
      ],
      {
        parent: spec.end === "H" ? hips : spine.joints[1],
        names: [`hip${name}`, `knee${name}`, `ankle${name}`],
        role: "leg",
        contact: [x + spec.s * 0.035, 0.082, spec.z + 0.07],
      },
    );
    const toes = [-1, 0, 1].map((i) => {
      const toeX = x + spec.s * 0.035 + i * 0.047;
      return b.chain(
        `toe${name}${i + 2}`,
        [
          [toeX, 0.12, spec.z + 0.055],
          [toeX + i * 0.008, 0.108, spec.z + 0.155 - Math.abs(i) * 0.009],
        ],
        {
          parent: chain.tip!,
          names: [`toe${name}${i + 2}`, `toeTip${name}${i + 2}`],
          role: "digit",
        },
      );
    });
    return { ...spec, x, chain, toes };
  });

  const earBones = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.232, 0.936, 0.313],
      dir: [s * 0.2, 1, 0.08],
      role: "hinge",
    }),
  );

  // One scale controls every piece of the passenger, without scaling bones.
  const BS = 0.86;
  const bird = b.region({
    at: [0, 0.991, 0.414],
    scale: BS,
    bone: head,
  });
  const P = (p: number[]) => bird.p(p);
  const birdRoot = b.joint("birdRoot", {
    parent: head,
    at: P([0, 0.07, -0.015]),
    dir: [0, 1, 0],
    role: "spine",
  });
  const birdSpine = b.chain(
    "birdSpine",
    [
      P([0, 0.085, -0.019]),
      P([0, 0.165, 0.007]),
      P([0, 0.215, 0.039]),
    ],
    {
      parent: birdRoot,
      names: ["birdPelvis", "birdChest", "birdNeckBase"],
      role: "spine",
    },
  );
  const birdNeck = b.chain(
    "birdNeck",
    [P([0, 0.205, 0.031]), P([0, 0.263, 0.064])],
    {
      parent: birdSpine.tip!,
      names: ["birdNeck", "birdNeckTop"],
      role: "neck",
    },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdNeck.tip!,
    at: P([0, 0.265, 0.065]),
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: P([0, 0.247, 0.117]),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const birdTail = b.chain(
    "birdTail",
    [
      P([0, 0.117, -0.069]),
      P([0, 0.135, -0.158]),
      P([0, 0.161, -0.227]),
    ],
    {
      parent: birdRoot,
      names: ["birdTail1", "birdTail2", "birdTailTip"],
      role: "tail",
    },
  );
  const birdSides = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `birdWing${side}`,
      [
        P([s * 0.059, 0.175, -0.01]),
        P([s * 0.124, 0.188, -0.032]),
        P([s * 0.218, 0.199, -0.057]),
      ],
      {
        parent: birdSpine.joints[1],
        names: [
          `birdShoulder${side}`,
          `birdElbow${side}`,
          `birdWrist${side}`,
        ],
        role: "wing",
      },
    );
    const leg = b.chain(
      `birdLeg${side}`,
      [
        P([s * 0.035, 0.093, -0.005]),
        P([s * 0.038, 0.047, -0.013]),
        P([s * 0.043, 0.003, 0.019]),
      ],
      {
        parent: birdRoot,
        names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`],
        role: "leg",
        contact: P([s * 0.043, 0, 0.019]),
      },
    );
    const digits = [-1, 0, 1].map((i) =>
      b.chain(
        `birdToe${side}${i + 2}`,
        [
          P([s * 0.043, 0.005, 0.018]),
          P([
            s * 0.043 + i * 0.019,
            -0.001,
            0.065 - Math.abs(i) * 0.011,
          ]),
        ],
        {
          parent: leg.tip!,
          names: [`birdToe${side}${i + 2}`],
          role: "digit",
        },
      ),
    );
    const backToe = b.chain(
      `birdBackToe${side}`,
      [
        P([s * 0.043, 0.004, 0.014]),
        P([s * 0.048, -0.001, -0.015]),
      ],
      { parent: leg.tip!, role: "digit" },
    );
    return { s, side, wing, leg, digits, backToe };
  });

  function ellipsoid(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint = hips,
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at,
      scale: size,
      bone,
      name,
      flat: true,
    });
  }

  function birdEllipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    return ellipsoid(
      P(at),
      size.map((v) => v * BS),
      color,
      bone,
      name,
    );
  }

  function pebble(at: number[], size: number[], color: Fill = stonePaint) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      at,
      scale: size,
      bone: hips,
      rotation: [0, random() * 160, 0],
      flat: true,
    });
  }

  // Low, quiet framing. Nothing obscures the animal from the front.
  b.part(new THREE.CylinderGeometry(1, 0.97, 0.05, 48), C.rim, {
    at: [0, 0.025, 0],
    scale: [0.72, 1, 0.925],
    bone: hips,
    name: "pondPlinth",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 48), "#92b5a0", {
    at: [0, 0.049, 0],
    scale: [0.715, 1, 0.919],
    bone: hips,
    name: "pondRim",
  });
  b.part(new THREE.CircleGeometry(1, 48), "#ffffff", {
    at: [0, 0.056, 0],
    rotation: [-90, 0, 0],
    scale: [0.702, 0.905, 1],
    texture: waterDrawing,
    bone: hips,
    name: "paintedPond",
  });
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.028, 24), sandPaint, {
    at: [0, 0.068, -0.015],
    scale: [0.435, 1, 0.715],
    bone: hips,
    name: "sandbar",
  });
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    pebble(
      [
        Math.cos(a) * (0.413 + random() * 0.016),
        0.084,
        Math.sin(a) * 0.666 - 0.015,
      ],
      [
        0.024 + random() * 0.017,
        0.012 + random() * 0.008,
        0.035 + random() * 0.025,
      ],
      i % 3 === 0 ? sandPaint : stonePaint,
    );
  }

  const body = b.sweep(
    spine,
    (t) => [
      0.305 + Math.sin(t * Math.PI) * 0.035,
      0.282 + Math.sin(t * Math.PI) * 0.015,
    ],
    {
      color: coat,
      sides: 12,
      smooth: false,
      caps: "round",
      name: "capybaraLoaf",
    },
  );
  b.sweep(neck, [0.242, 0.225], {
    color: coat,
    sides: 10,
    smooth: false,
    name: "thickNeck",
  });

  const H = 1;
  const face = b.region({ at: head, scale: H, bone: head });
  const skull = ellipsoid(
    face.p([0, 0, 0]),
    [0.285 * H, 0.239 * H, 0.302 * H],
    coat,
    head,
    "capybaraSkull",
  );
  const headSkin = b.surface(skull);

  const muzzle = b.extrude(
    [
      [-0.189, -0.105],
      [0.189, -0.105],
      [0.242, -0.065],
      [0.248, 0.074],
      [0.197, 0.126],
      [-0.197, 0.126],
      [-0.248, 0.074],
      [-0.242, -0.065],
    ],
    {
      at: face.p([0, -0.085, 0.226]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.432,
      bevel: 0.045,
      color: muzzlePaint,
      bone: head,
      name: "broadBluntMuzzle",
    },
  );
  const lowerJaw = b.extrude(
    [
      [-0.186, -0.034],
      [0.186, -0.034],
      [0.217, -0.008],
      [0.211, 0.034],
      [-0.211, 0.034],
      [-0.217, -0.008],
    ],
    {
      at: [0, 0.574, 0.668],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.391,
      bevel: 0.019,
      color: muzzlePaint,
      bone: jaw,
      name: "separateLowerJaw",
    },
  );
  b.decal(muzzle, noseDrawing, {
    at: [0, 0.709, 0.88],
    dir: [0, 0, 1],
    size: [0.389, 0.168],
    segments: 10,
    lift: 0.002,
    bone: head,
    name: "nostrilsAndWhiskerPores",
  });

  const smile = b.surface(lowerJaw).drape(
    [
      [-0.187, 0.6, 0.847],
      [-0.103, 0.599, 0.863],
      [0, 0.596, 0.865],
      [0.103, 0.599, 0.863],
      [0.187, 0.6, 0.847],
    ],
    { lift: 0.001 },
  );
  b.sweep(smile, 0.0025, {
    color: "#846345",
    bone: jaw,
    sides: 6,
    name: "quietSmile",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.017, 0.009, 0.006), "#e4d1a2", {
      at: [s * 0.0095, 0.598, 0.865],
      bone: jaw,
      name: `incisor${s > 0 ? "L" : "R"}`,
    });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSkin.around(head.at).at(s * 44, 17);
    if (hit) {
      // Local +Y is the surface normal: a shallow lens, not a detached ball.
      const eye = b.stick(
        new THREE.SphereGeometry(1, 12, 8),
        "#745137",
        hit,
        {
          scale: [0.035, 0.013, 0.038],
          embed: 0.38,
          flow: [0, 1, 0],
          bone: head,
          name: `seatedEye${side}`,
        },
      );
      b.decal(eye, capyEye, {
        at: hit,
        dir: hit.n,
        size: [0.06, 0.064],
        up: [0, 1, 0],
        segments: 8,
        lift: 0.001,
        bone: head,
        name: `capyEye${side}`,
      });

      const brow = headSkin.drape(
        [
          hit.local([-0.035, 0, 0.035]),
          hit.local([0, 0, 0.045]),
          hit.local([0.035, 0, 0.034]),
        ],
        { lift: 0.002 },
      );
      b.sweep(brow, [0.0075, 0.009, 0.006], {
        color: coat,
        bone: head,
        sides: 6,
        name: `gentleBrow${side}`,
      });
    }

    const cheek = headSkin.around(head.at).at(s * 67, -11);
    if (cheek) {
      b.decal(skull, cheekDrawing, {
        at: cheek,
        size: [0.083, 0.058],
        segments: 6,
        lift: 0.001,
        bone: head,
        name: `paintedCheek${side}`,
      });
    }

    for (let i = 0; i < 3; i++) {
      const start = [
        s * (0.201 + i * 0.008),
        0.654 + i * 0.018,
        0.835 - i * 0.008,
      ];
      const tip = [
        s * (0.291 + i * 0.011),
        0.654 + i * 0.023,
        0.868 - i * 0.012,
      ];
      b.sweep(
        bezier(
          start,
          [s * 0.262, 0.655 + i * 0.025, 0.859 - i * 0.008],
          tip,
        ),
        [0.0016, 0.00065],
        {
          color: "#dbc08d",
          bone: head,
          sides: 5,
          name: `whisker${side}${i + 1}`,
        },
      );
    }
  }

  for (let k = 0; k < earBones.length; k++) {
    const s = k === 0 ? 1 : -1;
    const earBone = earBones[k];
    const ear = b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
      at: [s * 0.238, 0.965, 0.31],
      scale: [0.074, 0.081, 0.043],
      rotation: [0, s * 13, s * -18],
      bone: earBone,
      name: `roundedEar${s > 0 ? "L" : "R"}`,
      flat: true,
    });
    b.decal(ear, innerEar, {
      at: [s * 0.24, 0.97, 0.357],
      dir: [s * 0.12, 0, 1],
      size: [0.083, 0.104],
      roll: s * -15,
      segments: 7,
      lift: 0.0015,
      bone: earBone,
      name: `earVelvet${k}`,
    });
  }

  for (const leg of legs) {
    const name = `${leg.end}${leg.side}`;
    b.sweep(leg.chain, [0.105, 0.09, 0.068], {
      color: legPaint,
      sides: 8,
      smooth: false,
      name: `sturdyLeg${name}`,
    });
    ellipsoid(
      [leg.x + leg.s * 0.035, 0.133, leg.z + 0.058],
      [0.102, 0.054, 0.111],
      legPaint,
      leg.chain.tip!,
      `palm${name}`,
    );
    for (let i = 0; i < leg.toes.length; i++) {
      const toe = leg.toes[i];
      b.sweep(toe, [0.028, 0.023], {
        color: legPaint,
        sides: 6,
        caps: "round",
        name: `roundedToe${name}${i}`,
      });
      const tip = toe.at(1).at;
      ellipsoid(
        [tip.x, tip.y + 0.006, tip.z + 0.014],
        [0.018, 0.012, 0.019],
        "#bbab88",
        toe.tip!,
        `flatNail${name}${i}`,
      );
      b.sweep(
        [
          [tip.x - 0.014, tip.y + 0.02, tip.z - 0.014],
          [tip.x + 0.014, tip.y + 0.02, tip.z - 0.014],
        ],
        0.0016,
        {
          color: "#806043",
          bone: toe.joints[0],
          sides: 5,
          name: `toeCrease${name}${i}`,
        },
      );
    }
  }

  const bodySurface = b.surface(body);
  const tuftHits = bodySurface.scatter(16, {
    rng: random,
    minDist: 0.12,
    filter: (h) => h.n.y > 0.35 && h.at.z < 0.1,
  });
  for (let i = 0; i < tuftHits.length; i++) {
    b.stick(new THREE.ConeGeometry(0.017, 0.046, 4), coat, tuftHits[i], {
      embed: 0.7,
      scale: [1, 0.65, 0.5],
      flow: [0, 0.1, -1],
      name: `coatFacet${i}`,
    });
  }
  const hairs = bodySurface.scatter(36, {
    rng: rng(271),
    minDist: 0.065,
    filter: (h) => h.n.y > -0.1,
  });
  b.cards(hairs, hairDrawing, {
    size: [0.03, 0.041],
    lean: 87,
    bend: 0,
    flow: [0, -0.1, -1],
    vary: 0.2,
    rng: rng(331),
    sink: 0.08,
    name: "sparsePaintedGuardHairs",
  });

  // The little passenger.
  const birdBody = birdEllipsoid(
    [0, 0.142, -0.01],
    [0.077, 0.104, 0.088],
    C.teal,
    birdSpine.joints[0],
    "birdBody",
  );
  birdEllipsoid(
    [0, 0.174, 0.032],
    [0.061, 0.075, 0.061],
    C.gold,
    birdSpine.joints[1],
    "goldenBreast",
  );
  const bib = birdEllipsoid(
    [0, 0.153, 0.053],
    [0.058, 0.076, 0.037],
    "#efd078",
    birdSpine.joints[1],
    "birdBib",
  );
  b.decal(bib, breastDrawing, {
    at: P([0, 0.155, 0.092]),
    dir: [0, 0, 1],
    size: [0.089 * BS, 0.119 * BS],
    lift: 0.001,
    segments: 7,
    name: "breastScallops",
  });
  b.sweep(birdNeck, [0.041 * BS, 0.046 * BS], {
    color: C.turquoise,
    sides: 8,
    name: "birdNeckVolume",
  });
  const littleHead = birdEllipsoid(
    [0, 0.265, 0.065],
    [0.069, 0.069, 0.064],
    C.turquoise,
    birdHead,
    "birdRoundHead",
  );

  const littleHeadSkin = b.surface(littleHead);
  for (const s of [1, -1]) {
    const hit = littleHeadSkin
      .around(P([0, 0.265, 0.065]))
      .at(s * 43, 8);
    if (hit) {
      const eye = b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        C.navy,
        hit,
        {
          scale: [0.024 * BS, 0.009 * BS, 0.028 * BS],
          embed: 0.3,
          flow: [0, 1, 0],
          bone: birdHead,
          name: `birdEyeSocket${s > 0 ? "L" : "R"}`,
        },
      );
      b.decal(eye, birdEye, {
        at: hit,
        dir: hit.n,
        size: [0.043 * BS, 0.05 * BS],
        segments: 6,
        lift: 0.0008,
        bone: birdHead,
        name: `birdEye${s > 0 ? "L" : "R"}`,
      });
    }
    birdEllipsoid(
      [s * 0.05, 0.245, 0.108],
      [0.014, 0.008, 0.006],
      "#edb466",
      birdHead,
      `birdCheek${s > 0 ? "L" : "R"}`,
    );
  }

  b.extrude(
    [
      [-0.028 * BS, 0],
      [0.028 * BS, 0],
      [0.019 * BS, 0.024 * BS],
      [0, 0.036 * BS],
      [-0.019 * BS, 0.024 * BS],
    ],
    {
      at: P([0, 0.248, 0.134]),
      x: [1, 0, 0],
      y: [0, 0.4, 1],
      thickness: 0.017 * BS,
      bevel: 0.003 * BS,
      color: C.orange,
      bone: birdHead,
      name: "birdUpperBeak",
    },
  );
  b.extrude(
    [
      [-0.024 * BS, 0],
      [0.024 * BS, 0],
      [0.013 * BS, 0.028 * BS],
      [0, 0.034 * BS],
      [-0.013 * BS, 0.028 * BS],
    ],
    {
      at: P([0, 0.242, 0.133]),
      x: [1, 0, 0],
      y: [0, -0.15, 1],
      thickness: 0.009 * BS,
      bevel: 0.002 * BS,
      color: C.coral,
      bone: birdJaw,
      name: "birdLowerBeak",
    },
  );

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.022;
    b.sweep(
      bezier(
        P([x * 0.6, 0.318, 0.048]),
        P([x, 0.367 + (i === 1 ? 0.008 : 0), 0.041]),
        P([x * 1.7, 0.37 + (i === 1 ? 0.019 : 0), 0.021]),
      ),
      [0.013 * BS, 0],
      {
        color: i === 1 ? C.gold : C.teal,
        bone: birdHead,
        sides: 5,
        caps: "flat",
        name: `birdCrest${i}`,
      },
    );
  }

  for (const side of birdSides) {
    b.sweep(side.leg, 0.0065 * BS, {
      color: C.orange,
      sides: 6,
      name: `birdShin${side.side}`,
    });
    for (let i = 0; i < side.digits.length; i++) {
      b.sweep(side.digits[i], [0.0045 * BS, 0.003 * BS], {
        color: C.orange,
        sides: 5,
        caps: "round",
        name: `birdSpreadToe${side.side}${i}`,
      });
    }
    b.sweep(side.backToe, [0.004 * BS, 0.0025 * BS], {
      color: C.orange,
      sides: 5,
      name: `birdBackToeVolume${side.side}`,
    });

    b.sweep(side.wing, [0.024 * BS, 0.017 * BS, 0.007 * BS], {
      color: C.teal,
      sides: 6,
      caps: "round",
      name: `birdWingSpar${side.side}`,
    });

    // A continuous fan underneath separate feathers keeps the wing readable.
    const trailing = [
      P([side.s * 0.063, 0.116, -0.065]),
      P([side.s * 0.15, 0.128, -0.139]),
      P([side.s * 0.246, 0.145, -0.15]),
    ];
    b.membrane(side.wing, trailing, {
      color: C.blue,
      thickness: 0.006 * BS,
      rows: 3,
      cols: 8,
      bone: side.wing,
      name: `birdWingFan${side.side}`,
    });

    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const root = side.wing.at(t);
      const length = (0.078 + t * 0.035) * BS;
      const width = 0.019 * BS;
      const feather = b.extrude(
        [
          [-width * 0.7, 0],
          [width * 0.7, 0],
          [width, length * 0.67],
          [width * 0.5, length * 0.94],
          [0, length],
          [-width * 0.62, length * 0.94],
          [-width, length * 0.64],
        ],
        {
          at: root,
          x: [side.s, 0, 0],
          y: [side.s * 0.27, -0.53, -1],
          thickness: [0.009 * BS, 0.004 * BS],
          bevel: 0.0015 * BS,
          color: i % 2 === 0 ? C.blue : featherPaint,
          bone: root.bone!,
          name: `flightFeather${side.side}${i}`,
        },
      );

      // Both surfaces receive aligned quills and warm pale terminal bars.
      for (const faceSign of [-1, 1]) {
        b.sweep(
          [
            feather.local([0, length * 0.12, faceSign * 0.0045 * BS]),
            feather.local([0, length * 0.83, faceSign * 0.003 * BS]),
          ],
          [0.0016 * BS, 0.0008 * BS],
          {
            color: "#83d9cd",
            bone: root.bone!,
            sides: 5,
            name: `featherQuill${side.side}${i}_${faceSign}`,
          },
        );
        b.sweep(
          [
            feather.local([-width * 0.49, length * 0.84, faceSign * 0.0035 * BS]),
            feather.local([0, length * 0.88, faceSign * 0.0035 * BS]),
            feather.local([width * 0.49, length * 0.84, faceSign * 0.0035 * BS]),
          ],
          0.0028 * BS,
          {
            color: "#d2e7b8",
            bone: root.bone!,
            sides: 5,
            name: `featherTipBar${side.side}${i}_${faceSign}`,
          },
        );
      }
    }

    for (let i = 0; i < 5; i++) {
      const root = side.wing.at((i + 0.45) / 5);
      b.part(new THREE.SphereGeometry(1, 8, 6), i % 2 ? C.teal : C.turquoise, {
        at: [
          root.at.x,
          root.at.y + 0.003 * BS,
          root.at.z - 0.015 * BS,
        ],
        scale: [0.023 * BS, 0.014 * BS, 0.033 * BS],
        bone: root.bone!,
        name: `wingCovert${side.side}${i}`,
        flat: true,
      });
    }
  }

  b.sweep(birdTail, [0.021 * BS, 0.013 * BS, 0.003 * BS], {
    color: C.blue,
    sides: 6,
    name: "birdTailSpar",
  });
  for (let i = -1; i <= 1; i++) {
    b.extrude(
      [
        [-0.013 * BS, 0],
        [0.013 * BS, 0],
        [0.017 * BS, 0.11 * BS],
        [0.009 * BS, 0.14 * BS],
        [-0.009 * BS, 0.14 * BS],
        [-0.017 * BS, 0.11 * BS],
      ],
      {
        at: P([i * 0.016, 0.122, -0.096]),
        x: [1, 0, 0],
        y: [i * 0.18, 0.25, -1],
        thickness: 0.007 * BS,
        bevel: 0.002 * BS,
        color: i === 0 ? C.turquoise : C.blue,
        bone: birdTail.joints[0],
        name: `birdTailFeather${i + 1}`,
      },
    );
  }

  const birdSkin = b.surface(birdBody);
  for (const s of [1, -1]) {
    const hit = birdSkin.around(P([0, 0.142, -0.01])).at(s * 105, 15);
    if (hit) {
      b.stick(new THREE.SphereGeometry(1, 8, 6), C.turquoise, hit, {
        scale: [0.031 * BS, 0.008 * BS, 0.033 * BS],
        embed: 0.45,
        name: `birdShoulderSpot${s > 0 ? "L" : "R"}`,
      });
    }
  }

  function reedCluster(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const dx = (random() - 0.5) * 0.09;
      const dz = (random() - 0.5) * 0.09;
      const height = 0.2 + random() * 0.14;
      const lean = (random() - 0.5) * 0.06;
      const start = [x + dx, 0.057, z + dz];
      const top = [x + dx + lean, 0.057 + height, z + dz - 0.015];
      b.sweep(
        bezier(start, [x + dx, height * 0.7, z + dz], top),
        [0.004, 0.0025],
        {
          color: C.reed,
          bone: hips,
          sides: 5,
          name: `reedStem_${x}_${i}`,
        },
      );
      if (i % 2 === 0) {
        b.capsule(
          top,
          [top[0] + lean * 0.15, top[1] + 0.056, top[2]],
          0.011,
          {
            color: "#796044",
            bone: hips,
            sides: 6,
            name: `cattail_${x}_${i}`,
          },
        );
        b.rod(
          [top[0] + lean * 0.15, top[1] + 0.052, top[2]],
          [top[0] + lean * 0.2, top[1] + 0.084, top[2]],
          0.0018,
          { color: "#bfa774", bone: hips, sides: 5 },
        );
      }
      for (const s of [1, -1]) {
        b.extrude(
          [
            [0, 0],
            [0.014, 0.04],
            [0.012, 0.11],
            [0, 0.17],
            [-0.005, 0.07],
          ],
          {
            at: [x + dx, 0.062, z + dz],
            x: [0, 0, s],
            y: [s * 0.34, 1, -0.1],
            thickness: 0.0025,
            color: s > 0 ? C.leafLight : C.reed,
            bone: hips,
            name: `reedBlade_${x}_${i}_${s}`,
          },
        );
      }
    }
  }
  reedCluster(-0.5, -0.52, 4);
  reedCluster(0.51, -0.42, 3);

  function lilyPad(x: number, z: number, radius: number, turn: number) {
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.96, 0.008, 16),
      C.leaf,
      {
        at: [x, 0.061, z],
        bone: hips,
        name: "lilyPadEdge",
      },
    );
    b.part(new THREE.CircleGeometry(radius, 24), "#ffffff", {
      at: [x, 0.066, z],
      rotation: [-90, 0, turn],
      texture: padDrawing,
      bone: hips,
      name: "paintedLilyPad",
    });
  }
  lilyPad(-0.499, 0.475, 0.098, 23);
  lilyPad(-0.555, 0.299, 0.075, -40);
  lilyPad(0.515, 0.496, 0.103, 130);
  lilyPad(0.409, 0.696, 0.066, 65);
  lilyPad(0.282, -0.765, 0.075, -80);

  function waterLily(x: number, z: number) {
    b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.018, 8), C.leaf, {
      at: [x, 0.074, z],
      bone: hips,
    });
    for (let layer = 0; layer < 2; layer++) {
      const count = layer === 0 ? 7 : 5;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + layer * 0.3;
        const r = layer === 0 ? 0.026 : 0.017;
        b.part(
          new THREE.SphereGeometry(1, 8, 6),
          layer === 0 ? "#efd7bc" : "#fff1ca",
          {
            at: [
              x + Math.sin(a) * r,
              0.085 + layer * 0.013,
              z + Math.cos(a) * r,
            ],
            scale: [
              0.016,
              0.009 + layer * 0.004,
              layer === 0 ? 0.041 : 0.029,
            ],
            rotation: [
              layer === 0 ? -13 : -29,
              (a * 180) / Math.PI,
              0,
            ],
            bone: hips,
            name: `lilyPetal${layer}_${i}`,
            flat: true,
          },
        );
      }
    }
    b.part(new THREE.SphereGeometry(0.017, 8, 6), C.gold, {
      at: [x, 0.114, z],
      scale: [1, 0.65, 1],
      bone: hips,
      name: "lilyPollen",
    });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ellipsoid(
        [x + Math.cos(a) * 0.012, 0.123, z + Math.sin(a) * 0.012],
        [0.003, 0.004, 0.003],
        "#ffe8a1",
        hips,
        `pollenDot${i}`,
      );
    }
  }
  waterLily(-0.501, 0.474);

  b.part(new THREE.BoxGeometry(0.281, 0.017, 0.093), "#b5af83", {
    at: [-0.095, 0.067, 0.795],
    bone: hips,
    name: "plaqueBacking",
  });
  b.part(new THREE.PlaneGeometry(0.27, 0.087), "#ffffff", {
    at: [-0.095, 0.076, 0.795],
    rotation: [-90, 0, 0],
    texture: plaqueDrawing,
    bone: hips,
    name: "littleLiftPlaque",
  });

  for (const p of [
    [-0.605, 0.058, -0.062],
    [0.58, 0.058, 0.183],
    [0.188, 0.058, -0.831],
  ]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.009), "#f3dc8f", {
        at: p,
        scale: [1, 0.12, 1.7],
        bone: hips,
        name: "sunlitWaterGlint",
      }),
      0.6,
    );
  }

  skull.mesh.userData.subject = "capybara";
  littleHead.mesh.userData.subject = "bird";
  return b.root;
}
```
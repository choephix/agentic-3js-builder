```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  paint,
  mix,
  noise,
  svg,
  type Paint,
  type Joint,
} from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Windrest Red Panda",
  description:
    "A bright-eyed red panda finding its balance on an ancient mossy stone. Cel-painted russet fur, a sweeping ringed tail, jade-and-gold woodland ornaments, and tiny luminous blue flowers evoke a storybook fantasy wilderness.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Windrest Red Panda",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(7319);

  type P = [number, number, number];
  type Fill = string | Paint;

  const C = {
    ink: "#252432",
    nose: "#302733",
    gold: "#eabd63",
    paleGold: "#ffe7a0",
    jade: "#247f79",
    mint: "#94efd4",
    mossDark: "#33554b",
    moss: "#63834d",
    mossLight: "#a4b86b",
    blue: "#70d4ed",
    white: "#fff8dc",
  };

  const RUST = cel("#d96438", "#a23e35");
  const SUN = cel("#ed8242", "#b74b35");
  const DARK_RUST = cel("#a84332", "#753238");
  const TAIL_GOLD = cel("#ed9a55", "#bc6244");
  const TAIL_RED = cel("#a84935", "#79333a");
  const CREAM = cel("#fff0ce", "#d3b89a");
  const PALE = cel("#fff7df", "#d6c4a9");
  const SOCK = cel("#34323e", "#202532");
  const SOCK_LIGHT = cel("#48404a", "#292a37");
  const TEAL = cel("#3a9c8d", "#236064");
  const TEAL_DARK = cel("#226c69", "#20464f");
  const GOLD = cel("#edc76d", "#a47b48");
  const MOSS = cel("#7f9b55", "#435f49");
  const MOSS_LIGHT = cel("#adc16f", "#65874f");
  const LEAF = cel("#539577", "#2d625c");

  const stonePaint = paint((p, n) => {
    const cloud = noise(p, 0.16, 9);
    let stone = mix("#354655", "#78858b", cloud * 0.65 + Math.max(0, n.y) * 0.2);
    if (n.y > 0.65) {
      const mossiness = noise(p, 0.13, 17);
      if (mossiness > 0.43) {
        return mix("#52704c", "#96a765", (mossiness - 0.43) * 2.5);
      }
      stone = mix(stone, "#9aa493", 0.25);
    }
    if (p.y < 0.065) stone = mix(stone, "#243644", 0.45);
    return stone;
  });

  const clothPaint = paint((p, n) => {
    const weave = Math.sin(p.x * 780) * Math.sin(p.y * 780);
    const lit = n.z > 0.4 ? "#398f82" : "#245e65";
    return mix(lit, "#a8d8b5", weave > 0.7 ? 0.13 : 0);
  });

  // Six small drawings supply the finer fantasy detailing.
  const eyeTexture = svg(
    `<svg viewBox="0 0 100 116">
      <defs>
        <clipPath id="eye"><path d="M13 57 C12 18 36 9 55 13 C84 15 92 38 89 65 C86 94 67 106 47 103 C22 100 13 82 13 57Z"/></clipPath>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5b6b40"/>
          <stop offset=".43" stop-color="#b8a34b"/>
          <stop offset=".73" stop-color="#efcc69"/>
          <stop offset="1" stop-color="#fff0ae"/>
        </linearGradient>
      </defs>
      <path d="M9 57 C8 15 34 3 57 8 C90 12 97 38 93 67 C90 101 66 113 44 108 C18 104 8 85 9 57Z" fill="#292837"/>
      <g clip-path="url(#eye)">
        <rect width="100" height="116" fill="#fff2cb"/>
        <ellipse cx="53" cy="59" rx="32" ry="47" fill="url(#iris)"/>
        <path d="M24 78 Q53 99 82 75 L82 97 L23 99Z" fill="#f6d87b"/>
        <ellipse cx="54" cy="55" rx="14" ry="30" fill="#273b38"/>
        <path d="M29 88 L36 82 M42 96 L44 86 M65 94 L63 85 M77 84 L71 79" stroke="#fff5b7" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="37" cy="35" rx="12" ry="16" fill="#ffffff"/>
        <ellipse cx="72" cy="77" rx="6" ry="8" fill="#ffffff"/>
        <circle cx="77" cy="61" r="3" fill="#d2fff3"/>
      </g>
      <path d="M12 40 Q19 9 52 9 Q80 8 91 35" fill="none" stroke="#292837" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 80 112">
      <path d="M40 108 C34 90 13 80 15 63 C17 49 30 45 28 26
               C37 31 39 39 39 48 C49 36 48 20 43 5
               C65 26 73 48 61 69 C54 81 44 90 40 108Z"
            fill="#fff1d1"/>
      <path d="M40 100 Q35 77 42 62 Q50 46 47 30" fill="none"
            stroke="#ffd693" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const embroideryTexture = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M9 14 L80 166 L151 14" fill="none" stroke="#163e49" stroke-width="12" stroke-linejoin="round"/>
      <path d="M14 14 L80 154 L146 14" fill="none" stroke="#f1cc75" stroke-width="5"/>
      <path d="M29 30 L80 137 L131 30" fill="none" stroke="#b4e6c9" stroke-width="3" stroke-dasharray="7 8"/>
      <path d="M80 39 C55 52 49 76 80 100 C111 76 105 52 80 39Z"
            fill="#154b53" stroke="#f4d483" stroke-width="4"/>
      <path d="M80 89 L80 51 M80 76 L66 65 M80 69 L92 58"
            fill="none" stroke="#a8edce" stroke-width="5" stroke-linecap="round"/>
      <circle cx="80" cy="118" r="4" fill="#ffe9ac"/>
    </svg>`,
    { size: 384 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 240 110">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 77 H55 L69 62 M221 77 H185 L171 62" stroke="#183b42" stroke-width="9"/>
        <path d="M19 75 H55 L69 60 M221 75 H185 L171 60" stroke="#78ae9a" stroke-width="3"/>
        <path d="M120 94 C111 70 75 64 83 38 C90 18 115 25 120 43
                 C126 22 149 19 157 38 C167 65 130 73 120 94Z"
              stroke="#183b42" stroke-width="12"/>
        <path d="M120 89 C112 68 82 61 87 40 C92 25 111 28 120 50
                 C129 28 147 26 153 40 C159 62 128 70 120 89Z"
              stroke="#9fe1bf" stroke-width="4"/>
        <path d="M120 83 V53 M120 67 L105 53 M120 67 L135 53"
              stroke="#b7f1d2" stroke-width="4"/>
        <path d="M54 28 L64 38 L54 48 L44 38Z M186 28 L196 38 L186 48 L176 38Z"
              stroke="#7daf99" stroke-width="4"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const groundLeafTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 112 C26 101 7 76 11 46 C16 16 48 11 84 4
               C90 40 91 71 67 95Z" fill="#466d51" stroke="#254c47" stroke-width="5"/>
      <path d="M50 108 Q55 60 81 13 C47 21 27 41 25 62 C24 83 37 96 50 108Z" fill="#a3bb68"/>
      <path d="M48 110 Q51 66 80 15 M55 80 L31 59 M63 58 L42 40 M57 72 L78 59"
            stroke="#e0d68e" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 100">
      <g stroke="#347e9d" stroke-width="3" stroke-linejoin="round">
        <path d="M50 48 C26 36 30 6 47 5 C63 3 70 30 50 48Z" fill="#b4f6f5"/>
        <path d="M51 49 C54 20 84 14 93 28 C103 44 79 59 51 49Z" fill="#8de7ef"/>
        <path d="M51 51 C80 47 96 71 83 85 C70 98 51 78 51 51Z" fill="#73cce9"/>
        <path d="M49 51 C66 75 49 99 33 93 C16 86 26 62 49 51Z" fill="#a0e6f3"/>
        <path d="M48 49 C23 66 1 48 8 33 C15 17 40 27 48 49Z" fill="#d1fcf5"/>
      </g>
      <circle cx="50" cy="50" r="12" fill="#fff0ac" stroke="#548e92" stroke-width="3"/>
      <circle cx="47" cy="46" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton: a broad, steady four-footed balance pose, with an unobstructed face.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.535, -0.30],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.535, -0.30],
      [0, 0.57, -0.07],
      [0, 0.59, 0.115],
    ],
    { parent: hips, names: ["spine1", "chest", "withers"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.59, 0.10],
      [0, 0.655, 0.23],
      [0, 0.715, 0.30],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.727, 0.315],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.652, 0.395],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const earJoints = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.143, 0.835, 0.292],
      dir: [s * 0.28, 1, 0],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.55, -0.405],
      [0.10, 0.53, -0.61],
      [0.31, 0.49, -0.75],
      [0.55, 0.505, -0.72],
      [0.735, 0.565, -0.565],
      [0.80, 0.645, -0.425],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  const legs: {
    side: number;
    front: boolean;
    chain: ReturnType<typeof b.chain>;
    foot: P;
    toes: { joint: Joint; start: P; end: P }[];
  }[] = [];

  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const tag = `${front ? "F" : "H"}${s === 1 ? "L" : "R"}`;
      const shoulder: P = front
        ? [s * 0.125, 0.57, 0.10]
        : [s * 0.135, 0.52, -0.305];
      const knee: P = front
        ? [s * 0.165, 0.407, 0.16]
        : [s * 0.205, 0.395, -0.265];
      const foot: P = front
        ? [s * 0.19, 0.27, 0.225]
        : [s * 0.205, 0.27, -0.335];

      const chain = b.chain(`leg${tag}`, [shoulder, knee, foot], {
        parent: front ? spine.tip! : hips,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`]
          : [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [foot[0], 0.22, foot[2] + 0.035],
      });

      const toes: { joint: Joint; start: P; end: P }[] = [];
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 0.038;
        const start: P = [foot[0] + dx, 0.26, foot[2] + 0.04];
        const end: P = [
          foot[0] + dx * 1.15,
          0.249,
          foot[2] + 0.108 - Math.abs(i - 1) * 0.007,
        ];
        const joint = b.joint(`toe${tag}${i + 1}`, {
          parent: chain.tip!,
          at: start,
          aim: end,
          role: "digit",
        });
        toes.push({ joint, start, end });
      }
      legs.push({ side: s, front, chain, foot, toes });
    }
  }

  // ---------------------------------------------------------------------------
  // Primitive helpers, all geometry entering through the builder.
  // ---------------------------------------------------------------------------
  function ellipsoid(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = head,
    rotation: P = [0, 0, 0],
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name,
      bone,
      at,
      scale: size,
      rotation,
      flat: true,
    });
  }

  function tuft(
    name: string,
    base: P,
    tip: P,
    width: number,
    color: Fill,
    bone: Joint,
    thickness = 0.018,
  ) {
    const a = new THREE.Vector3(...base);
    const t = new THREE.Vector3(...tip);
    const d = t.clone().sub(a);
    let side = new THREE.Vector3(-d.y, d.x, 0);
    if (side.lengthSq() < 0.00001) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width / 2);
    return b.slab(
      [
        a.clone().sub(side),
        a.clone().addScaledVector(d, 0.38).sub(side.clone().multiplyScalar(0.92)),
        t,
        a.clone().addScaledVector(d, 0.48).add(side.clone().multiplyScalar(0.64)),
        a.clone().add(side),
      ],
      { color, thickness, bone, name },
    );
  }

  function littleLeaf(
    name: string,
    root: P,
    tip: P,
    width: number,
    color: Fill,
    bone: Joint = hips,
  ) {
    const a = new THREE.Vector3(...root);
    const z = new THREE.Vector3(...tip);
    const d = z.clone().sub(a);
    let side = new THREE.Vector3(-d.y, d.x, d.z * 0.1);
    if (side.lengthSq() < 0.00001) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width);
    const middle = a.clone().lerp(z, 0.48);
    return b.slab(
      [
        a,
        middle.clone().sub(side),
        z,
        middle.clone().add(side),
      ],
      { color, thickness: 0.004, bone, name },
    );
  }

  // ---------------------------------------------------------------------------
  // Face first. Big rounded white masks, dark tear stripes, and alert amber eyes.
  // ---------------------------------------------------------------------------
  const skull = ellipsoid(
    "roundRussetSkull",
    [0, 0.733, 0.316],
    [0.182, 0.151, 0.159],
    RUST,
  );

  ellipsoid(
    "warmForehead",
    [0, 0.788, 0.34],
    [0.139, 0.095, 0.128],
    SUN,
  );

  for (const s of [1, -1]) {
    const tag = s === 1 ? "L" : "R";
    const mask = ellipsoid(
      `creamEyeMask${tag}`,
      [s * 0.087, 0.743, 0.431],
      [0.072, 0.087, 0.044],
      PALE,
      head,
      [0, s * 8, -s * 13],
    );

    // A red panda's dark vertical cheek stripe, not a raccoon's horizontal mask.
    tuft(
      `tearStripe${tag}`,
      [s * 0.108, 0.72, 0.471],
      [s * 0.125, 0.655, 0.451],
      0.045,
      DARK_RUST,
      head,
      0.012,
    );

    const eye = ellipsoid(
      `eyeSocket${tag}`,
      [s * 0.087, 0.753, 0.466],
      [0.049, 0.060, 0.025],
      C.ink,
      head,
      [0, s * 7, -s * 5],
    );

    b.decal(eye, eyeTexture, {
      name: `paintedAmberEye${tag}`,
      at: [s * 0.087, 0.754, 0.491],
      dir: [s * 0.10, 0.015, 1],
      size: [0.084, 0.103],
      segments: 8,
      mirror: s === 1,
      lift: 0.0018,
      bone: head,
    });

    // The cream eyebrow is a solid, slightly raised graphic shape.
    tuft(
      `expressiveCreamBrow${tag}`,
      [s * 0.055, 0.815, 0.445],
      [s * 0.123, 0.817, 0.437],
      0.022,
      CREAM,
      head,
      0.013,
    );

    ellipsoid(
      `cheekPad${tag}`,
      [s * 0.121, 0.672, 0.391],
      [0.067, 0.057, 0.055],
      CREAM,
    );

    for (let i = 0; i < 3; i++) {
      tuft(
        `creamCheekRuff${tag}${i}`,
        [s * (0.125 + i * 0.009), 0.698 - i * 0.021, 0.407 - i * 0.005],
        [s * (0.218 - i * 0.012), 0.700 - i * 0.040, 0.381 + i * 0.003],
        0.044 - i * 0.004,
        i === 0 ? PALE : CREAM,
        head,
        0.024,
      );
    }

    // Two short whisker roots per cheek are deliberately small and unobtrusive.
    for (let i = 0; i < 2; i++) {
      ellipsoid(
        `whiskerFreckle${tag}${i}`,
        [s * (0.072 + i * 0.020), 0.663 + i * 0.011, 0.477 - i * 0.008],
        [0.004, 0.0045, 0.003],
        "#8a6657",
        head,
        [0, 0, 0],
        6,
      );
    }
  }

  b.decal(skull, foreheadTexture, {
    name: "ivoryForeheadFlame",
    at: [0, 0.802, 0.466],
    dir: [0, 0.12, 1],
    size: [0.061, 0.085],
    segments: 8,
    lift: 0.002,
    bone: head,
  });

  // Upper muzzle and lower jaw are separate assemblies.
  ellipsoid(
    "mouthShadow",
    [0, 0.646, 0.456],
    [0.070, 0.018, 0.046],
    "#4b333b",
    jaw,
  );
  ellipsoid(
    "lowerJawCream",
    [0, 0.632, 0.438],
    [0.064, 0.024, 0.051],
    CREAM,
    jaw,
  );
  for (const s of [1, -1]) {
    ellipsoid(
      `upperMuzzle${s === 1 ? "L" : "R"}`,
      [s * 0.037, 0.666, 0.458],
      [0.055, 0.037, 0.056],
      PALE,
    );
  }

  b.extrude(
    [
      [-0.033, 0.009],
      [-0.024, 0.022],
      [0.024, 0.022],
      [0.033, 0.009],
      [0, -0.019],
    ],
    {
      name: "littleTriangularNose",
      at: [0, 0.683, 0.509],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.021,
      bevel: 0.004,
      color: C.nose,
      bone: head,
    },
  );
  ellipsoid(
    "noseGlint",
    [-0.009, 0.696, 0.522],
    [0.010, 0.0035, 0.002],
    "#9b7f7b",
    head,
    [0, 0, -12],
    6,
  );
  b.sweep(
    [
      [0, 0.671, 0.513],
      [0, 0.652, 0.503],
    ],
    0.003,
    { color: "#6d4c4b", bone: head, sides: 5, caps: "flat", name: "muzzleSeam" },
  );

  // Oversized cream-rimmed ears, with inset warm peach bowls and broad fur tips.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = earJoints[i];
    const tag = s === 1 ? "L" : "R";
    const rotation: P = [-7, s * 8, -s * 22];

    ellipsoid(
      `earDarkBack${tag}`,
      [s * 0.151, 0.878, 0.289],
      [0.082, 0.095, 0.047],
      DARK_RUST,
      ear,
      rotation,
    );
    ellipsoid(
      `earIvoryRim${tag}`,
      [s * 0.155, 0.884, 0.315],
      [0.072, 0.084, 0.031],
      PALE,
      ear,
      rotation,
    );
    ellipsoid(
      `earPeachBowl${tag}`,
      [s * 0.158, 0.882, 0.337],
      [0.048, 0.059, 0.014],
      cel("#d7866a", "#a65c57"),
      ear,
      rotation,
    );
    tuft(
      `earInnerFluff${tag}`,
      [s * 0.152, 0.843, 0.351],
      [s * 0.173, 0.897, 0.354],
      0.041,
      CREAM,
      ear,
      0.009,
    );
    for (let j = 0; j < 2; j++) {
      tuft(
        `earRimTuft${tag}${j}`,
        [s * (0.195 + j * 0.008), 0.877 - j * 0.026, 0.311],
        [s * (0.235 + j * 0.006), 0.893 - j * 0.035, 0.305],
        0.027,
        CREAM,
        ear,
        0.015,
      );
    }
  }

  for (let i = -1; i <= 1; i++) {
    tuft(
      `foreheadFurPeak${i + 1}`,
      [i * 0.035, 0.842, 0.337],
      [i * 0.048 + 0.011, 0.893 - Math.abs(i) * 0.013, 0.321],
      0.045,
      i === 0 ? SUN : RUST,
      head,
      0.023,
    );
  }

  // ---------------------------------------------------------------------------
  // Compact russet torso and dark, widely planted little legs.
  // ---------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.535, -0.425], w: 0.215, h: 0.215 },
      { at: spine.at(0.12), w: 0.342, h: 0.326 },
      { at: spine.at(0.52), w: 0.355, h: 0.337 },
      { at: spine.at(0.90), w: 0.300, h: 0.306 },
      { at: [0, 0.588, 0.19], w: 0.205, h: 0.235 },
    ],
    {
      color: RUST,
      bone: [hips, spine],
      sides: 10,
      smooth: false,
      name: "roundedRussetBody",
    },
  );

  const neckTube = b.sweep(neck, (t) => [0.125 - t * 0.016, 0.12 - t * 0.018], {
    color: RUST,
    sides: 10,
    smooth: false,
    name: "shortFurryNeck",
  });

  // Broad, shaped fur blades enrich the silhouette without turning it into fuzz.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = -0.34 + i * 0.086;
      const y = 0.57 + Math.sin((i / 4) * Math.PI) * 0.015;
      tuft(
        `flankFur${s === 1 ? "L" : "R"}${i}`,
        [s * 0.145, y, z],
        [s * (0.193 + (i % 2) * 0.012), y - 0.061, z - 0.047],
        0.068,
        i % 3 === 0 ? SUN : RUST,
        i < 2 ? hips : spine.joints[1],
        0.027,
      );
    }
    for (let i = 0; i < 3; i++) {
      tuft(
        `shoulderFur${s === 1 ? "L" : "R"}${i}`,
        [s * (0.10 + 0.013 * i), 0.622 - i * 0.023, 0.125],
        [s * (0.18 + i * 0.011), 0.593 - i * 0.030, 0.141],
        0.054,
        i === 0 ? SUN : RUST,
        spine.tip!,
        0.024,
      );
    }
  }

  const bodySurface = b.surface(body);
  const backStripe = bodySurface.drape(
    catmull([
      [0, 0.70, -0.36],
      [0, 0.738, -0.18],
      [0, 0.739, -0.01],
      [0, 0.73, 0.10],
    ]),
    { lift: 0.001 },
  );
  b.sweep(backStripe, 0.016, {
    color: SUN,
    bone: spine,
    sides: 6,
    name: "sunlitDorsalFur",
  });

  for (const leg of legs) {
    const tag = `${leg.front ? "F" : "H"}${leg.side === 1 ? "L" : "R"}`;
    const limbTube = b.sweep(
      leg.chain,
      (t) => leg.front
        ? [0.071 - t * 0.022, 0.073 - t * 0.025]
        : [0.085 - t * 0.035, 0.082 - t * 0.030],
      {
        color: SOCK,
        sides: 8,
        smooth: false,
        skin: "smooth",
        name: `darkLeg${tag}`,
      },
    );

    // Rust at the shoulder falls into a dark sock in broad, graphic locks.
    for (let i = 0; i < 2; i++) {
      const hit = limbTube.at(0.11 + i * 0.13, leg.side === 1 ? -65 : 65);
      b.stick(
        new THREE.ConeGeometry(0.039 - i * 0.007, 0.078, 5),
        i === 0 ? RUST : DARK_RUST,
        hit,
        {
          name: `upperLegFur${tag}${i}`,
          embed: 0.65,
          flow: [0, -1, 0],
          spin: 24,
        },
      );
    }

    const footBone = leg.chain.tip!;
    ellipsoid(
      `softPaw${tag}`,
      [leg.foot[0], 0.269, leg.foot[2] + 0.027],
      [0.068, 0.049, 0.078],
      SOCK,
      footBone,
    );
    ellipsoid(
      `pawTopHighlight${tag}`,
      [leg.foot[0] - 0.008, 0.296, leg.foot[2] + 0.040],
      [0.044, 0.022, 0.046],
      SOCK_LIGHT,
      footBone,
    );

    for (let i = 0; i < leg.toes.length; i++) {
      const toe = leg.toes[i];
      b.sweep([toe.start, toe.end], [0.023, 0.020], {
        color: i === 1 ? SOCK_LIGHT : SOCK,
        bone: toe.joint,
        sides: 6,
        name: `roundedToe${tag}${i + 1}`,
      });
      b.spike(
        [toe.end[0], 0.252, toe.end[2] + 0.006],
        [toe.end[0], 0.246, toe.end[2] + 0.023],
        null,
        0.007,
        {
          bone: toe.joint,
          color: "#b7aa91",
          sides: 5,
          name: `tinyClaw${tag}${i + 1}`,
        },
      );
    }
  }

  // A long striped balancing tail, held free of the stone and clear of all limbs.
  const tailBands: [number, Fill][] = [];
  const numberOfBands = 11;
  for (let i = 0; i < numberOfBands; i++) {
    tailBands.push([
      (i + 1) / numberOfBands,
      i === numberOfBands - 1 ? DARK_RUST : i % 2 === 0 ? TAIL_RED : TAIL_GOLD,
    ]);
  }

  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = 0.083 + Math.sin(t * Math.PI) * 0.012 - t * 0.026;
      return [r, r * 0.96];
    },
    {
      color: TAIL_RED,
      bands: tailBands,
      sides: 10,
      smooth: false,
      name: "elevenRingBalancingTail",
      caps: "round",
    },
  );

  for (let i = 0; i < 9; i++) {
    const t = 0.10 + i * 0.095;
    const hit = tailTube.at(t, i % 2 === 0 ? 30 : -35);
    b.stick(
      new THREE.ConeGeometry(0.025, 0.055, 5),
      Math.floor(t * numberOfBands) % 2 === 0 ? TAIL_RED : TAIL_GOLD,
      hit,
      {
        name: `tailFurEdge${i}`,
        embed: 0.72,
        flow: tail.at(t).tangent,
        spin: 18,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // A small fantasy woodland kerchief; it stays below the face.
  // ---------------------------------------------------------------------------
  const neckSurface = b.surface([body, neckTube]);
  const collarPath = neckSurface.drape(
    catmull(
      [
        [0, 0.61, 0.29],
        [0.135, 0.62, 0.19],
        [0.12, 0.66, 0.09],
        [0, 0.68, 0.06],
        [-0.12, 0.66, 0.09],
        [-0.135, 0.62, 0.19],
      ],
      { closed: true },
    ),
    { lift: 0.008 },
  );
  b.sweep(collarPath, 0.014, {
    color: TEAL_DARK,
    sides: 6,
    name: "jadeKerchiefNeckLoop",
  });

  const bib = b.extrude(
    [
      [-0.103, 0.095],
      [0.103, 0.095],
      [0.078, 0.012],
      [0, -0.102],
      [-0.078, 0.012],
    ],
    {
      name: "pointedJadeKerchief",
      at: [0, 0.515, 0.266],
      x: [1, 0, 0],
      y: [0, 1, -0.13],
      thickness: 0.014,
      bevel: 0.003,
      color: clothPaint,
      bone: spine.tip!,
    },
  );

  b.decal(bib, embroideryTexture, {
    name: "goldLeafKerchiefEmbroidery",
    at: [0, 0.517, 0.282],
    dir: [0, 0.12, 1],
    size: [0.184, 0.190],
    lift: 0.0015,
    segments: 6,
    bone: spine.tip!,
  });

  ellipsoid(
    "kerchiefSideKnot",
    [-0.126, 0.612, 0.206],
    [0.030, 0.027, 0.028],
    TEAL,
    neck.joints[0],
    [0, 0, -20],
    8,
  );

  for (let i = 0; i < 2; i++) {
    const start: P = [-0.138, 0.606, 0.197 - i * 0.009];
    const end: P = [-0.192 - i * 0.036, 0.537 + i * 0.025, 0.133 - i * 0.018];
    tuft(
      `kerchiefRibbon${i}`,
      start,
      end,
      0.046 - i * 0.008,
      i === 0 ? TEAL : TEAL_DARK,
      neck.joints[0],
      0.008,
    );
    b.rod(
      [end[0] - 0.011, end[1] + 0.004, end[2]],
      [end[0] + 0.009, end[1] - 0.009, end[2]],
      0.003,
      { color: GOLD, bone: neck.joints[0], sides: 5, name: `ribbonGoldHem${i}` },
    );
  }

  // Gold-rimmed jade clasp at the side of the throat, never over the muzzle.
  ellipsoid(
    "leafClaspGold",
    [-0.120, 0.614, 0.231],
    [0.024, 0.033, 0.010],
    GOLD,
    neck.joints[0],
    [0, 0, -32],
    8,
  );
  ellipsoid(
    "leafClaspJade",
    [-0.120, 0.615, 0.241],
    [0.014, 0.022, 0.006],
    "#83cfaf",
    neck.joints[0],
    [0, 0, -32],
    8,
  );
  ellipsoid(
    "claspGlint",
    [-0.124, 0.624, 0.247],
    [0.004, 0.007, 0.002],
    C.white,
    neck.joints[0],
    [0, 0, -32],
    6,
  );

  // ---------------------------------------------------------------------------
  // A single hand-cut, low-poly mossy stone. Its flat top supports every paw.
  // ---------------------------------------------------------------------------
  function makeStoneGeometry() {
    const count = 11;
    const vertices: number[] = [];
    const lower: THREE.Vector3[] = [];
    const shoulder: THREE.Vector3[] = [];
    const upper: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.12;
      const irregular = 0.93 + random() * 0.12;
      lower.push(
        new THREE.Vector3(
          Math.cos(a) * 0.445 * irregular,
          0,
          -0.095 + Math.sin(a) * 0.488 * irregular,
        ),
      );
      shoulder.push(
        new THREE.Vector3(
          Math.cos(a) * 0.562 * irregular,
          0.075 + random() * 0.032,
          -0.095 + Math.sin(a) * 0.583 * irregular,
        ),
      );
      upper.push(
        new THREE.Vector3(
          Math.cos(a) * 0.462 * irregular,
          0.22,
          -0.095 + Math.sin(a) * 0.503 * irregular,
        ),
      );
    }
    const tri = (a: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
      vertices.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    };
    const topCenter = new THREE.Vector3(0, 0.22, -0.095);
    const bottomCenter = new THREE.Vector3(0, 0, -0.095);
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      tri(topCenter, upper[j], upper[i]);
      tri(upper[i], upper[j], shoulder[j]);
      tri(upper[i], shoulder[j], shoulder[i]);
      tri(shoulder[i], shoulder[j], lower[j]);
      tri(shoulder[i], lower[j], lower[i]);
      tri(bottomCenter, lower[i], lower[j]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  const rock = b.part(makeStoneGeometry(), stonePaint, {
    name: "ancientFacetedMossStone",
    at: [0, 0, 0],
    bone: hips,
    flat: true,
  });

  const rockSurface = b.surface(rock);

  // The old wind emblem is incised into the front face, below the animal.
  const runeHit = rockSurface.ray([0, 0.12, 0.9], [0, 0, -1]);
  if (runeHit) {
    const rune = b.decal(rock, runeTexture, {
      name: "weatheredWindrestInscription",
      at: runeHit,
      dir: [0, 0.18, 1],
      size: [0.25, 0.112],
      lift: 0.0018,
      segments: 10,
      bone: hips,
    });
    glow(rune, 0.35);
  }

  // Pebbly moss cushions lie on the actual top triangles, not above the rock.
  const mossHits = rockSurface.scatter(34, {
    rng: rng(52),
    minDist: 0.070,
    filter: (h) =>
      h.n.y > 0.75 &&
      (Math.abs(h.at.x) > 0.25 || h.at.z < -0.39 || h.at.z > 0.31),
  });

  mossHits.forEach((hit, i) => {
    const radius = 0.037 + random() * 0.027;
    const geometry = new THREE.IcosahedronGeometry(radius, 0);
    geometry.scale(1.25, 0.34, 0.92);
    b.stick(geometry, i % 3 === 0 ? MOSS_LIGHT : MOSS, hit, {
      name: `mossCushion${i}`,
      embed: 0.38,
      spin: random() * 180,
    });
    if (i % 3 === 0) {
      const p = hit.at;
      for (let j = 0; j < 2; j++) {
        b.part(
          new THREE.IcosahedronGeometry(0.009 + j * 0.002, 0),
          j === 0 ? "#c3cf86" : C.mossLight,
          {
            name: `mossBud${i}_${j}`,
            at: [p.x + (j - 0.5) * 0.023, p.y + 0.019, p.z + 0.006],
            bone: hips,
          },
        );
      }
    }
  });

  // Mineral flecks and a few dark fractures, all conformed to the stone.
  const fleckHits = rockSurface.scatter(15, {
    rng: rng(63),
    minDist: 0.085,
    filter: (h) => h.n.y < 0.5 && h.at.y > 0.035,
  });
  fleckHits.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.014 + (i % 3) * 0.006, 0.003, 0.006),
      i % 3 === 0 ? "#a9b5a4" : "#526878",
      hit,
      { name: `mineralFleck${i}`, spin: i * 37, embed: 0.4 },
    );
  });

  for (const rough of [
    [
      [-0.36, 0.17, 0.26],
      [-0.38, 0.12, 0.30],
      [-0.33, 0.065, 0.34],
    ],
    [
      [0.31, 0.19, 0.29],
      [0.35, 0.13, 0.32],
      [0.34, 0.08, 0.35],
    ],
    [
      [-0.48, 0.16, -0.16],
      [-0.51, 0.09, -0.20],
    ],
  ]) {
    b.sweep(rockSurface.drape(rough, { lift: 0.0008 }), 0.003, {
      name: "stoneHairlineFracture",
      color: "#293e48",
      bone: hips,
      sides: 4,
      caps: "flat",
    });
  }

  // ---------------------------------------------------------------------------
  // Restrained woodland framing: ferns, clover leaves, and blue star flowers.
  // ---------------------------------------------------------------------------
  function fern(x: number, z: number, height: number, lean: number, index: number) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y + 0.008;
    const root: P = [x, y, z];
    const top: P = [x + lean, y + height, z - 0.035];
    b.sweep(
      bezier(root, [x + lean * 0.40, y + height * 0.70, z], top),
      [0.004, 0.0015],
      { color: "#a6b875", bone: hips, sides: 5, name: `fernStem${index}` },
    );
    for (let j = 0; j < 4; j++) {
      const t = 0.20 + j * 0.18;
      const px = x + lean * t;
      const py = y + height * t;
      const pz = z - 0.035 * t;
      const reach = height * (0.40 - j * 0.062);
      for (const s of [1, -1]) {
        littleLeaf(
          `fernLeaf${index}_${j}_${s}`,
          [px, py, pz],
          [px + s * reach, py + 0.025 + j * 0.002, pz - 0.015],
          reach * 0.23,
          j % 2 === 0 ? LEAF : MOSS_LIGHT,
        );
      }
    }
    littleLeaf(
      `fernCrown${index}`,
      [top[0] - lean * 0.12, top[1] - 0.03, top[2]],
      [top[0], top[1] + 0.023, top[2] - 0.008],
      0.011,
      MOSS_LIGHT,
    );
  }

  fern(-0.36, -0.36, 0.155, -0.045, 0);
  fern(0.34, 0.20, 0.125, 0.042, 1);
  fern(-0.35, 0.23, 0.10, -0.035, 2);

  function flower(x: number, z: number, height: number, index: number) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y;
    const top: P = [x + 0.012, y + height, z];
    b.sweep(
      bezier([x, y, z], [x - 0.012, y + height * 0.6, z - 0.006], top),
      [0.0035, 0.002],
      { color: "#57886b", bone: hips, sides: 5, name: `blueflowerStem${index}` },
    );
    for (const s of [1, -1]) {
      littleLeaf(
        `blueflowerLeaf${index}_${s}`,
        [x, y + height * 0.32, z],
        [x + s * 0.032, y + height * 0.56, z + 0.006],
        0.010,
        LEAF,
      );
    }

    const blossom = b.part(new THREE.PlaneGeometry(0.064, 0.064), "#ffffff", {
      name: `blueStarBlossom${index}`,
      at: top,
      dir: [0.1, 0.66, 0.75],
      axis: "z",
      texture: flowerTexture,
      bone: hips,
    });
    glow(blossom, 0.28);

    // A back face makes the thin flower readable in rear three-quarter views too.
    b.part(new THREE.PlaneGeometry(0.064, 0.064), "#ffffff", {
      name: `blueStarBlossomBack${index}`,
      at: [top[0], top[1] - 0.001, top[2] - 0.001],
      dir: [-0.1, -0.66, -0.75],
      axis: "z",
      texture: flowerTexture,
      bone: hips,
    });
    glow(
      b.part(new THREE.IcosahedronGeometry(0.007, 0), "#fff0b5", {
        name: `blueflowerPollen${index}`,
        at: [top[0] + 0.001, top[1] + 0.006, top[2] + 0.006],
        bone: hips,
      }),
      0.65,
    );
  }

  flower(-0.34, 0.30, 0.096, 0);
  flower(-0.40, 0.24, 0.064, 1);
  flower(0.39, -0.29, 0.12, 2);
  flower(0.32, 0.29, 0.071, 3);

  const fallenLeaves = [
    [-0.24, 0.36, 0.08],
    [0.29, -0.43, -0.4],
    [-0.39, -0.12, 0.7],
    [0.37, 0.08, -0.5],
    [0.06, 0.35, 0.5],
  ];

  fallenLeaves.forEach(([x, z, angle], i) => {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    b.cards(
      [frame([hit.at.x, hit.at.y + 0.005, hit.at.z], [0, 1, 0])],
      groundLeafTexture,
      {
        size: [0.038 + (i % 2) * 0.010, 0.066],
        lean: 90,
        flow: [Math.sin(angle), 0, Math.cos(angle)],
        mirror: true,
        sink: 0,
        bone: hips,
        name: `fallenWoodlandLeaf${i}`,
      },
    );
  });

  // Short grass blades at the rear corners frame the paws, rather than hide them.
  for (const [index, x, z] of [
    [0, -0.37, -0.27],
    [1, 0.36, -0.38],
    [2, 0.39, 0.12],
  ]) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) continue;
    for (let j = 0; j < 4; j++) {
      const spread = (j - 1.5) * 0.018;
      littleLeaf(
        `mossGrass${index}_${j}`,
        [x + spread * 0.25, hit.at.y + 0.006, z],
        [x + spread, hit.at.y + 0.055 + (j % 2) * 0.025, z - 0.018],
        0.006,
        j % 2 === 0 ? MOSS_LIGHT : LEAF,
      );
    }
  }

  return b.root;
}
```
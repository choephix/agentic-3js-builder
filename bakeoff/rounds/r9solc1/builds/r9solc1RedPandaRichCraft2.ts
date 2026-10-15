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
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Windrest Red Panda",
  description:
    "A sturdy, bright-eyed red panda balancing on a moss-covered woodland stone. Broad cream face markings, a plush ringed tail, embroidered jade cloth, and delicate blue flowers create a refined cel-painted fantasy vignette.",
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
    ink: "#302833",
    nose: "#372a32",
    paleGold: "#ffe7a0",
    white: "#fff8df",
    mint: "#a3efd2",
  };

  const RUST = cel("#d9693d", "#a44537");
  const SUN = cel("#e98547", "#b65138");
  const DARK_RUST = cel("#a74d39", "#783a38");
  const TAIL_RED = cel("#b5533a", "#803d39");
  const TAIL_GOLD = cel("#efa265", "#bd704b");
  const CREAM = cel("#f7e7c9", "#cdb799");
  const PALE = cel("#fff3da", "#d9c5a8");
  const SOCK = cel("#3d343e", "#292a35");
  const SOCK_LIGHT = cel("#51424a", "#33303b");
  const PEACH = cel("#cb8b72", "#a46b61");
  const TEAL = cel("#3c9c8a", "#286b6c");
  const TEAL_DARK = cel("#286d69", "#244d55");
  const GOLD = cel("#edc777", "#ab8350");
  const LEAF = cel("#659b79", "#386a5e");
  const MOSS = cel("#829c5b", "#506d4f");
  const MOSS_LIGHT = cel("#b0c27a", "#708d59");

  const bodyPaint = paint((p, n) => {
    const broad = noise(p, 0.17, 12);
    const top = n.y > 0.50;
    const lit = top
      ? mix("#df7540", "#ed934e", broad * 0.55)
      : mix("#d46b3c", "#dd7742", broad * 0.35);
    if (n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0.1) {
      return lit;
    }
    return mix("#994238", "#ac503b", broad * 0.55);
  });

  const stonePaint = paint((p, n) => {
    const cloud = noise(p, 0.16, 9);
    let stone = mix(
      "#405362",
      "#879293",
      cloud * 0.68 + Math.max(0, n.y) * 0.16,
    );
    if (n.y > 0.65) {
      const cover = noise(p, 0.14, 17);
      if (cover > 0.39) {
        return mix("#57754e", "#9cac69", (cover - 0.39) * 2.3);
      }
      stone = mix(stone, "#9da697", 0.22);
    }
    if (p.y < 0.045) stone = mix(stone, "#30434e", 0.20);
    return stone;
  });

  const clothPaint = paint((p, n) => {
    const thread = Math.sin(p.x * 700) * Math.sin(p.y * 700);
    const base = n.z > 0.4 ? "#398f82" : "#2a6870";
    return mix(base, "#b2d7b9", thread > 0.74 ? 0.10 : 0);
  });

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 116">
      <defs>
        <clipPath id="eye">
          <path d="M11 60 C12 32 29 15 52 16 C77 16 90 37 89 62
                   C87 87 70 100 49 100 C28 100 12 86 11 60Z"/>
        </clipPath>
        <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#704b36"/>
          <stop offset=".42" stop-color="#bd8242"/>
          <stop offset=".74" stop-color="#e9b75b"/>
          <stop offset="1" stop-color="#ffe6a3"/>
        </linearGradient>
      </defs>
      <path d="M6 60 C7 29 26 10 52 11 C81 11 96 35 94 63
               C92 92 72 106 48 105 C24 105 7 89 6 60Z" fill="#332a34"/>
      <g clip-path="url(#eye)">
        <rect width="100" height="116" fill="#fff4db"/>
        <ellipse cx="52" cy="61" rx="30" ry="43" fill="url(#amber)"/>
        <ellipse cx="53" cy="57" rx="13" ry="26" fill="#3b3438"/>
        <path d="M31 84 L38 78 M44 94 L46 84 M63 92 L61 83 M75 82 L70 78"
              stroke="#fff0bd" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="36" cy="38" rx="10" ry="13" fill="#ffffff"/>
        <ellipse cx="70" cy="78" rx="4.5" ry="6" fill="#ffffff"/>
        <circle cx="76" cy="65" r="2.5" fill="#fff6ce"/>
      </g>
      <path d="M9 43 Q19 13 49 13 Q77 11 91 40"
            fill="none" stroke="#332a34" stroke-width="6" stroke-linecap="round"/>
      <path d="M24 96 Q49 108 75 95"
            fill="none" stroke="#8d5d48" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 80 112">
      <path d="M40 108 C33 89 16 80 18 65 C20 52 32 45 28 26
               C37 31 40 40 39 49 C49 36 48 20 43 5
               C64 26 70 47 60 68 C53 81 45 91 40 108Z"
            fill="#fff0d0"/>
      <path d="M40 96 Q36 77 43 61 Q50 46 47 31"
            fill="none" stroke="#ffd99c" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const embroideryTexture = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M9 14 L80 166 L151 14" fill="none"
            stroke="#1c464c" stroke-width="12" stroke-linejoin="round"/>
      <path d="M14 14 L80 154 L146 14" fill="none"
            stroke="#f1cc75" stroke-width="5"/>
      <path d="M29 30 L80 137 L131 30" fill="none"
            stroke="#b4e6c9" stroke-width="3" stroke-dasharray="7 8"/>
      <path d="M80 39 C55 52 49 76 80 100 C111 76 105 52 80 39Z"
            fill="#21565b" stroke="#f4d483" stroke-width="4"/>
      <path d="M80 89 L80 51 M80 76 L66 65 M80 69 L92 58"
            fill="none" stroke="#b4edd0" stroke-width="5" stroke-linecap="round"/>
      <circle cx="80" cy="118" r="4" fill="#ffe9ac"/>
    </svg>`,
    { size: 384 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 240 110">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 77 H55 L69 62 M221 77 H185 L171 62"
              stroke="#284950" stroke-width="9"/>
        <path d="M19 75 H55 L69 60 M221 75 H185 L171 60"
              stroke="#82ad99" stroke-width="3"/>
        <path d="M120 94 C111 70 75 64 83 38 C90 18 115 25 120 43
                 C126 22 149 19 157 38 C167 65 130 73 120 94Z"
              stroke="#284950" stroke-width="12"/>
        <path d="M120 89 C112 68 82 61 87 40 C92 25 111 28 120 50
                 C129 28 147 26 153 40 C159 62 128 70 120 89Z"
              stroke="#a0d7ba" stroke-width="4"/>
        <path d="M120 83 V53 M120 67 L105 53 M120 67 L135 53"
              stroke="#b7e5c7" stroke-width="4"/>
        <path d="M54 28 L64 38 L54 48 L44 38Z M186 28 L196 38 L186 48 L176 38Z"
              stroke="#85ae9b" stroke-width="4"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const groundLeafTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 112 C26 101 7 76 11 46 C16 16 48 11 84 4
               C90 40 91 71 67 95Z" fill="#4d7454"
            stroke="#315749" stroke-width="5"/>
      <path d="M50 108 Q55 60 81 13 C47 21 27 41 25 62
               C24 83 37 96 50 108Z" fill="#a8bd74"/>
      <path d="M48 110 Q51 66 80 15 M55 80 L31 59 M63 58 L42 40 M57 72 L78 59"
            stroke="#ded697" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 100">
      <g stroke="#46889e" stroke-width="3" stroke-linejoin="round">
        <path d="M50 48 C26 36 30 6 47 5 C63 3 70 30 50 48Z" fill="#c3f5ee"/>
        <path d="M51 49 C54 20 84 14 93 28 C103 44 79 59 51 49Z" fill="#9ae3ed"/>
        <path d="M51 51 C80 47 96 71 83 85 C70 98 51 78 51 51Z" fill="#83cde6"/>
        <path d="M49 51 C66 75 49 99 33 93 C16 86 26 62 49 51Z" fill="#afe6ef"/>
        <path d="M48 49 C23 66 1 48 8 33 C15 17 40 27 48 49Z" fill="#dcfbf0"/>
      </g>
      <circle cx="50" cy="50" r="12" fill="#fff0b7"
              stroke="#619992" stroke-width="3"/>
      <circle cx="47" cy="46" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. Four separate contacts and a free balancing tail.
  const hips = b.joint("hips", {
    at: [0, 0.485, -0.30],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.485, -0.30],
      [0, 0.515, -0.075],
      [0, 0.535, 0.115],
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
      [0, 0.535, 0.10],
      [0, 0.59, 0.23],
      [0, 0.655, 0.305],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.682, 0.325],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.604, 0.408],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.153, 0.787, 0.304],
      dir: [s * 0.23, 1, 0],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.50, -0.405],
      [0.105, 0.495, -0.61],
      [0.32, 0.475, -0.755],
      [0.55, 0.505, -0.73],
      [0.735, 0.585, -0.57],
      [0.79, 0.675, -0.43],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  const legs: {
    front: boolean;
    side: number;
    chain: ReturnType<typeof b.chain>;
    foot: P;
    toes: { joint: Joint; start: P; end: P }[];
  }[] = [];

  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const tag = `${front ? "F" : "H"}${s === 1 ? "L" : "R"}`;
      const root: P = front
        ? [s * 0.132, 0.523, 0.105]
        : [s * 0.145, 0.48, -0.30];
      const middle: P = front
        ? [s * 0.176, 0.381, 0.158]
        : [s * 0.207, 0.372, -0.265];
      const foot: P = front
        ? [s * 0.195, 0.27, 0.225]
        : [s * 0.213, 0.27, -0.335];

      const chain = b.chain(`leg${tag}`, [root, middle, foot], {
        parent: front ? spine.tip! : hips,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`]
          : [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [foot[0], 0.22, foot[2] + 0.035],
      });

      const toes: { joint: Joint; start: P; end: P }[] = [];
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 0.037;
        const start: P = [foot[0] + dx, 0.26, foot[2] + 0.038];
        const end: P = [
          foot[0] + dx * 1.14,
          0.249,
          foot[2] + 0.103 - Math.abs(i - 1) * 0.006,
        ];
        const joint = b.joint(`toe${tag}${i + 1}`, {
          parent: chain.tip!,
          at: start,
          aim: end,
          role: "digit",
        });
        toes.push({ joint, start, end });
      }
      legs.push({ front, side: s, chain, foot, toes });
    }
  }

  function ellipsoid(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = head,
    rotation: P = [0, 0, 0],
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 10), color, {
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
        a.clone().addScaledVector(d, 0.38).sub(side.clone().multiplyScalar(0.82)),
        t,
        a.clone().addScaledVector(d, 0.48).add(side.clone().multiplyScalar(0.62)),
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
    const tipV = new THREE.Vector3(...tip);
    const d = tipV.clone().sub(a);
    let side = new THREE.Vector3(-d.y, d.x, d.z * 0.1);
    if (side.lengthSq() < 0.00001) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width);
    const middle = a.clone().lerp(tipV, 0.48);
    return b.slab(
      [
        a,
        middle.clone().sub(side),
        tipV,
        middle.clone().add(side),
      ],
      { color, thickness: 0.004, bone, name },
    );
  }

  // Face: wide cream markings, shallow integrated eyes, full cheek ruffs.
  const skull = ellipsoid(
    "fullRussetSkull",
    [0, 0.682, 0.325],
    [0.204, 0.160, 0.171],
    RUST,
    head,
    [0, 0, 0],
    16,
  );

  const forehead = ellipsoid(
    "sunlitForehead",
    [0, 0.748, 0.344],
    [0.158, 0.098, 0.131],
    SUN,
    head,
    [0, 0, 0],
    16,
  );

  for (const s of [1, -1]) {
    const tag = s === 1 ? "L" : "R";

    ellipsoid(
      `broadCreamMask${tag}`,
      [s * 0.098, 0.691, 0.444],
      [0.086, 0.094, 0.042],
      PALE,
      head,
      [0, s * 6, -s * 10],
      16,
    );

    ellipsoid(
      `lowerCreamCheek${tag}`,
      [s * 0.132, 0.633, 0.410],
      [0.080, 0.055, 0.057],
      CREAM,
      head,
      [0, 0, -s * 9],
    );

    const eye = ellipsoid(
      `insetEye${tag}`,
      [s * 0.098, 0.706, 0.477],
      [0.046, 0.055, 0.015],
      C.ink,
      head,
      [0, s * 6, -s * 5],
      16,
    );

    b.decal(eye, eyeTexture, {
      name: `amberEyeDrawing${tag}`,
      at: [s * 0.098, 0.706, 0.494],
      dir: [s * 0.10, 0.015, 1],
      size: [0.083, 0.100],
      segments: 8,
      mirror: s === 1,
      lift: 0.0012,
      bone: head,
    });

    // The tear marking is seated into the mask, not a spike hanging off the eye.
    b.sweep(
      bezier(
        [s * 0.112, 0.669, 0.480],
        [s * 0.132, 0.645, 0.467],
        [s * 0.147, 0.622, 0.446],
      ),
      [0.015, 0.006],
      {
        color: DARK_RUST,
        bone: head,
        sides: 6,
        caps: "flat",
        name: `softTearStripe${tag}`,
      },
    );

    tuft(
      `creamEyebrow${tag}`,
      [s * 0.067, 0.765, 0.450],
      [s * 0.142, 0.770, 0.431],
      0.025,
      CREAM,
      head,
      0.014,
    );

    // Ruffs overlap solid cheek volume at their broad roots.
    for (let i = 0; i < 3; i++) {
      tuft(
        `cheekRuff${tag}${i}`,
        [s * (0.142 + i * 0.002), 0.666 - i * 0.022, 0.411],
        [s * (0.235 - i * 0.010), 0.666 - i * 0.032, 0.386 + i * 0.005],
        0.047 - i * 0.003,
        i === 0 ? PALE : CREAM,
        head,
        0.029,
      );
    }

    for (let i = 0; i < 2; i++) {
      ellipsoid(
        `whiskerFreckle${tag}${i}`,
        [s * (0.079 + i * 0.018), 0.632 + i * 0.011, 0.495 - i * 0.008],
        [0.0035, 0.004, 0.002],
        "#97735d",
        head,
        [0, 0, 0],
        6,
      );
    }
  }

  b.decal([skull, forehead], foreheadTexture, {
    name: "visibleIvoryForeheadFlame",
    at: [0, 0.766, 0.482],
    dir: [0, 0.15, 1],
    size: [0.056, 0.080],
    segments: 10,
    lift: 0.0018,
    bone: head,
  });

  // Upper muzzle remains on the head; the chin and lower lip ride the jaw.
  ellipsoid(
    "lowerJaw",
    [0, 0.601, 0.457],
    [0.067, 0.019, 0.054],
    CREAM,
    jaw,
  );

  for (const s of [1, -1]) {
    ellipsoid(
      `upperMuzzle${s === 1 ? "L" : "R"}`,
      [s * 0.037, 0.635, 0.470],
      [0.058, 0.033, 0.054],
      PALE,
    );
  }

  b.sweep(
    bezier(
      [-0.052, 0.617, 0.510],
      [0, 0.603, 0.522],
      [0.052, 0.617, 0.510],
    ),
    0.0028,
    {
      color: "#795649",
      bone: jaw,
      sides: 5,
      caps: "round",
      name: "gentleClosedSmile",
    },
  );

  b.extrude(
    [
      [-0.032, 0.009],
      [-0.022, 0.020],
      [0.022, 0.020],
      [0.032, 0.009],
      [0, -0.018],
    ],
    {
      name: "softTriangularNose",
      at: [0, 0.653, 0.518],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: C.nose,
      bone: head,
    },
  );

  ellipsoid(
    "noseGlint",
    [-0.009, 0.666, 0.529],
    [0.009, 0.003, 0.0015],
    "#ad8b80",
    head,
    [0, 0, -12],
    6,
  );

  b.sweep(
    [
      [0, 0.637, 0.526],
      [0, 0.615, 0.521],
    ],
    0.0025,
    {
      color: "#795649",
      bone: head,
      sides: 5,
      caps: "flat",
      name: "shortMuzzleSeam",
    },
  );

  // Rounded triangular ears: broad at the base, short at the tip.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];
    const tag = s === 1 ? "L" : "R";

    b.extrude(
      [
        [-0.067, -0.027],
        [0.061, -0.024],
        [0.080, 0.037],
        [0.041, 0.121],
        [0.012, 0.133],
        [-0.043, 0.094],
        [-0.078, 0.030],
      ],
      {
        name: `roundedEarBack${tag}`,
        at: [s * 0.157, 0.786, 0.299],
        x: [s, 0, 0],
        y: [s * 0.13, 1, -0.06],
        thickness: 0.050,
        bevel: 0.008,
        smoothing: 1,
        color: DARK_RUST,
        bone: ear,
      },
    );

    b.extrude(
      [
        [-0.061, -0.018],
        [0.052, -0.018],
        [0.069, 0.035],
        [0.034, 0.110],
        [0.012, 0.120],
        [-0.036, 0.086],
        [-0.067, 0.029],
      ],
      {
        name: `creamEarRim${tag}`,
        at: [s * 0.157, 0.789, 0.326],
        x: [s, 0, 0],
        y: [s * 0.13, 1, -0.06],
        thickness: 0.016,
        bevel: 0.003,
        smoothing: 1,
        color: PALE,
        bone: ear,
      },
    );

    b.extrude(
      [
        [-0.039, 0.003],
        [0.032, 0.002],
        [0.047, 0.035],
        [0.023, 0.086],
        [0.011, 0.094],
        [-0.025, 0.065],
        [-0.044, 0.027],
      ],
      {
        name: `peachEarBowl${tag}`,
        at: [s * 0.157, 0.790, 0.337],
        x: [s, 0, 0],
        y: [s * 0.13, 1, -0.06],
        thickness: 0.008,
        smoothing: 1,
        color: PEACH,
        bone: ear,
      },
    );

    tuft(
      `earRootFluff${tag}`,
      [s * 0.155, 0.791, 0.348],
      [s * 0.169, 0.835, 0.348],
      0.045,
      CREAM,
      ear,
      0.008,
    );

    tuft(
      `earSideFluff${tag}`,
      [s * 0.207, 0.799, 0.322],
      [s * 0.242, 0.813, 0.316],
      0.026,
      CREAM,
      ear,
      0.014,
    );
  }

  for (let i = -1; i <= 1; i++) {
    tuft(
      `crownFur${i + 1}`,
      [i * 0.035, 0.823, 0.335],
      [i * 0.045 + 0.008, 0.857 - Math.abs(i) * 0.009, 0.323],
      0.045,
      i === 0 ? SUN : RUST,
      head,
      0.020,
    );
  }

  // A low, rounded body. The sunlit back is painted, not a raised tube.
  const body = b.loft(
    [
      { at: [0, 0.485, -0.432], w: 0.235, h: 0.235 },
      { at: spine.at(0.12), w: 0.362, h: 0.328 },
      { at: spine.at(0.52), w: 0.372, h: 0.343 },
      { at: spine.at(0.90), w: 0.322, h: 0.316 },
      { at: [0, 0.532, 0.19], w: 0.226, h: 0.247 },
    ],
    {
      color: bodyPaint,
      bone: [hips, spine],
      sides: 10,
      smooth: false,
      name: "plushRussetTorso",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.132 - t * 0.013, 0.125 - t * 0.011],
    {
      color: RUST,
      sides: 10,
      smooth: false,
      name: "shortFurryNeck",
    },
  );

  // Broad overlapping blades rooted on the actual torso surface.
  const bodySurface = b.surface(body);
  for (const s of [1, -1]) {
    const tag = s === 1 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = -0.31 + i * 0.10;
      const hit = bodySurface.ray([s * 0.50, 0.489, z], [-s, 0, 0]);
      if (!hit) continue;
      const a = hit.at;
      tuft(
        `rootedFlankLock${tag}${i}`,
        [a.x - s * 0.015, a.y + 0.024, a.z + 0.017],
        [a.x + s * 0.022, a.y - 0.048, a.z - 0.018],
        0.061,
        i === 1 ? SUN : RUST,
        hit.bone ?? hips,
        0.027,
      );
    }

    for (let i = 0; i < 2; i++) {
      tuft(
        `shoulderRuff${tag}${i}`,
        [s * (0.112 + i * 0.013), 0.580 - i * 0.025, 0.142],
        [s * (0.191 + i * 0.012), 0.547 - i * 0.031, 0.132],
        0.062,
        i === 0 ? SUN : RUST,
        spine.tip!,
        0.030,
      );
    }
  }

  for (const leg of legs) {
    const tag = `${leg.front ? "F" : "H"}${leg.side === 1 ? "L" : "R"}`;
    b.sweep(
      leg.chain,
      (t) =>
        leg.front
          ? [0.076 - t * 0.023, 0.077 - t * 0.024]
          : [0.089 - t * 0.034, 0.086 - t * 0.030],
      {
        color: SOCK,
        sides: 8,
        smooth: false,
        name: `sturdyDarkLeg${tag}`,
      },
    );

    const footBone = leg.chain.tip!;
    ellipsoid(
      `softPaw${tag}`,
      [leg.foot[0], 0.268, leg.foot[2] + 0.026],
      [0.072, 0.048, 0.077],
      SOCK,
      footBone,
    );

    ellipsoid(
      `pawTopPlane${tag}`,
      [leg.foot[0] - 0.007, 0.292, leg.foot[2] + 0.035],
      [0.048, 0.022, 0.046],
      SOCK_LIGHT,
      footBone,
    );

    for (let i = 0; i < leg.toes.length; i++) {
      const toe = leg.toes[i];
      b.sweep([toe.start, toe.end], [0.024, 0.020], {
        color: i === 1 ? SOCK_LIGHT : SOCK,
        bone: toe.joint,
        sides: 6,
        name: `roundedToe${tag}${i + 1}`,
      });
      b.spike(
        [toe.end[0], 0.251, toe.end[2] + 0.004],
        [toe.end[0], 0.246, toe.end[2] + 0.018],
        null,
        0.0055,
        {
          bone: toe.joint,
          color: "#b7a88e",
          sides: 5,
          name: `tinyClaw${tag}${i + 1}`,
        },
      );
    }
  }

  const tailBands: [number, Fill][] = [];
  for (let i = 0; i < 11; i++) {
    tailBands.push([
      (i + 1) / 11,
      i === 10 ? DARK_RUST : i % 2 === 0 ? TAIL_RED : TAIL_GOLD,
    ]);
  }

  b.sweep(
    tail,
    (t) => {
      const core = 0.087 + Math.sin(t * Math.PI) * 0.020 - t * 0.014;
      const tip = t > 0.87 ? Math.sqrt(Math.max(0, (1 - t) / 0.13)) : 1;
      const r = core * tip;
      return [r, r * 0.97];
    },
    {
      color: TAIL_RED,
      bands: tailBands,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "plushTaperedRingedTail",
    },
  );

  // Kerchief: below the chin, with gold embroidery and a small leaf clasp.
  const neckSurface = b.surface([body, neckTube]);
  const collarPath = neckSurface.drape(
    catmull(
      [
        [0, 0.556, 0.292],
        [0.14, 0.565, 0.19],
        [0.12, 0.605, 0.09],
        [0, 0.628, 0.06],
        [-0.12, 0.605, 0.09],
        [-0.14, 0.565, 0.19],
      ],
      { closed: true },
    ),
    { lift: 0.006 },
  );

  b.sweep(collarPath, 0.012, {
    color: TEAL_DARK,
    sides: 6,
    name: "jadeNeckLoop",
  });

  const bib = b.extrude(
    [
      [-0.103, 0.090],
      [0.103, 0.090],
      [0.079, 0.009],
      [0, -0.091],
      [-0.079, 0.009],
    ],
    {
      name: "pointedJadeKerchief",
      at: [0, 0.469, 0.275],
      x: [1, 0, 0],
      y: [0, 1, -0.13],
      thickness: 0.012,
      bevel: 0.003,
      color: clothPaint,
      bone: spine.tip!,
    },
  );

  b.decal(bib, embroideryTexture, {
    name: "goldLeafEmbroidery",
    at: [0, 0.472, 0.290],
    dir: [0, 0.12, 1],
    size: [0.182, 0.174],
    lift: 0.0015,
    segments: 6,
    bone: spine.tip!,
  });

  ellipsoid(
    "kerchiefKnot",
    [-0.136, 0.563, 0.208],
    [0.029, 0.026, 0.028],
    TEAL,
    neck.joints[0],
    [0, 0, -20],
    8,
  );

  for (let i = 0; i < 2; i++) {
    const end: P = [
      -0.192 - i * 0.031,
      0.498 + i * 0.024,
      0.135 - i * 0.018,
    ];
    tuft(
      `kerchiefRibbon${i}`,
      [-0.142, 0.558, 0.200 - i * 0.008],
      end,
      0.047 - i * 0.008,
      i === 0 ? TEAL : TEAL_DARK,
      neck.joints[0],
      0.009,
    );
    b.rod(
      [end[0] - 0.011, end[1] + 0.004, end[2]],
      [end[0] + 0.008, end[1] - 0.009, end[2]],
      0.0028,
      {
        color: GOLD,
        bone: neck.joints[0],
        sides: 5,
        name: `ribbonHem${i}`,
      },
    );
  }

  ellipsoid(
    "leafClaspGold",
    [-0.130, 0.565, 0.234],
    [0.023, 0.031, 0.009],
    GOLD,
    neck.joints[0],
    [0, 0, -32],
    8,
  );

  ellipsoid(
    "leafClaspJade",
    [-0.130, 0.566, 0.243],
    [0.014, 0.022, 0.0055],
    "#83c8a8",
    neck.joints[0],
    [0, 0, -32],
    8,
  );

  ellipsoid(
    "claspGlint",
    [-0.134, 0.575, 0.249],
    [0.0035, 0.006, 0.0015],
    C.white,
    neck.joints[0],
    [0, 0, -32],
    6,
  );

  // The stone has a true, flat, load-bearing top at y = .22.
  function makeStoneGeometry() {
    const count = 11;
    const vertices: number[] = [];
    const lower: THREE.Vector3[] = [];
    const shoulder: THREE.Vector3[] = [];
    const upper: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.12;
      const irregular = 0.94 + random() * 0.10;
      lower.push(
        new THREE.Vector3(
          Math.cos(a) * 0.445 * irregular,
          0,
          -0.095 + Math.sin(a) * 0.488 * irregular,
        ),
      );
      shoulder.push(
        new THREE.Vector3(
          Math.cos(a) * 0.551 * irregular,
          0.078 + random() * 0.024,
          -0.095 + Math.sin(a) * 0.572 * irregular,
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
    name: "ancientMossStone",
    at: [0, 0, 0],
    bone: hips,
    flat: true,
  });
  const rockSurface = b.surface(rock);

  const runeHit = rockSurface.ray([0, 0.12, 0.9], [0, 0, -1]);
  if (runeHit) {
    glow(
      b.decal(rock, runeTexture, {
        name: "weatheredWindrestInscription",
        at: runeHit,
        dir: [0, 0.18, 1],
        size: [0.25, 0.108],
        lift: 0.0017,
        segments: 10,
        bone: hips,
      }),
      0.25,
    );
  }

  // Moss grows in overlapping little hummocks, not uniformly sized plates.
  const mossHits = rockSurface.scatter(24, {
    rng: rng(52),
    minDist: 0.082,
    filter: (h) =>
      h.n.y > 0.75 &&
      (Math.abs(h.at.x) > 0.27 || h.at.z < -0.41 || h.at.z > 0.34),
  });

  mossHits.forEach((hit, i) => {
    const radius = 0.025 + random() * 0.026;
    for (let j = 0; j < 2; j++) {
      const r = radius * (j === 0 ? 1 : 0.64);
      const geometry = new THREE.IcosahedronGeometry(r, 1);
      geometry.scale(1.15, 0.43, 0.88);
      const seated = j === 0
        ? hit
        : hit.moved([r * 0.9, -0.002, r * 0.45]);
      b.stick(
        geometry,
        (i + j) % 4 === 0 ? MOSS_LIGHT : MOSS,
        seated,
        {
          name: `mossHummock${i}_${j}`,
          embed: 0.52,
          spin: random() * 180,
        },
      );
    }

    if (i % 4 === 0) {
      for (let j = 0; j < 3; j++) {
        const p = hit.at;
        b.part(
          new THREE.IcosahedronGeometry(0.006 + j * 0.001, 0),
          j === 0 ? "#c3ce8b" : "#9eb678",
          {
            name: `mossBud${i}_${j}`,
            at: [
              p.x + (j - 1) * 0.012,
              p.y + 0.012,
              p.z + Math.sin(j * 2) * 0.010,
            ],
            bone: hips,
          },
        );
      }
    }
  });

  const fleckHits = rockSurface.scatter(13, {
    rng: rng(63),
    minDist: 0.09,
    filter: (h) => h.n.y < 0.5 && h.at.y > 0.045,
  });

  fleckHits.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.012 + (i % 3) * 0.005, 0.002, 0.005),
      i % 3 === 0 ? "#a3b1a4" : "#627989",
      hit,
      { name: `mineralFleck${i}`, spin: i * 37, embed: 0.5 },
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
    b.sweep(rockSurface.drape(rough, { lift: 0.0007 }), 0.0025, {
      name: "stoneHairlineFracture",
      color: "#344b55",
      bone: hips,
      sides: 4,
      caps: "flat",
    });
  }

  // Fern leaf roots sample the exact same curved stem as the visible stalk.
  function fern(
    x: number,
    z: number,
    height: number,
    lean: number,
    index: number,
  ) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y + 0.005;
    const root: P = [x, y, z];
    const top: P = [x + lean, y + height, z - 0.035];
    const path = bezier(
      root,
      [x + lean * 0.40, y + height * 0.70, z],
      top,
    );

    b.sweep(path, [0.0035, 0.0015], {
      color: "#a8b87c",
      bone: hips,
      sides: 5,
      name: `fernStem${index}`,
    });

    for (let j = 0; j < 4; j++) {
      const t = 0.20 + j * 0.18;
      const p = path.at(t);
      const reach = height * (0.39 - j * 0.061);
      for (const s of [1, -1]) {
        littleLeaf(
          `fernLeaf${index}_${j}_${s}`,
          [p.x, p.y - 0.001, p.z],
          [p.x + s * reach, p.y + 0.023, p.z - 0.014],
          reach * 0.25,
          j % 2 === 0 ? LEAF : MOSS_LIGHT,
        );
      }
    }

    const crown = path.at(0.84);
    littleLeaf(
      `fernCrown${index}`,
      [crown.x, crown.y, crown.z],
      [top[0], top[1] + 0.017, top[2] - 0.005],
      0.010,
      MOSS_LIGHT,
    );
  }

  fern(-0.36, -0.36, 0.143, -0.043, 0);
  fern(0.35, 0.20, 0.110, 0.035, 1);
  fern(-0.36, 0.23, 0.091, -0.030, 2);

  function flower(
    x: number,
    z: number,
    height: number,
    index: number,
  ) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y;
    const top: P = [x + 0.012, y + height, z];

    b.sweep(
      bezier(
        [x, y, z],
        [x - 0.012, y + height * 0.6, z - 0.006],
        top,
      ),
      [0.003, 0.0018],
      {
        color: "#65916f",
        bone: hips,
        sides: 5,
        name: `blueflowerStem${index}`,
      },
    );

    for (const s of [1, -1]) {
      littleLeaf(
        `blueflowerLeaf${index}_${s}`,
        [x, y + height * 0.32, z],
        [x + s * 0.030, y + height * 0.56, z + 0.006],
        0.010,
        LEAF,
      );
    }

    const blossom = b.part(
      new THREE.PlaneGeometry(0.059, 0.059),
      "#ffffff",
      {
        name: `blueStarBlossom${index}`,
        at: top,
        dir: [0.1, 0.66, 0.75],
        axis: "z",
        texture: flowerTexture,
        bone: hips,
      },
    );
    glow(blossom, 0.25);

    b.part(new THREE.PlaneGeometry(0.059, 0.059), "#ffffff", {
      name: `blueStarBlossomBack${index}`,
      at: [top[0], top[1] - 0.001, top[2] - 0.001],
      dir: [-0.1, -0.66, -0.75],
      axis: "z",
      texture: flowerTexture,
      bone: hips,
    });

    glow(
      b.part(new THREE.IcosahedronGeometry(0.006, 0), "#fff0bd", {
        name: `flowerPollen${index}`,
        at: [top[0] + 0.001, top[1] + 0.005, top[2] + 0.005],
        bone: hips,
      }),
      0.55,
    );
  }

  flower(-0.35, 0.30, 0.088, 0);
  flower(-0.40, 0.24, 0.057, 1);
  flower(0.39, -0.29, 0.108, 2);
  flower(0.33, 0.29, 0.066, 3);

  const fallenLeaves = [
    [-0.25, 0.36, 0.08],
    [0.29, -0.43, -0.4],
    [-0.39, -0.12, 0.7],
    [0.38, 0.08, -0.5],
    [0.06, 0.35, 0.5],
  ];

  fallenLeaves.forEach(([x, z, angle], i) => {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) return;
    b.cards(
      [frame([hit.at.x, hit.at.y + 0.003, hit.at.z], [0, 1, 0])],
      groundLeafTexture,
      {
        size: [0.035 + (i % 2) * 0.008, 0.059],
        lean: 90,
        flow: [Math.sin(angle), 0, Math.cos(angle)],
        mirror: true,
        sink: 0,
        bone: hips,
        name: `fallenLeaf${i}`,
      },
    );
  });

  for (const [index, x, z] of [
    [0, -0.37, -0.27],
    [1, 0.36, -0.38],
    [2, 0.39, 0.12],
  ]) {
    const hit = rockSurface.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) continue;
    for (let j = 0; j < 4; j++) {
      const spread = (j - 1.5) * 0.017;
      littleLeaf(
        `mossGrass${index}_${j}`,
        [x + spread * 0.25, hit.at.y + 0.003, z],
        [
          x + spread,
          hit.at.y + 0.047 + (j % 2) * 0.021,
          z - 0.016,
        ],
        0.0055,
        j % 2 === 0 ? MOSS_LIGHT : LEAF,
      );
    }
  }

  return b.root;
}

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  paint,
  mix,
  noise,
  svg,
  type Joint,
  type Paint,
} from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

/*
  Art-direction changes:
  1. Replace the raised spectacle-like eye masks with continuous painted facial
     markings and almond-shaped eyes; soften the muzzle and cheek construction.
  2. Shorten the legs and torso, broaden the paws, and rebuild the tail with a
     properly rounded tip for a compact, unmistakably red-panda silhouette.
  3. Replace the pedestal-like stone with an irregular woodland boulder, keeping
     genuine flat paw contacts and concentrating moss around its broken edges.
  4. Refine the fantasy styling: restrained jade embroidery, a leaf-shaped
     ornament, warm cream fur, cooler shadows, and delicate luminous flowers.
*/

export const meta = {
  name: "Windrest Red Panda",
  description:
    "A compact red panda balancing on a weathered mossy boulder, with painted cream facial markings, honey-amber eyes, a sweeping ringed tail, and an embroidered jade woodland kerchief.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Windrest Red Panda",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(7319);
  type P = [number, number, number];
  type V = P | THREE.Vector3;
  type Fill = string | Paint;

  const vector = (p: V) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(...p);

  const INK = "#352b35";
  const RUST = cel("#d67a49", "#a65340");
  const SUN = cel("#e79456", "#b96444");
  const RED = cel("#ba6144", "#87463c");
  const CREAM = cel("#f5e6c9", "#cfbda4");
  const IVORY = cel("#fff2d9", "#dac9ae");
  const DARK = cel("#493b40", "#302e36");
  const DARK_LIGHT = cel("#5c4748", "#3b333c");
  const EAR = cel("#c18a73", "#96685f");
  const JADE = cel("#438d7e", "#2d6265");
  const JADE_DARK = cel("#2e6966", "#294c55");
  const GOLD = cel("#e7c47e", "#a47d50");
  const LEAF = cel("#719a72", "#416c5c");
  const LEAF_LIGHT = cel("#a5bc7b", "#6b8b5a");
  const MOSS = cel("#829c60", "#506d4f");
  const MOSS_LIGHT = cel("#acbc76", "#6e8955");
  const key = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

  const furPaint = paint((p, n) => {
    const drift = noise(p, 0.15, 14);
    const lit = n.dot(key) > 0.1;
    if (n.y < -0.38) return lit ? "#8e493c" : "#674039";
    return lit
      ? mix("#d67a49", "#e49154", drift * 0.65)
      : mix("#99513f", "#b36346", drift * 0.6);
  });

  const stonePaint = paint((p, n) => {
    const drift = noise(p, 0.17, 9);
    const fine = noise(p, 0.035, 24);
    let color = mix(
      "#485c65",
      "#8e9a98",
      drift * 0.65 + Math.max(0, n.y) * 0.19,
    );
    if (n.y > 0.6) {
      const moss = noise(p, 0.105, 17);
      if (moss > 0.49) {
        return mix("#637b52", "#a5b573", (moss - 0.49) * 2.4);
      }
    }
    if (n.y < 0.3 && fine > 0.73) {
      color = mix(color, "#b3b7a3", 0.28);
    }
    return color;
  });

  const clothPaint = paint((p, n) => {
    const weave = Math.sin(p.x * 680) * Math.sin(p.y * 680);
    const base = n.z > 0.4 ? "#3d8b7c" : "#315f67";
    return mix(base, "#acd1b1", weave > 0.78 ? 0.065 : 0);
  });

  const eyeTexture = svg(
    `<svg viewBox="0 0 112 104">
      <defs>
        <clipPath id="eye">
          <path d="M10 52 C23 19 61 12 92 36 L103 49
                   C91 80 58 92 28 75Z"/>
        </clipPath>
        <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#654536"/>
          <stop offset=".43" stop-color="#b88443"/>
          <stop offset=".76" stop-color="#edc46a"/>
          <stop offset="1" stop-color="#fff0b0"/>
        </linearGradient>
      </defs>
      <path d="M5 52 C20 15 61 9 95 33 L108 48
               C94 85 58 97 25 80Z" fill="#352b35"/>
      <g clip-path="url(#eye)">
        <rect width="112" height="104" fill="#fff2d8"/>
        <ellipse cx="56" cy="54" rx="29" ry="35" fill="url(#amber)"/>
        <ellipse cx="57" cy="52" rx="12" ry="23" fill="#352b35"/>
        <path d="M35 75 L40 69 M49 84 L50 76 M65 82 L63 74 M77 70 L72 67"
              stroke="#fff0b4" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="42" cy="35" rx="8" ry="10" fill="#ffffff"/>
        <ellipse cx="73" cy="68" rx="4" ry="5" fill="#fffbea"/>
      </g>
      <path d="M7 50 C20 18 61 10 94 33"
            fill="none" stroke="#352b35" stroke-width="6"
            stroke-linecap="round"/>
      <path d="M28 81 Q60 96 91 74"
            fill="none" stroke="#966c53" stroke-width="2.8"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 80 112">
      <path d="M40 108 C31 88 18 78 22 63 C26 49 34 42 29 25
               C38 31 41 39 40 49 C49 35 48 20 43 5
               C61 24 67 45 58 66 C51 83 44 94 40 108Z"
            fill="#fff0d0"/>
      <path d="M40 95 Q36 77 43 61 Q50 46 47 31"
            fill="none" stroke="#ffda9c" stroke-width="4"
            stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const embroideryTexture = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M9 14 L80 165 L151 14" fill="none"
            stroke="#214c51" stroke-width="11" stroke-linejoin="round"/>
      <path d="M14 14 L80 153 L146 14" fill="none"
            stroke="#ebcb83" stroke-width="5"/>
      <path d="M29 30 L80 136 L131 30" fill="none"
            stroke="#b4dfc3" stroke-width="3" stroke-dasharray="7 8"/>
      <path d="M80 40 C56 53 49 76 80 100 C110 76 104 53 80 40Z"
            fill="#285c60" stroke="#efd18b" stroke-width="4"/>
      <path d="M80 89 V52 M80 76 L66 65 M80 69 L92 58"
            fill="none" stroke="#b4e6c8" stroke-width="5"
            stroke-linecap="round"/>
      <circle cx="80" cy="118" r="4" fill="#ffe9b2"/>
    </svg>`,
    { size: 384 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 240 110">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 76 H57 L70 62 M218 76 H183 L170 62"
              stroke="#365357" stroke-width="8"/>
        <path d="M22 74 H57 L70 60 M218 74 H183 L170 60"
              stroke="#8eb29c" stroke-width="3"/>
        <path d="M120 91 C110 70 82 61 87 40
                 C92 25 111 28 120 49
                 C129 28 147 26 153 40
                 C159 62 129 71 120 91Z"
              stroke="#355357" stroke-width="11"/>
        <path d="M120 88 C112 68 85 60 90 41
                 C95 29 111 31 120 51
                 C129 31 145 29 150 41
                 C156 60 128 69 120 88Z"
              stroke="#9fc8aa" stroke-width="3.7"/>
        <path d="M120 81 V54 M120 68 L106 54 M120 68 L134 54"
              stroke="#b4d7b5" stroke-width="3.5"/>
        <path d="M53 28 L62 37 L53 46 L44 37Z
                 M187 28 L196 37 L187 46 L178 37Z"
              stroke="#91b29b" stroke-width="3.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M49 112 C25 100 8 77 12 47 C16 19 48 11 84 4
               C89 39 89 72 66 96Z"
            fill="#65865c" stroke="#3c6552" stroke-width="5"/>
      <path d="M49 108 Q54 61 80 14 C47 22 28 41 26 63
               C25 83 37 98 49 108Z" fill="#b2bc7d"/>
      <path d="M48 111 Q52 65 80 15 M55 80 L32 60
               M63 59 L43 41 M57 73 L78 59"
            stroke="#dfd69e" stroke-width="4" fill="none"
            stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 100">
      <g stroke="#5b93a0" stroke-width="3" stroke-linejoin="round">
        <path d="M50 48 C26 36 30 6 47 5 C63 3 70 30 50 48Z"
              fill="#cef5e8"/>
        <path d="M51 49 C54 20 84 14 93 28 C103 44 79 59 51 49Z"
              fill="#a6dfe6"/>
        <path d="M51 51 C80 47 96 71 83 85 C70 98 51 78 51 51Z"
              fill="#8fc9df"/>
        <path d="M49 51 C66 75 49 99 33 93 C16 86 26 62 49 51Z"
              fill="#bae6e8"/>
        <path d="M48 49 C23 66 1 48 8 33 C15 17 40 27 48 49Z"
              fill="#e5f9e8"/>
      </g>
      <circle cx="50" cy="50" r="11" fill="#fff0ba"
              stroke="#81a49a" stroke-width="3"/>
      <circle cx="47" cy="46" r="3.8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // A separate setting root keeps scenery out of the animal's moving skeleton.
  const stage = b.joint("setting", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
  });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 0.426, -0.265],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.426, -0.265],
      [0, 0.443, -0.105],
      [0, 0.455, 0.065],
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
      [0, 0.455, 0.065],
      [0, 0.505, 0.155],
      [0, 0.566, 0.220],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.606, 0.255],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = b.region({
    at: [0, 0.606, 0.255],
    bone: head,
    scale: 1,
  });
  const hp = (p: P) => H.p(p);

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, -0.078, 0.079]),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const earJoints = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: hp([s * 0.139, 0.106, -0.017]),
      dir: [s * 0.20, 1, 0],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.437, -0.365],
      [0.075, 0.442, -0.535],
      [0.235, 0.458, -0.653],
      [0.420, 0.499, -0.663],
      [0.572, 0.568, -0.572],
      [0.622, 0.645, -0.475],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  const legs: {
    front: boolean;
    side: number;
    tag: string;
    chain: ReturnType<typeof b.chain>;
    foot: P;
    toes: { joint: Joint; a: P; tip: P }[];
  }[] = [];

  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const tag = `${front ? "F" : "H"}${s === 1 ? "L" : "R"}`;
      const root: P = front
        ? [s * 0.123, 0.455, 0.061]
        : [s * 0.136, 0.425, -0.255];
      const elbow: P = front
        ? [s * 0.147, 0.332, 0.100]
        : [s * 0.173, 0.322, -0.229];
      const foot: P = front
        ? [s * 0.170, 0.219, 0.154]
        : [s * 0.185, 0.219, -0.287];
      const chain = b.chain(`leg${tag}`, [root, elbow, foot], {
        parent: front ? spine.tip! : hips,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`]
          : [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [foot[0], 0.18, foot[2] + 0.025],
      });
      const toes: { joint: Joint; a: P; tip: P }[] = [];
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 0.035;
        const a: P = [foot[0] + dx, 0.210, foot[2] + 0.031];
        const tip: P = [
          foot[0] + dx * 1.1,
          0.202,
          foot[2] + 0.083 - Math.abs(i - 1) * 0.005,
        ];
        const joint = b.joint(`toe${tag}${i + 1}`, {
          parent: chain.tip!,
          at: a,
          aim: tip,
          role: "digit",
        });
        toes.push({ joint, a, tip });
      }
      legs.push({ front, side: s, tag, chain, foot, toes });
    }
  }

  function ellipsoid(
    name: string,
    at: V,
    size: P,
    color: Fill,
    bone: Joint = head,
    rotation: P = [0, 0, 0],
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 10), color, {
      name,
      at,
      scale: size,
      color,
      bone,
      rotation,
      flat: true,
    });
  }

  function blade(
    name: string,
    base: V,
    tip: V,
    width: number,
    color: Fill,
    bone: Joint,
    thickness = 0.016,
  ) {
    const a = vector(base);
    const end = vector(tip);
    const delta = end.clone().sub(a);
    const side = new THREE.Vector3(-delta.y, delta.x, 0);
    if (side.lengthSq() < 0.000001) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width / 2);
    return b.slab(
      [
        a.clone().sub(side),
        a.clone().addScaledVector(delta, 0.48).sub(side.clone().multiplyScalar(0.72)),
        end,
        a.clone().addScaledVector(delta, 0.46).add(side.clone().multiplyScalar(0.72)),
        a.clone().add(side),
      ],
      { color, thickness, bone, name },
    );
  }

  function leaf(
    name: string,
    base: V,
    tip: V,
    width: number,
    color: Fill,
  ) {
    const a = vector(base);
    const end = vector(tip);
    const delta = end.clone().sub(a);
    const side = new THREE.Vector3(-delta.y, delta.x, 0.003);
    if (side.lengthSq() < 0.000001) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width);
    const middle = a.clone().lerp(end, 0.48);
    return b.slab(
      [a, middle.clone().sub(side), end, middle.clone().add(side)],
      {
        name,
        color,
        thickness: 0.003,
        bone: stage,
      },
    );
  }

  // Markings are painted across a single head volume, not raised white discs.
  const facePaint = paint((p, n) => {
    const x = Math.abs(p.x);
    const y = p.y - 0.606;
    const z = p.z - 0.255;
    const eyeMask =
      Math.pow((x - 0.091) / 0.082, 2) +
      Math.pow((y - 0.025) / 0.082, 2);
    const cheekMask =
      Math.pow((x - 0.132) / 0.077, 2) +
      Math.pow((y + 0.054) / 0.050, 2);
    const cream =
      z > 0.045 &&
      ((eyeMask < 1 && y > -0.038) || cheekMask < 1);
    if (cream) return n.dot(key) > 0.1 ? "#f7ebd2" : "#d0bda3";
    return n.dot(key) > 0.1 ? "#dc8150" : "#a55640";
  });

  const skull = ellipsoid(
    "paintedRedPandaHead",
    hp([0, 0, 0]),
    [0.186, 0.139, 0.147],
    facePaint,
    head,
    [0, 0, 0],
    20,
  );

  for (const s of [1, -1]) {
    const tag = s === 1 ? "L" : "R";

    b.decal(skull, eyeTexture, {
      name: `almondAmberEye${tag}`,
      at: hp([s * 0.084, 0.026, 0.142]),
      dir: [s * 0.23, 0.015, 1],
      size: [0.086, 0.081],
      mirror: s === 1,
      segments: 10,
      lift: 0.0013,
      bone: head,
    });

    const faceSurface = b.surface(skull);
    const tear = faceSurface.drape(
      bezier(
        hp([s * 0.105, -0.004, 0.143]),
        hp([s * 0.126, -0.029, 0.132]),
        hp([s * 0.138, -0.052, 0.116]),
      ),
      { lift: 0.001 },
    );
    b.sweep(tear, [0.010, 0.002], {
      name: `rustTearMark${tag}`,
      color: RED,
      bone: head,
      sides: 6,
      caps: "flat",
    });

    ellipsoid(
      `integratedCreamCheek${tag}`,
      hp([s * 0.142, -0.057, 0.080]),
      [0.063, 0.039, 0.047],
      CREAM,
      head,
      [0, 0, -s * 8],
    );

    for (let i = 0; i < 3; i++) {
      blade(
        `sweptCheekFur${tag}${i}`,
        hp([s * (0.143 + i * 0.002), -0.024 - i * 0.020, 0.081]),
        hp([s * (0.215 - i * 0.008), -0.033 - i * 0.028, 0.042]),
        0.038 - i * 0.002,
        i === 0 ? IVORY : CREAM,
        head,
        0.022,
      );
    }

    blade(
      `softCreamBrow${tag}`,
      hp([s * 0.061, 0.076, 0.110]),
      hp([s * 0.127, 0.077, 0.082]),
      0.015,
      IVORY,
      head,
      0.007,
    );
  }

  b.decal(skull, foreheadTexture, {
    name: "ivoryForeheadFlame",
    at: hp([0, 0.080, 0.145]),
    dir: [0, 0.20, 1],
    size: [0.035, 0.060],
    segments: 8,
    lift: 0.0013,
    bone: head,
  });

  // Rounded, overlapping muzzle cushions replace the horizontal moustache.
  ellipsoid(
    "muzzleFoundation",
    hp([0, -0.057, 0.117]),
    [0.086, 0.039, 0.046],
    CREAM,
  );
  for (const s of [1, -1]) {
    ellipsoid(
      `upperMuzzle${s === 1 ? "L" : "R"}`,
      hp([s * 0.029, -0.057, 0.144]),
      [0.047, 0.030, 0.039],
      IVORY,
      head,
      [0, 0, -s * 6],
      14,
    );
    for (let i = 0; i < 2; i++) {
      ellipsoid(
        `muzzleFreckle${s}_${i}`,
        hp([s * (0.047 + i * 0.013), -0.054 + i * 0.008, 0.176 - i * 0.009]),
        [0.0024, 0.0025, 0.0015],
        "#9c8065",
        head,
        [0, 0, 0],
        6,
      );
    }
  }

  ellipsoid(
    "separateLowerJaw",
    hp([0, -0.088, 0.128]),
    [0.062, 0.016, 0.039],
    CREAM,
    jaw,
  );

  b.sweep(
    bezier(
      hp([-0.045, -0.081, 0.165]),
      hp([0, -0.091, 0.173]),
      hp([0.045, -0.081, 0.165]),
    ),
    0.0021,
    {
      name: "smallGentleSmile",
      color: "#74564a",
      bone: jaw,
      sides: 5,
    },
  );

  b.extrude(
    [
      [-0.024, 0.006],
      [-0.016, 0.014],
      [0.016, 0.014],
      [0.024, 0.006],
      [0, -0.013],
    ],
    {
      name: "roundedTriangularNose",
      at: hp([0, -0.034, 0.181]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: INK,
      bone: head,
    },
  );
  ellipsoid(
    "noseHighlight",
    hp([-0.007, -0.024, 0.189]),
    [0.006, 0.002, 0.0013],
    "#b59a88",
    head,
    [0, 0, -12],
    6,
  );
  b.sweep(
    [hp([0, -0.047, 0.189]), hp([0, -0.080, 0.177])],
    0.0018,
    {
      name: "shortPhiltrum",
      color: "#74564a",
      bone: head,
      sides: 5,
      caps: "flat",
    },
  );

  // Broad cream-rimmed ears, deliberately less tall and rabbit-like.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const tag = s === 1 ? "L" : "R";
    const ear = earJoints[i];
    const earAt = hp([s * 0.143, 0.105, -0.019]);
    const X: P = [s, 0, 0];
    const Y: P = [s * 0.20, 1, -0.10];

    const outer: [number, number][] = [
      [-0.062, -0.022],
      [0.057, -0.022],
      [0.073, 0.027],
      [0.042, 0.093],
      [0.015, 0.108],
      [-0.033, 0.080],
      [-0.070, 0.023],
    ];
    b.extrude(outer, {
      name: `roundedEarBack${tag}`,
      at: earAt,
      x: X,
      y: Y,
      thickness: 0.037,
      bevel: 0.006,
      smoothing: 1,
      color: RED,
      bone: ear,
    });

    b.extrude(
      outer.map(([x, y]) => [x * 0.92, y * 0.92]),
      {
        name: `wideIvoryEarRim${tag}`,
        at: hp([s * 0.143, 0.106, 0.002]),
        x: X,
        y: Y,
        thickness: 0.010,
        bevel: 0.002,
        smoothing: 1,
        color: IVORY,
        bone: ear,
      },
    );

    b.extrude(
      outer.map(([x, y]) => [x * 0.64, y * 0.68 + 0.005]),
      {
        name: `warmEarInterior${tag}`,
        at: hp([s * 0.143, 0.107, 0.009]),
        x: X,
        y: Y,
        thickness: 0.005,
        smoothing: 1,
        color: EAR,
        bone: ear,
      },
    );

    for (let j = 0; j < 2; j++) {
      blade(
        `earBaseFluff${tag}${j}`,
        hp([s * (0.127 + j * 0.028), 0.105, 0.018]),
        hp([s * (0.139 + j * 0.036), 0.135 + j * 0.004, 0.014]),
        0.027,
        CREAM,
        ear,
        0.007,
      );
    }
  }

  for (let i = -1; i <= 1; i++) {
    blade(
      `crownTuft${i + 1}`,
      hp([i * 0.028, 0.122, -0.010]),
      hp([i * 0.032 + 0.007, 0.149 - Math.abs(i) * 0.008, -0.021]),
      0.036,
      i === 0 ? SUN : RUST,
      head,
      0.015,
    );
  }

  const body = b.loft(
    [
      { at: [0, 0.425, -0.369], w: 0.224, h: 0.214 },
      { at: spine.at(0.10), w: 0.343, h: 0.287 },
      { at: spine.at(0.50), w: 0.355, h: 0.301 },
      { at: spine.at(0.91), w: 0.302, h: 0.280 },
      { at: [0, 0.457, 0.128], w: 0.218, h: 0.219 },
    ],
    {
      name: "compactPlushTorso",
      color: furPaint,
      bone: [hips, spine],
      sides: 10,
      smooth: false,
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.122 - t * 0.012, 0.113 - t * 0.010],
    {
      name: "shortFurryNeck",
      color: RUST,
      sides: 10,
      smooth: false,
    },
  );

  const bodySurface = b.surface(body);
  for (const s of [1, -1]) {
    const tag = s === 1 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const hit = bodySurface.ray(
        [s * 0.45, 0.417, -0.265 + i * 0.075],
        [-s, 0, 0],
      );
      if (!hit) continue;
      const p = hit.at;
      blade(
        `sweptFlankFur${tag}${i}`,
        [p.x - s * 0.009, p.y + 0.023, p.z + 0.018],
        [p.x + s * 0.018, p.y - 0.026, p.z - 0.040],
        0.044,
        i === 1 ? SUN : RUST,
        hit.bone ?? hips,
        0.018,
      );
    }

    for (let i = 0; i < 2; i++) {
      blade(
        `shoulderFluff${tag}${i}`,
        [s * (0.105 + i * 0.012), 0.508 - i * 0.021, 0.095],
        [s * (0.180 + i * 0.010), 0.478 - i * 0.026, 0.068],
        0.047,
        i === 0 ? SUN : RUST,
        spine.tip!,
        0.021,
      );
    }
  }

  for (const leg of legs) {
    b.sweep(
      leg.chain,
      (t) =>
        leg.front
          ? [0.071 - t * 0.019, 0.074 - t * 0.022]
          : [0.086 - t * 0.030, 0.084 - t * 0.027],
      {
        name: `shortDarkLeg${leg.tag}`,
        color: DARK,
        sides: 8,
        smooth: false,
      },
    );

    const bone = leg.chain.tip!;
    ellipsoid(
      `broadPaw${leg.tag}`,
      [leg.foot[0], 0.220, leg.foot[2] + 0.018],
      [0.069, 0.040, 0.067],
      DARK,
      bone,
    );
    ellipsoid(
      `pawTop${leg.tag}`,
      [leg.foot[0] - 0.004, 0.240, leg.foot[2] + 0.025],
      [0.048, 0.018, 0.044],
      DARK_LIGHT,
      bone,
    );

    for (let i = 0; i < leg.toes.length; i++) {
      const toe = leg.toes[i];
      b.sweep([toe.a, toe.tip], [0.022, 0.019], {
        name: `roundedToe${leg.tag}${i}`,
        color: i === 1 ? DARK_LIGHT : DARK,
        bone: toe.joint,
        sides: 6,
      });
      b.spike(
        [toe.tip[0], 0.204, toe.tip[2] + 0.003],
        [toe.tip[0], 0.200, toe.tip[2] + 0.013],
        null,
        0.0042,
        {
          name: `smallClaw${leg.tag}${i}`,
          color: "#bcae96",
          bone: toe.joint,
          sides: 5,
        },
      );
    }
  }

  // A continuous closed-ended plume: no collapsed ring or hollow-looking tip.
  const tailBands: [number, Fill][] = [];
  for (let i = 0; i < 10; i++) {
    tailBands.push([
      (i + 1) / 10,
      i === 9
        ? RED
        : i % 2 === 0
          ? cel("#b76345", "#88483c")
          : cel("#e7a16a", "#b77550"),
    ]);
  }

  b.sweep(
    tail,
    (t) => {
      const broad = 0.079 + Math.sin(t * Math.PI) * 0.014;
      const taper =
        t < 0.78 ? 1 : 1 - 0.65 * Math.pow((t - 0.78) / 0.22, 1.2);
      const r = broad * taper;
      return [r, r * 0.96];
    },
    {
      name: "roundedBalancingTail",
      color: RED,
      bands: tailBands,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "round" },
    },
  );

  // Restrained fantasy styling stays beneath and beside the readable face.
  const neckSurface = b.surface([body, neckTube]);
  const collar = neckSurface.drape(
    catmull(
      [
        [0, 0.475, 0.240],
        [0.131, 0.483, 0.152],
        [0.103, 0.538, 0.094],
        [0, 0.563, 0.095],
        [-0.103, 0.538, 0.094],
        [-0.131, 0.483, 0.152],
      ],
      { closed: true },
    ),
    { lift: 0.006 },
  );
  b.sweep(collar, 0.010, {
    name: "fittedJadeNeckLoop",
    color: JADE_DARK,
    sides: 6,
  });

  const bib = b.extrude(
    [
      [-0.086, 0.067],
      [0.086, 0.067],
      [0.064, 0.005],
      [0, -0.069],
      [-0.064, 0.005],
    ],
    {
      name: "smallEmbroideredKerchief",
      at: [0, 0.405, 0.217],
      x: [1, 0, 0],
      y: [0, 1, 0.32],
      thickness: 0.009,
      bevel: 0.002,
      color: clothPaint,
      bone: spine.tip!,
    },
  );
  b.decal(bib, embroideryTexture, {
    name: "goldLeafEmbroidery",
    at: [0, 0.406, 0.232],
    dir: [0, -0.30, 1],
    size: [0.151, 0.132],
    segments: 6,
    lift: 0.0013,
    bone: spine.tip!,
  });

  const knotHit = neckSurface.ray(
    [-0.40, 0.505, 0.151],
    [1, 0, 0],
  );
  if (knotHit) {
    const p = knotHit.at;
    ellipsoid(
      "sideKerchiefKnot",
      [p.x - 0.009, p.y, p.z],
      [0.023, 0.022, 0.026],
      JADE,
      neck.joints[0],
      [0, 0, -20],
      8,
    );

    for (let i = 0; i < 2; i++) {
      const tip: P = [
        p.x - 0.040 - i * 0.017,
        p.y - 0.050 + i * 0.014,
        p.z - 0.045 - i * 0.019,
      ];
      blade(
        `shortSilkRibbon${i}`,
        [p.x - 0.008, p.y, p.z],
        tip,
        0.033 - i * 0.005,
        i === 0 ? JADE : JADE_DARK,
        neck.joints[0],
        0.007,
      );
      b.rod(
        [tip[0] - 0.007, tip[1] + 0.004, tip[2]],
        [tip[0] + 0.007, tip[1] - 0.004, tip[2]],
        0.002,
        {
          name: `goldRibbonHem${i}`,
          color: GOLD,
          bone: neck.joints[0],
          sides: 5,
        },
      );
    }

    const center: P = [p.x - 0.027, p.y + 0.001, p.z + 0.008];
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.007, 10), GOLD, {
      name: "leafCharmGoldSetting",
      at: center,
      dir: [-1, 0.05, 0.1],
      bone: neck.joints[0],
    });
    glow(
      b.part(
        new THREE.CylinderGeometry(0.017, 0.017, 0.008, 10),
        "#9ad6bc",
        {
          name: "jadeLeafCharm",
          at: [center[0] - 0.004, center[1], center[2]],
          dir: [-1, 0.05, 0.1],
          bone: neck.joints[0],
        },
      ),
      0.35,
    );
    b.rod(
      [center[0] - 0.009, center[1] - 0.012, center[2]],
      [center[0] - 0.009, center[1] + 0.012, center[2]],
      0.0017,
      {
        name: "charmLeafVein",
        color: "#e7f4d2",
        bone: neck.joints[0],
        sides: 5,
      },
    );
  }

  // Irregular rock: a modest flat contact area surrounded by broken shoulders.
  function stoneGeometry() {
    const count = 11;
    const bottom: THREE.Vector3[] = [];
    const shoulder: THREE.Vector3[] = [];
    const top: THREE.Vector3[] = [];
    const positions: number[] = [];

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.14;
      const irregular = 0.91 + random() * 0.15;
      bottom.push(
        new THREE.Vector3(
          Math.cos(a) * 0.379 * irregular,
          0,
          -0.075 + Math.sin(a) * 0.425 * irregular,
        ),
      );
      shoulder.push(
        new THREE.Vector3(
          Math.cos(a) * 0.438 * irregular,
          0.054 + random() * 0.051,
          -0.075 + Math.sin(a) * 0.473 * irregular,
        ),
      );
      top.push(
        new THREE.Vector3(
          Math.cos(a) * 0.361 * irregular,
          0.18,
          -0.075 + Math.sin(a) * 0.403 * irregular,
        ),
      );
    }

    const tri = (
      a: THREE.Vector3,
      c: THREE.Vector3,
      d: THREE.Vector3,
    ) => {
      positions.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    };

    const upperCenter = new THREE.Vector3(0, 0.18, -0.075);
    const lowerCenter = new THREE.Vector3(0, 0, -0.075);
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      tri(upperCenter, top[j], top[i]);
      tri(top[i], top[j], shoulder[j]);
      tri(top[i], shoulder[j], shoulder[i]);
      tri(shoulder[i], shoulder[j], bottom[j]);
      tri(shoulder[i], bottom[j], bottom[i]);
      tri(lowerCenter, bottom[i], bottom[j]);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.computeVertexNormals();
    return geometry;
  }

  const rock = b.part(stoneGeometry(), stonePaint, {
    name: "irregularWoodlandBoulder",
    at: [0, 0, 0],
    bone: stage,
    flat: true,
  });
  const rockSurface = b.surface(rock);

  const runeHit = rockSurface.ray([0, 0.105, 0.8], [0, 0, -1]);
  if (runeHit) {
    b.decal(rock, runeTexture, {
      name: "subtleWeatheredLeafInscription",
      at: runeHit,
      dir: [0, 0.18, 1],
      size: [0.175, 0.077],
      lift: 0.0012,
      segments: 8,
      bone: stage,
    });
  }

  const mossHits = rockSurface.scatter(31, {
    rng: rng(52),
    minDist: 0.055,
    filter: (h) =>
      h.n.y > 0.45 &&
      (Math.abs(h.at.x) > 0.238 || h.at.z < -0.370 || h.at.z > 0.267),
  });

  mossHits.forEach((hit, i) => {
    const radius = 0.016 + random() * 0.022;
    for (let j = 0; j < 2; j++) {
      const r = radius * (j === 0 ? 1 : 0.66);
      const geometry = new THREE.IcosahedronGeometry(r, 1);
      geometry.scale(1.24, 0.36, 0.87);
      b.stick(
        geometry,
        (i + j) % 4 === 0 ? MOSS_LIGHT : MOSS,
        j === 0 ? hit : hit.moved([r * 0.8, -0.002, r * 0.4]),
        {
          name: `mossCushion${i}_${j}`,
          embed: 0.48,
          spin: random() * 180,
        },
      );
    }
    if (i % 5 === 0) {
      for (let j = 0; j < 3; j++) {
        const p = hit.at;
        b.part(
          new THREE.IcosahedronGeometry(0.004 + j * 0.0006, 0),
          j === 0 ? "#c2cd8c" : "#a6b979",
          {
            name: `mossBud${i}_${j}`,
            at: [
              p.x + (j - 1) * 0.008,
              p.y + 0.007,
              p.z + Math.sin(j * 2) * 0.007,
            ],
            bone: stage,
          },
        );
      }
    }
  });

  // A few moss tongues creep down the rock rather than stopping at its rim.
  for (const s of [1, -1]) {
    const path = rockSurface.drape(
      [
        [s * 0.29, 0.18, 0.16],
        [s * 0.33, 0.13, 0.19],
        [s * 0.35, 0.077, 0.21],
      ],
      { lift: 0.002 },
    );
    b.sweep(path, [0.015, 0.004], {
      name: `trailingMoss${s}`,
      color: MOSS,
      bone: stage,
      sides: 6,
      caps: "round",
    });
  }

  const flecks = rockSurface.scatter(12, {
    rng: rng(63),
    minDist: 0.07,
    filter: (h) => h.n.y < 0.55 && h.at.y > 0.025,
  });
  flecks.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.009 + (i % 3) * 0.004, 0.0015, 0.004),
      i % 3 === 0 ? "#b2b7a4" : "#73898d",
      hit,
      {
        name: `stoneMineral${i}`,
        spin: i * 37,
        embed: 0.5,
      },
    );
  });

  for (const rough of [
    [
      [-0.26, 0.17, 0.20],
      [-0.29, 0.12, 0.24],
      [-0.27, 0.058, 0.28],
    ],
    [
      [0.25, 0.16, 0.21],
      [0.30, 0.11, 0.23],
      [0.29, 0.056, 0.27],
    ],
    [
      [-0.35, 0.14, -0.16],
      [-0.38, 0.055, -0.19],
    ],
  ]) {
    b.sweep(rockSurface.drape(rough, { lift: 0.0006 }), 0.0017, {
      name: "weatheredRockCrack",
      color: "#3e545c",
      bone: stage,
      sides: 4,
      caps: "flat",
    });
  }

  function fern(
    x: number,
    z: number,
    height: number,
    lean: number,
    index: number,
  ) {
    const hit = rockSurface.ray([x, 0.5, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y + 0.003;
    const top: P = [x + lean, y + height, z - 0.025];
    const path = bezier(
      [x, y, z],
      [x + lean * 0.4, y + height * 0.7, z],
      top,
    );
    b.sweep(path, [0.0025, 0.001], {
      name: `fernStem${index}`,
      color: "#a9b884",
      bone: stage,
      sides: 5,
    });

    for (let j = 0; j < 5; j++) {
      const p = path.at(0.17 + j * 0.145);
      const reach = height * (0.37 - j * 0.048);
      for (const s of [1, -1]) {
        leaf(
          `fernLeaf${index}_${j}_${s}`,
          p,
          [p.x + s * reach, p.y + 0.018, p.z - 0.010],
          reach * 0.23,
          j % 2 === 0 ? LEAF : LEAF_LIGHT,
        );
      }
    }
    leaf(
      `fernCrown${index}`,
      path.at(0.82),
      [top[0], top[1] + 0.013, top[2] - 0.003],
      0.007,
      LEAF_LIGHT,
    );
  }

  fern(-0.285, -0.305, 0.119, -0.033, 0);
  fern(0.285, 0.184, 0.094, 0.026, 1);
  fern(-0.294, 0.155, 0.071, -0.022, 2);

  function flower(
    x: number,
    z: number,
    height: number,
    index: number,
  ) {
    const hit = rockSurface.ray([x, 0.5, z], [0, -1, 0]);
    if (!hit) return;
    const y = hit.at.y;
    const top: P = [x + 0.009, y + height, z];
    b.sweep(
      bezier(
        [x, y, z],
        [x - 0.009, y + height * 0.6, z - 0.004],
        top,
      ),
      [0.0022, 0.0013],
      {
        name: `blueflowerStem${index}`,
        color: "#6d9274",
        bone: stage,
        sides: 5,
      },
    );
    for (const s of [1, -1]) {
      leaf(
        `blueflowerLeaf${index}_${s}`,
        [x, y + height * 0.34, z],
        [x + s * 0.022, y + height * 0.59, z + 0.004],
        0.007,
        LEAF,
      );
    }

    glow(
      b.part(new THREE.PlaneGeometry(0.043, 0.043), "#ffffff", {
        name: `blueStarBlossom${index}`,
        at: top,
        dir: [0.1, 0.66, 0.75],
        axis: "z",
        texture: flowerTexture,
        bone: stage,
      }),
      0.30,
    );
    b.part(new THREE.PlaneGeometry(0.043, 0.043), "#ffffff", {
      name: `blueStarBlossomBack${index}`,
      at: [top[0], top[1] - 0.0007, top[2] - 0.0007],
      dir: [-0.1, -0.66, -0.75],
      axis: "z",
      texture: flowerTexture,
      bone: stage,
    });
    glow(
      b.part(new THREE.IcosahedronGeometry(0.004, 0), "#fff0bd", {
        name: `flowerPollen${index}`,
        at: [top[0], top[1] + 0.003, top[2] + 0.003],
        bone: stage,
      }),
      0.55,
    );
  }

  flower(-0.28, 0.224, 0.069, 0);
  flower(-0.322, 0.183, 0.047, 1);
  flower(0.305, -0.274, 0.080, 2);
  flower(0.271, 0.238, 0.054, 3);

  const fallenLeaves = [
    [-0.196, 0.259, 0.08],
    [0.234, -0.377, -0.4],
    [-0.310, -0.100, 0.7],
    [0.316, 0.035, -0.5],
    [0.055, 0.279, 0.5],
  ];
  fallenLeaves.forEach(([x, z, angle], i) => {
    const hit = rockSurface.ray([x, 0.5, z], [0, -1, 0]);
    if (!hit) return;
    b.cards(
      [frame([hit.at.x, hit.at.y + 0.002, hit.at.z], [0, 1, 0])],
      leafTexture,
      {
        name: `fallenLeaf${i}`,
        size: [0.026 + (i % 2) * 0.006, 0.045],
        lean: 90,
        flow: [Math.sin(angle), 0, Math.cos(angle)],
        mirror: true,
        sink: 0,
        bone: stage,
      },
    );
  });

  for (const [index, x, z] of [
    [0, -0.29, -0.22],
    [1, 0.278, -0.31],
    [2, 0.315, 0.085],
  ]) {
    const hit = rockSurface.ray([x, 0.5, z], [0, -1, 0]);
    if (!hit) continue;
    for (let j = 0; j < 4; j++) {
      const spread = (j - 1.5) * 0.012;
      leaf(
        `mossGrass${index}_${j}`,
        [x + spread * 0.25, hit.at.y + 0.002, z],
        [
          x + spread,
          hit.at.y + 0.035 + (j % 2) * 0.015,
          z - 0.013,
        ],
        0.004,
        j % 2 === 0 ? LEAF_LIGHT : LEAF,
      );
    }
  }

  return b.root;
}
```
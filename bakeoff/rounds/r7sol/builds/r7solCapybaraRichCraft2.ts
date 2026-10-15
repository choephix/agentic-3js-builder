import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  grain,
  mix,
  noise,
  gradient,
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "A Little Lift",
  description:
    "A placid, loaf-shaped capybara and its tiny turquoise passenger, on a sunlit lily pond. A jointed primitive puppet with painted fur, expressive faces, individual toes and feathered wings.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "aLittleLift",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(84017);

  const C = {
    bark: "#593e32",
    brown: "#99704b",
    honey: "#b88c5b",
    pale: "#d9b783",
    cream: "#f4dfad",
    dark: "#322b29",
    nose: "#58453b",
    ear: "#ad7765",
    gold: "#e9b847",
    teal: "#249eaa",
    turquoise: "#65d4cc",
    blue: "#237080",
    navy: "#224d60",
    orange: "#f39444",
    coral: "#d86c49",
    water: "#62aaa5",
    rim: "#25535a",
    sand: "#cbbb8b",
    leaf: "#557d53",
    leafLight: "#8eac65",
    reed: "#71916a",
    white: "#fff6dc",
  };

  const coat = paint((p, n) => {
    const variation = noise(p, 0.15, 9);
    const warm = mix("#906749", "#ba9160", variation);
    const lit = mix(warm, "#d2aa72", Math.max(0, n.y) * 0.24);
    return mix(lit, "#735542", Math.max(0, -n.y) * 0.28);
  });
  const muzzlePaint = paint((p, n) =>
    mix(
      "#ac855d",
      "#d4b183",
      0.3 + noise(p, 0.11, 12) * 0.4 + Math.max(0, n.y) * 0.18,
    ),
  );
  const legPaint = gradient(
    coat,
    grain("#79583f", "#95704e", { size: 0.018, axis: "y", seed: 4 }),
    [0, 0.38, 0],
    [0, 0.1, 0],
  );
  const sandPaint = paint((p, n) =>
    mix(
      "#aa9e75",
      "#dacda1",
      0.3 + noise(p, 0.055, 32) * 0.42 + Math.max(0, n.y) * 0.22,
    ),
  );
  const stonePaint = paint((p, n) =>
    mix("#6c8179", "#a7b6a0", noise(p, 0.07, 6) * 0.6 + Math.max(0, n.y) * 0.3),
  );
  const wingPaint = paint((_p, _n, s) => {
    const t = Math.max(0, Math.min(1, s[1] / 0.15));
    return mix("#267488", "#66d5cd", t);
  });

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
      <ellipse cx="50" cy="53" rx="44" ry="42" fill="#49372d"/>
      <ellipse cx="50" cy="53" rx="35" ry="35" fill="#211f20"/>
      <path d="M23 64 Q48 87 77 63 Q64 87 45 87 Q27 84 23 64Z" fill="#866147"/>
      <ellipse cx="37" cy="34" rx="12" ry="10" fill="#fff9e5"/>
      <circle cx="65" cy="65" r="5" fill="#eadab4"/>
      <path d="M12 38 Q27 9 62 13" fill="none" stroke="#d5b487" stroke-width="5" stroke-linecap="round"/>
    `,
  );

  const noseDrawing = drawing(
    240,
    105,
    `
      <path d="M35 29 Q53 7 73 29 Q57 43 35 29Z" fill="#5c493c"/>
      <path d="M167 29 Q187 7 205 29 Q183 43 167 29Z" fill="#5c493c"/>
      <path d="M42 22 Q54 16 63 23 M177 23 Q188 16 199 22"
        fill="none" stroke="#dfbd8a" stroke-width="4" stroke-linecap="round"/>
      <g fill="#805f46">
        <circle cx="29" cy="61" r="3.6"/><circle cx="53" cy="70" r="3.6"/>
        <circle cx="73" cy="58" r="3.2"/><circle cx="167" cy="58" r="3.2"/>
        <circle cx="187" cy="70" r="3.6"/><circle cx="211" cy="61" r="3.6"/>
      </g>
      <path d="M113 46 Q120 53 127 46" fill="none" stroke="#95704f"
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
    48,
    72,
    `
      <g fill="none" stroke-linecap="round">
        <path d="M12 69 Q16 37 9 18" stroke="#644b38" stroke-width="3.5"/>
        <path d="M24 69 Q31 37 23 6" stroke="#e2bb80" stroke-width="4"/>
        <path d="M35 69 Q34 45 40 25" stroke="#77583e" stroke-width="3.5"/>
      </g>
    `,
    128,
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

  // All moving anatomy is declared before its geometry.
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
    { parent: hips, names: ["spine1", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.57, 0.2],
      [0, 0.69, 0.34],
      [0, 0.76, 0.43],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.76, 0.43],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.562, 0.43],
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
          [toeX, 0.124, spec.z + 0.055],
          [toeX + i * 0.008, 0.116, spec.z + 0.155 - Math.abs(i) * 0.009],
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

  const birdRoot = b.joint("birdRoot", {
    parent: head,
    at: [0, 1.03, 0.405],
    dir: [0, 1, 0],
    role: "spine",
  });
  const birdSpine = b.chain(
    "birdSpine",
    [
      [0, 1.075, 0.395],
      [0, 1.155, 0.421],
      [0, 1.205, 0.453],
    ],
    {
      parent: birdRoot,
      names: ["birdPelvis", "birdChest", "birdNeckBase"],
      role: "spine",
    },
  );
  const birdNeck = b.chain(
    "birdNeck",
    [
      [0, 1.195, 0.445],
      [0, 1.253, 0.478],
    ],
    { parent: birdSpine.tip!, names: ["birdNeck", "birdNeckTop"], role: "neck" },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdNeck.tip!,
    at: [0, 1.255, 0.479],
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, 1.237, 0.531],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const birdTail = b.chain(
    "birdTail",
    [
      [0, 1.107, 0.345],
      [0, 1.125, 0.256],
      [0, 1.151, 0.187],
    ],
    { parent: birdRoot, names: ["birdTail1", "birdTail2", "birdTailTip"], role: "tail" },
  );

  const birdSides = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `birdWing${side}`,
      [
        [s * 0.059, 1.165, 0.404],
        [s * 0.124, 1.178, 0.382],
        [s * 0.205, 1.18, 0.361],
      ],
      {
        parent: birdSpine.joints[1],
        names: [`birdShoulder${side}`, `birdElbow${side}`, `birdWrist${side}`],
        role: "wing",
      },
    );
    const leg = b.chain(
      `birdLeg${side}`,
      [
        [s * 0.035, 1.083, 0.409],
        [s * 0.038, 1.045, 0.401],
        [s * 0.043, 0.996, 0.433],
      ],
      {
        parent: birdRoot,
        names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`],
        role: "leg",
        contact: [s * 0.043, 0.99, 0.433],
      },
    );
    const digits = [-1, 0, 1].map((i) =>
      b.chain(
        `birdToe${side}${i + 2}`,
        [
          [s * 0.043, 0.997, 0.432],
          [s * 0.043 + i * 0.019, 0.991, 0.479 - Math.abs(i) * 0.011],
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
        [s * 0.043, 0.996, 0.428],
        [s * 0.048, 0.99, 0.399],
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

  function pebble(at: number[], size: number[], color: Fill = stonePaint) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      at,
      scale: size,
      bone: hips,
      rotation: [0, random() * 160, 0],
      flat: true,
    });
  }

  // A low pond plinth: the entire scene, including its base, touches y = 0.
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
  // A scattering of flat bank stones ties the animal's feet to the setting.
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    const x = Math.cos(a) * (0.413 + random() * 0.016);
    const z = Math.sin(a) * 0.666 - 0.015;
    pebble(
      [x, 0.084, z],
      [0.024 + random() * 0.017, 0.012 + random() * 0.008, 0.035 + random() * 0.025],
      i % 3 === 0 ? sandPaint : stonePaint,
    );
  }

  // Main capybara: a large, unbroken loaf, short legs, and a very blunt head.
  const body = b.sweep(
    spine,
    (t) => [
      0.305 + Math.sin(t * Math.PI) * 0.035,
      0.282 + Math.sin(t * Math.PI) * 0.015,
    ],
    {
      color: coat,
      sides: 10,
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

  const muzzleOutline = [
    [-0.189, -0.105],
    [0.189, -0.105],
    [0.242, -0.065],
    [0.248, 0.074],
    [0.197, 0.126],
    [-0.197, 0.126],
    [-0.248, 0.074],
    [-0.242, -0.065],
  ];
  const muzzle = b.extrude(muzzleOutline, {
    at: face.p([0, -0.085, 0.226]),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.432,
    bevel: 0.045,
    color: muzzlePaint,
    bone: head,
    name: "broadBluntMuzzle",
  });
  const lowerJaw = b.extrude(
    [
      [-0.184, -0.038],
      [0.184, -0.038],
      [0.214, -0.012],
      [0.207, 0.036],
      [-0.207, 0.036],
      [-0.214, -0.012],
    ],
    {
      at: [0, 0.559, 0.67],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.335,
      bevel: 0.02,
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

  const mouthLine = b.surface(lowerJaw).drape(
    [
      [-0.186, 0.588, 0.824],
      [-0.098, 0.587, 0.839],
      [0, 0.582, 0.841],
      [0.098, 0.587, 0.839],
      [0.186, 0.588, 0.824],
    ],
    { lift: 0.0015 },
  );
  b.sweep(mouthLine, 0.0034, {
    color: "#70523f",
    bone: jaw,
    sides: 6,
    name: "quietSmile",
  });

  // Small incisors are deliberately understated, not rabbit-like.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.022, 0.009), "#dfcc9d", {
      at: [s * 0.012, 0.578, 0.844],
      bone: jaw,
      name: `incisor${s > 0 ? "L" : "R"}`,
    });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeAt = [s * 0.225, 0.837, 0.641];
    const gaze = [s * 0.42, 0.04, 1];

    const socket = b.part(new THREE.SphereGeometry(1, 12, 8), C.bark, {
      at: eyeAt,
      dir: gaze,
      axis: "z",
      scale: [0.043, 0.046, 0.023],
      bone: head,
      name: `eyeSocket${side}`,
    });
    b.decal(socket, capyEye, {
      at: [s * 0.233, 0.839, 0.666],
      dir: gaze,
      size: [0.069, 0.073],
      segments: 7,
      lift: 0.001,
      bone: head,
      name: `capyEye${side}`,
    });

    b.sweep(
      bezier(
        [s * 0.19, 0.875, 0.643],
        [s * 0.228, 0.89, 0.65],
        [s * 0.266, 0.866, 0.62],
      ),
      [0.016, 0.01],
      { color: coat, bone: head, sides: 6, name: `softBrow${side}` },
    );

    const cheekHit = b.surface(skull).around(head.at).at(s * 65, -5);
    if (cheekHit) {
      b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        muzzlePaint,
        cheekHit,
        {
          scale: [0.074, 0.025, 0.058],
          embed: 0.45,
          name: `cheek${side}`,
        },
      );
    }

    // Three sparse, short whiskers on each side.
    for (let i = 0; i < 3; i++) {
      const start = [s * (0.184 + i * 0.009), 0.654 + i * 0.018, 0.845 - i * 0.009];
      const tip = [s * (0.295 + i * 0.013), 0.653 + i * 0.025, 0.887 - i * 0.013];
      b.sweep(bezier(start, [s * 0.264, 0.655 + i * 0.026, 0.874], tip), [0.0017, 0.0008], {
        color: "#e1c491",
        bone: head,
        sides: 5,
        name: `whisker${side}${i + 1}`,
      });
    }
  }

  for (let k = 0; k < earBones.length; k++) {
    const s = k === 0 ? 1 : -1;
    const earBone = earBones[k];
    const ear = b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
      at: [s * 0.238, 0.965, 0.31],
      scale: [0.079, 0.088, 0.045],
      rotation: [0, s * 13, s * -18],
      bone: earBone,
      name: `roundedEar${s > 0 ? "L" : "R"}`,
      flat: true,
    });
    b.decal(ear, innerEar, {
      at: [s * 0.24, 0.97, 0.357],
      dir: [s * 0.12, 0, 1],
      size: [0.09, 0.113],
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
    const footBone = leg.chain.tip!;
    ellipsoid(
      [leg.x + leg.s * 0.035, 0.133, leg.z + 0.058],
      [0.102, 0.054, 0.111],
      legPaint,
      footBone,
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
        [0.018, 0.013, 0.019],
        "#b5a080",
        toe.tip!,
        `flatNail${name}${i}`,
      );
      b.sweep(
        [
          [tip.x - 0.014, tip.y + 0.02, tip.z - 0.014],
          [tip.x + 0.014, tip.y + 0.02, tip.z - 0.014],
        ],
        0.0018,
        {
          color: "#644b38",
          bone: toe.joints[0],
          sides: 5,
          name: `toeCrease${name}${i}`,
        },
      );
    }
  }

  // Broad small fur facets keep the silhouette handmade rather than plush.
  const bodySurface = b.surface(body);
  const tuftHits = bodySurface.scatter(24, {
    rng: random,
    minDist: 0.09,
    filter: (h) => h.n.y > -0.15 && h.at.z < 0.18,
  });
  for (let i = 0; i < tuftHits.length; i++) {
    b.stick(
      new THREE.ConeGeometry(0.019, 0.061, 4),
      i % 3 === 0 ? "#c39b66" : coat,
      tuftHits[i],
      {
        embed: 0.66,
        scale: [1, 0.65, 0.5],
        flow: [0, 0.1, -1],
        name: `coatFacet${i}`,
      },
    );
  }
  const hairs = bodySurface.scatter(80, {
    rng: rng(271),
    minDist: 0.038,
    filter: (h) => h.n.y > -0.25,
  });
  b.cards(hairs, hairDrawing, {
    size: [0.022, 0.042],
    lean: 76,
    bend: 12,
    flow: [0, -0.1, -1],
    vary: 0.3,
    rng: rng(331),
    sink: 0.13,
    name: "sparsePaintedGuardHairs",
  });

  const foreheadHairs = b.surface(skull).scatter(13, {
    rng: rng(67),
    minDist: 0.038,
    filter: (h) => h.n.y > 0.35 && Math.abs(h.at.x) > 0.085,
  });
  b.cards(foreheadHairs, hairDrawing, {
    size: [0.018, 0.032],
    lean: 80,
    flow: [0, 0, -1],
    sink: 0.18,
    name: "foreheadHairs",
  });

  // The passenger: bright, tiny, and balanced directly on the capybara's crown.
  const birdBody = ellipsoid(
    [0, 1.132, 0.404],
    [0.077, 0.104, 0.088],
    C.teal,
    birdSpine.joints[0],
    "birdBody",
  );
  ellipsoid(
    [0, 1.164, 0.446],
    [0.061, 0.075, 0.061],
    C.gold,
    birdSpine.joints[1],
    "goldenBreast",
  );
  const bib = ellipsoid(
    [0, 1.143, 0.467],
    [0.058, 0.076, 0.037],
    "#efd078",
    birdSpine.joints[1],
    "birdBib",
  );
  b.decal(bib, breastDrawing, {
    at: [0, 1.145, 0.506],
    dir: [0, 0, 1],
    size: [0.089, 0.119],
    lift: 0.001,
    segments: 7,
    name: "breastScallops",
  });
  b.sweep(birdNeck, [0.041, 0.046], {
    color: C.turquoise,
    sides: 8,
    name: "birdNeckVolume",
  });
  const littleHead = ellipsoid(
    [0, 1.255, 0.479],
    [0.069, 0.069, 0.064],
    C.turquoise,
    birdHead,
    "birdRoundHead",
  );

  for (const s of [1, -1]) {
    const gaze = [s * 0.55, 0.02, 1];
    const eyeAt = [s * 0.043, 1.267, 0.527];
    const socket = b.part(new THREE.SphereGeometry(1, 10, 6), C.navy, {
      at: eyeAt,
      scale: [0.025, 0.029, 0.011],
      dir: gaze,
      axis: "z",
      bone: birdHead,
      name: `birdEyeSocket${s > 0 ? "L" : "R"}`,
    });
    b.decal(socket, birdEye, {
      at: [s * 0.047, 1.268, 0.539],
      dir: gaze,
      size: [0.043, 0.05],
      segments: 6,
      lift: 0.0008,
      bone: birdHead,
      name: `birdEye${s > 0 ? "L" : "R"}`,
    });
    ellipsoid(
      [s * 0.054, 1.235, 0.52],
      [0.016, 0.01, 0.008],
      "#edb466",
      birdHead,
      `birdCheek${s}`,
    );
  }

  b.extrude(
    [
      [-0.028, 0],
      [0.028, 0],
      [0.019, 0.024],
      [0, 0.036],
      [-0.019, 0.024],
    ],
    {
      at: [0, 1.238, 0.548],
      x: [1, 0, 0],
      y: [0, 0.4, 1],
      thickness: 0.017,
      bevel: 0.003,
      color: C.orange,
      bone: birdHead,
      name: "birdUpperBeak",
    },
  );
  b.extrude(
    [
      [-0.024, 0],
      [0.024, 0],
      [0.013, 0.028],
      [0, 0.034],
      [-0.013, 0.028],
    ],
    {
      at: [0, 1.232, 0.547],
      x: [1, 0, 0],
      y: [0, -0.15, 1],
      thickness: 0.009,
      bevel: 0.002,
      color: C.coral,
      bone: birdJaw,
      name: "birdLowerBeak",
    },
  );

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.022;
    b.sweep(
      bezier(
        [x * 0.6, 1.308, 0.462],
        [x, 1.357 + (i === 1 ? 0.008 : 0), 0.455],
        [x * 1.7, 1.36 + (i === 1 ? 0.019 : 0), 0.435],
      ),
      [0.013, 0],
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
    b.sweep(side.leg, 0.007, {
      color: C.orange,
      sides: 6,
      name: `birdShin${side.side}`,
    });
    for (let i = 0; i < side.digits.length; i++) {
      b.sweep(side.digits[i], [0.0045, 0.003], {
        color: C.orange,
        sides: 5,
        caps: "round",
        name: `birdSpreadToe${side.side}${i}`,
      });
    }
    b.sweep(side.backToe, [0.004, 0.0025], {
      color: C.orange,
      sides: 5,
      name: `birdBackToeVolume${side.side}`,
    });

    b.sweep(side.wing, [0.034, 0.025, 0.013], {
      color: C.teal,
      sides: 6,
      caps: "round",
      name: `birdWingSpar${side.side}`,
    });

    // Separate, broad, overlapping flight feathers, with contrasting quills.
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      const root = side.wing.at(t);
      const x = root.at.x;
      const y = root.at.y;
      const z = root.at.z;
      const length = 0.075 + t * 0.043;
      const feather = b.extrude(
        [
          [-0.013, 0],
          [0.013, 0],
          [0.017, length * 0.68],
          [0.006, length],
          [-0.008, length * 1.035],
          [-0.017, length * 0.67],
        ],
        {
          at: root,
          x: [side.s, 0, 0],
          y: [side.s * 0.27, -0.12, -1],
          thickness: [0.01, 0.005],
          bevel: 0.002,
          color: i % 2 === 0 ? C.blue : wingPaint,
          bone: root.bone!,
          name: `flightFeather${side.side}${i}`,
        },
      );
      b.sweep(
        [
          [x, y + 0.006, z - 0.005],
          [x + side.s * length * 0.22, y - 0.006, z - length * 0.83],
        ],
        [0.0024, 0.0012],
        {
          color: C.turquoise,
          bone: root.bone!,
          sides: 5,
          name: `featherQuill${side.side}${i}`,
        },
      );
      // A small pale tip patch echoes the warm breast.
      const patchAt = feather.local([0, length * 0.87, 0.005]);
      b.part(new THREE.SphereGeometry(1, 6, 4), "#b5e3c5", {
        at: patchAt,
        scale: [0.009, 0.003, 0.009],
        bone: root.bone!,
        name: `featherTip${side.side}${i}`,
      });
    }

    for (let i = 0; i < 3; i++) {
      ellipsoid(
        [side.s * (0.083 + i * 0.031), 1.19, 0.383 - i * 0.009],
        [0.025, 0.011, 0.022],
        i === 0 ? C.turquoise : C.teal,
        side.wing.joints[i === 0 ? 0 : 1],
        `wingCovert${side.side}${i}`,
      );
    }
  }

  b.sweep(birdTail, [0.021, 0.013, 0.003], {
    color: C.blue,
    sides: 6,
    name: "birdTailSpar",
  });
  for (let i = -1; i <= 1; i++) {
    b.extrude(
      [
        [-0.013, 0],
        [0.013, 0],
        [0.017, 0.11],
        [0.009, 0.14],
        [-0.009, 0.14],
        [-0.017, 0.11],
      ],
      {
        at: [i * 0.016, 1.112, 0.318],
        x: [1, 0, 0],
        y: [i * 0.18, 0.25, -1],
        thickness: 0.007,
        bevel: 0.002,
        color: i === 0 ? C.turquoise : C.blue,
        bone: birdTail.joints[0],
        name: `birdTailFeather${i + 1}`,
      },
    );
  }

  // A few scalloped shoulder marks are projected onto the little bird's body.
  const birdSkin = b.surface(birdBody);
  for (const s of [1, -1]) {
    const hit = birdSkin.around([0, 1.132, 0.404]).at(s * 105, 15);
    if (hit) {
      b.stick(new THREE.SphereGeometry(1, 8, 6), C.turquoise, hit, {
        scale: [0.031, 0.008, 0.033],
        embed: 0.35,
        name: `birdShoulderSpot${s}`,
      });
    }
  }

  // Pond plants stay beside and behind the hero, never across its face.
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
        b.capsule(top, [top[0] + lean * 0.15, top[1] + 0.056, top[2]], 0.011, {
          color: "#796044",
          bone: hips,
          sides: 6,
          name: `cattail_${x}_${i}`,
        });
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
    b.part(new THREE.CylinderGeometry(radius, radius * 0.96, 0.008, 16), C.leaf, {
      at: [x, 0.061, z],
      bone: hips,
      name: "lilyPadEdge",
    });
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
        b.part(new THREE.SphereGeometry(1, 8, 6), layer === 0 ? "#efd7bc" : "#fff1ca", {
          at: [
            x + Math.sin(a) * r,
            0.085 + layer * 0.013,
            z + Math.cos(a) * r,
          ],
          scale: [0.016, 0.009 + layer * 0.004, layer === 0 ? 0.041 : 0.029],
          rotation: [layer === 0 ? -13 : -29, (a * 180) / Math.PI, 0],
          bone: hips,
          name: `lilyPetal${layer}_${i}`,
          flat: true,
        });
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

  // A tiny field-museum plaque is low enough not to hide the paws.
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

  // Three golden pond glints; subtle self-light, not floating particles.
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

  // Keep these handles alive in the authoring tree for clear inspection.
  littleHead.mesh.userData.subject = "bird";
  skull.mesh.userData.subject = "capybara";

  return b.root;
}

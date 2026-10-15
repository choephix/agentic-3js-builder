```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  lerp,
  catmull,
  bezier,
  rng,
  paint,
  grain,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type {
  Fill,
  Joint,
  PointInput,
  DirectionInput,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "VITA-07 • Field Angel",
  description:
    "A heroic cyborg combat medic in chunky ivory-and-teal rescue armor, with articulated healing vanes, an expressive human face, and a luminous induction staff. Built as a rig-ready primitive puppet on a rescue-bay platform.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "VITA-07",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(70417);

  // ---------------------------------------------------------------------------
  // Palette: warm ceramic, rescue teal, graphite mechanisms and amber markings.
  // ---------------------------------------------------------------------------

  const C = {
    ivory: "#e9f0e9",
    white: "#fff9e9",
    edge: "#b7d2d0",
    teal: "#167d89",
    deepTeal: "#125460",
    navy: "#192c40",
    joint: "#304657",
    dark: "#102130",
    silver: "#a0bbbf",
    mint: "#67ffd0",
    mintPale: "#c7ffe3",
    orange: "#ffa03e",
    orangeDark: "#cf602b",
    skin: "#dba28b",
    lip: "#a35558",
    hair: "#d5e4dc",
  };

  const ceramic = paint((p, n) => {
    const shade = Math.max(0, n.y * 0.55 + n.z * 0.22 + 0.3);
    let col = mix("#a7c5c7", "#f5f4e8", shade);
    const fleck = noise(p, 0.018, 17);
    if (fleck > 0.77 && n.y < 0.5) col = mix(col, "#789b9d", 0.25);
    if (p.y < 0.39) col = mix(col, "#6d8b91", 0.13);
    return col;
  });
  const teal = paint((p, n) =>
    mix(
      "#124d61",
      "#2495a0",
      Math.min(1, 0.43 + 0.36 * n.y + 0.19 * n.z + noise(p, 0.08, 12) * 0.15),
    ),
  );
  const suit = grain("#142335", "#2a4252", {
    size: 0.008,
    axis: "y",
    seed: 9,
  });
  const skin = paint((_p, n) =>
    mix("#b47870", "#e8b598", 0.56 + n.y * 0.2 + n.z * 0.2),
  );
  const hair = grain("#859fa7", "#e6eee4", {
    size: 0.018,
    axis: [0.8, 0.5, -0.2],
    seed: 4,
  });
  const brushed = grain("#526e7c", "#afc6c7", {
    size: 0.01,
    axis: "y",
    seed: 23,
  });

  // ---------------------------------------------------------------------------
  // Drawings. Shared graphics tie the uniform, equipment and staff together.
  // ---------------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 76">
      <path d="M9 21 Q49 2 103 16" fill="none" stroke="#493937"
        stroke-width="7" stroke-linecap="round"/>
      <path d="M8 43 Q28 20 62 24 Q91 24 112 39
        Q90 60 58 59 Q27 59 8 43Z" fill="#27303b"/>
      <path d="M16 42 Q37 28 61 30 Q88 28 103 40
        Q84 53 58 52 Q33 52 16 42Z" fill="#fff7e9"/>
      <ellipse cx="62" cy="41" rx="18" ry="19" fill="#155761"/>
      <ellipse cx="62" cy="43" rx="13" ry="15" fill="#56c7b4"/>
      <path d="M52 49 Q62 57 73 47" fill="none" stroke="#b1ffe1" stroke-width="4"/>
      <ellipse cx="62" cy="41" rx="6" ry="12" fill="#152c3b"/>
      <circle cx="56" cy="35" r="5" fill="#ffffff"/>
      <circle cx="70" cy="47" r="2.5" fill="#ffffff"/>
      <path d="M10 43 L3 34 M101 36 L114 32" stroke="#27303b"
        stroke-width="4" stroke-linecap="round"/>
      <path d="M24 62 Q59 70 92 60" stroke="#b87873" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const mouthTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48">
      <path d="M15 23 Q38 31 59 26 Q78 31 104 18"
        fill="none" stroke="#7d474c" stroke-width="5" stroke-linecap="round"/>
      <path d="M32 30 Q63 40 87 28" fill="none"
        stroke="#cf8f82" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 32 Q63 35 77 30" fill="none"
        stroke="#f4c7aa" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const medicalTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64 4 L111 23 L118 66 Q109 104 64 124
        Q19 104 10 66 L17 23Z" fill="#113d4c" stroke="#9fdad0" stroke-width="4"/>
      <path d="M64 15 L101 30 L108 65 Q98 96 64 112
        Q30 96 20 65 L27 30Z" fill="#1d828b"/>
      <path d="M51 34 H77 V51 H95 V77 H77 V95 H51 V77 H33 V51 H51Z"
        fill="#f4fff0"/>
      <path d="M51 34 H77 V40 H57 V51 H51Z" fill="#89ffd5"/>
      <path d="M28 92 L37 99 M100 92 L91 99" stroke="#ffad4e" stroke-width="6"/>
    </svg>`,
    { size: 384 },
  );

  const unitTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
      <rect width="180" height="120" rx="12" fill="#153748"/>
      <path d="M8 15 H172 M8 105 H172" stroke="#6bcdbd" stroke-width="3"/>
      <text x="90" y="78" text-anchor="middle" font-family="sans-serif"
        font-weight="900" font-size="78" fill="#f2f5df">07</text>
      <text x="90" y="99" text-anchor="middle" font-family="sans-serif"
        font-weight="700" font-size="12" letter-spacing="3" fill="#7be2c7">RESPONSE</text>
      <path d="M11 31 H24 M156 31 H169" stroke="#ffac4d" stroke-width="7"/>
    </svg>`,
    { size: 384 },
  );

  const warningTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 96">
      <rect width="256" height="96" rx="8" fill="#e5e9d8"/>
      <rect x="7" y="7" width="242" height="82" rx="4"
        fill="none" stroke="#183d4c" stroke-width="4"/>
      <path d="M16 18 H48 V47 H16Z" fill="#ec9639"/>
      <path d="M32 21 L44 43 H20Z" fill="#193344"/>
      <path d="M31 27 H34 V35 H31Z M31 38 H34 V41 H31Z" fill="#ffe6a0"/>
      <text x="58" y="37" font-family="sans-serif" font-weight="900"
        font-size="22" fill="#173a47">VITA SYSTEMS</text>
      <text x="17" y="65" font-family="monospace" font-size="15"
        fill="#345a63">BIO-INDUCTION / Mk.07</text>
      <path d="M17 76 H126 M143 76 H233" stroke="#1b6670" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  const monitorTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
      <rect width="180" height="120" rx="9" fill="#0c3548"/>
      <path d="M10 30 H170 M10 60 H170 M10 90 H170
        M30 12 V108 M60 12 V108 M90 12 V108 M120 12 V108 M150 12 V108"
        fill="none" stroke="#22616b" stroke-width="2"/>
      <path d="M10 68 H38 L47 57 L58 76 L69 28 L81 92 L91 62 H119
        L129 48 L142 66 H169" fill="none" stroke="#88ffcc"
        stroke-width="5" stroke-linejoin="round"/>
      <text x="12" y="23" font-family="sans-serif" font-weight="bold"
        font-size="14" fill="#c8ffe3">LINK STABLE</text>
      <text x="119" y="104" font-family="monospace" font-weight="bold"
        font-size="25" fill="#ffe5a1">98</text>
      <path d="M14 96 H36 M25 85 V107" stroke="#b2ffdf" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const inductionTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="73" fill="none" stroke="#63ffd0" stroke-width="4"/>
      <circle cx="80" cy="80" r="62" fill="none" stroke="#b5ffe0"
        stroke-width="5" stroke-dasharray="14 9"/>
      <path d="M69 45 H91 V69 H115 V91 H91 V115 H69 V91 H45 V69 H69Z"
        fill="#caffdf" stroke="#2e9e9b" stroke-width="3"/>
      <path d="M80 5 V22 M80 138 V155 M5 80 H22 M138 80 H155"
        stroke="#fff6bd" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const platformTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 84">
      <rect width="420" height="84" rx="6" fill="#102b3b"/>
      <path d="M10 10 H410 M10 74 H410" stroke="#55bbab" stroke-width="3"/>
      <path d="M24 24 H42 V33 H51 V51 H42 V60 H24 V51 H15 V33 H24Z"
        fill="#9fffd8"/>
      <text x="70" y="40" font-family="sans-serif" font-weight="900"
        font-size="27" letter-spacing="4" fill="#f6f2db">VITA // 07</text>
      <text x="72" y="61" font-family="sans-serif" font-size="12"
        letter-spacing="4" fill="#80c6c1">FIELD RESPONSE DIVISION</text>
      <path d="M370 24 L393 42 L370 60" fill="none"
        stroke="#ffa546" stroke-width="7"/>
    </svg>`,
    { size: 768 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first. The A-pose leaves the gauntlets, fingers and backpack clear.
  // ---------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.065, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.065, 0],
      [0, 1.27, 0],
      [0, 1.51, 0],
      [0, 1.665, 0],
    ],
    {
      parent: hips,
      names: ["spineLower", "spineUpper", "chest", "neckBase"],
      role: "spine",
    },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neckChain",
    [
      [0, 1.665, 0],
      [0, 1.79, 0.015],
    ],
    {
      parent: spine.tip!,
      names: ["neck", "headMount"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.945, 0.025],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.08;
  const face = b.region({ at: head, scale: H, bone: head });
  const jaw = face.joint("jaw", {
    parent: head,
    at: [0, -0.102, 0.017],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const suffix = s > 0 ? "L" : "R";
    const shoulder = [s * 0.322, 1.625, 0];
    const elbow = [s * 0.655, 1.475, 0.015];
    const wrist = [s * 0.947, 1.395, 0.035];
    const arm = b.chain(`arm${suffix}`, [shoulder, elbow, wrist], {
      parent: chest,
      names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`],
      role: "arm",
    });
    const hand = b.joint(`hand${suffix}`, {
      parent: arm.tip!,
      at: [s * 0.995, 1.385, 0.04],
      dir: [s, -0.15, 0],
      role: "arm",
    });

    const fingers = Array.from({ length: 4 }, (_, i) => {
      const y = 1.389 + (i - 1.5) * 0.029;
      const points =
        s > 0
          ? [
              [1.025, y, 0.047],
              [1.086 + (i === 1 ? 0.011 : 0), y - 0.004, 0.052],
              [1.133 + (i === 1 ? 0.013 : 0), y - 0.008, 0.062],
            ]
          : [
              [-1.016, y, 0.083],
              [-1.093, y - 0.003, 0.088],
              [-1.113, y - 0.006, 0.023],
            ];
      return b.chain(`finger${i + 1}${suffix}`, points, {
        parent: hand,
        names: [`finger${i + 1}${suffix}`, `finger${i + 1}Tip${suffix}`],
        role: "digit",
      });
    });
    const thumb = b.chain(
      `thumbChain${suffix}`,
      [
        [s * 0.981, 1.351, 0.075],
        [s * 1.015, 1.316, 0.109],
        [s * 1.061, 1.323, 0.111],
      ],
      {
        parent: hand,
        names: [`thumb${suffix}`, `thumbTip${suffix}`],
        role: "digit",
      },
    );
    const leg = b.chain(
      `leg${suffix}`,
      [
        [s * 0.145, 1.075, 0],
        [s * 0.19, 0.716, 0.045],
        [s * 0.195, 0.345, -0.008],
      ],
      {
        parent: hips,
        names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`],
        role: "leg",
        contact: [s * 0.195, 0.115, 0.12],
      },
    );
    const wing = b.joint(`rescueVanes${suffix}`, {
      parent: chest,
      at: [s * 0.205, 1.58, -0.23],
      dir: [s * 0.5, 0.7, -0.15],
      role: "wing",
    });
    return { s, suffix, arm, hand, fingers, thumb, leg, wing };
  });

  const staffX = -1.065;
  const staffZ = 0.039;
  const staff = b.joint("healingStaff", {
    parent: sides[1].hand,
    at: [staffX, 1.39, staffZ],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // Placement helpers. All geometry enters through the builder.
  // ---------------------------------------------------------------------------

  function box(
    at: PointInput,
    size: [number, number, number],
    color: Fill,
    bone: Joint = root,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
    });
  }

  function ellipsoid(
    at: PointInput,
    radii: [number, number, number],
    color: Fill,
    bone: Joint = root,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      bone,
      scale: radii,
      flat: true,
    });
  }

  function cylinder(
    at: PointInput,
    radius: number,
    height: number,
    color: Fill,
    bone: Joint = root,
    dir: DirectionInput = [0, 1, 0],
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, bone, dir },
    );
  }

  function graphic(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone,
      texture,
      dir,
      axis: "z",
    });
  }

  function plate(
    at: PointInput,
    outline: number[][],
    thickness: number,
    color: Fill,
    bone: Joint,
    bevel = 0.008,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone,
    });
  }

  function bolt(at: PointInput, bone: Joint, radius = 0.012) {
    return cylinder(at, radius, 0.009, brushed, bone, [0, 0, 1], 6);
  }

  function litBar(
    a: PointInput,
    z: PointInput,
    radius: number,
    bone: Joint,
    color = C.mint,
  ) {
    return glow(
      b.rod(a, z, radius, {
        color,
        bone,
        sides: 6,
        caps: "flat",
      }),
      1.1,
    );
  }

  // ---------------------------------------------------------------------------
  // Face first: warm human features framed by cool cybernetic hardware.
  // ---------------------------------------------------------------------------

  const skull = face.part(
    new THREE.SphereGeometry(1, 16, 10),
    skin,
    {
      at: [0, 0, 0],
      scale: [0.157, 0.187, 0.145],
      bone: head,
      flat: true,
    },
  );

  ellipsoid(
    face.p([0, -0.104, 0.028]),
    [face.s(0.116), face.s(0.076), face.s(0.111)],
    skin,
    jaw,
  );
  ellipsoid(
    face.p([0, -0.064, 0.092]),
    [face.s(0.09), face.s(0.042), face.s(0.065)],
    skin,
    head,
  );

  for (const s of [1, -1]) {
    const eyeAt = face.p([s * 0.067, 0.021, 0.136]);
    b.decal(skull, eyeTexture, {
      at: eyeAt,
      dir: [s * 0.12, 0.03, 1],
      size: [face.s(0.119), face.s(0.079)],
      mirror: s > 0,
      bone: head,
      segments: 7,
      lift: 0.0022,
    });

    ellipsoid(
      face.p([s * 0.104, -0.054, 0.106]),
      [0.041, 0.025, 0.023],
      skin,
      head,
    );

    cylinder(
      face.p([s * 0.158, -0.009, -0.007]),
      0.056,
      0.042,
      C.navy,
      head,
      [s, 0, 0],
    );
    cylinder(
      face.p([s * 0.18, -0.009, -0.007]),
      0.043,
      0.017,
      ceramic,
      head,
      [s, 0, 0],
    );
    glow(
      cylinder(
        face.p([s * 0.19, -0.009, -0.007]),
        0.023,
        0.019,
        C.mint,
        head,
        [s, 0, 0],
        10,
      ),
      0.85,
    );

    // Temple plate follows the cheek without covering the eye.
    plate(
      face.p([s * 0.133, 0.014, 0.063]),
      [
        [-0.018, -0.057],
        [0.017, -0.038],
        [0.023, 0.065],
        [-0.009, 0.078],
        [-0.026, 0.028],
      ],
      0.027,
      s > 0 ? ceramic : teal,
      head,
      0.005,
    );
    litBar(
      face.p([s * 0.133, -0.018, 0.087]),
      face.p([s * 0.133, 0.027, 0.091]),
      0.005,
      head,
    );
  }

  // Small angular nose; separate lip drawing sits on the movable lower jaw.
  b.extrude(
    [
      [-0.018, -0.024],
      [0.022, -0.024],
      [0.038, -0.013],
      [0.016, 0.036],
      [-0.008, 0.035],
    ],
    {
      at: face.p([0, -0.027, 0.135]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: face.s(0.035),
      bevel: 0.004,
      color: skin,
      bone: head,
    },
  );
  graphic(
    face.p([0, -0.117, 0.132]),
    face.s(0.105),
    face.s(0.035),
    mouthTexture,
    jaw,
  );
  ellipsoid(
    face.p([0, -0.156, 0.077]),
    [0.059, 0.023, 0.055],
    skin,
    jaw,
  );

  // Rear helmet cradle and a short, swept, solid primitive haircut.
  ellipsoid(
    face.p([0, 0.031, -0.058]),
    [0.169, 0.184, 0.114],
    C.navy,
    head,
  );
  face.part(
    new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.49),
    hair,
    {
      at: [0, 0.071, -0.015],
      scale: [0.17, 0.157, 0.148],
      bone: head,
      flat: true,
    },
  );

  const locks = [
    { x: -0.124, y: 0.116, w: 0.060, h: 0.080, lean: 0.045 },
    { x: -0.079, y: 0.145, w: 0.073, h: 0.095, lean: 0.057 },
    { x: -0.026, y: 0.162, w: 0.086, h: 0.112, lean: 0.064 },
    { x: 0.032, y: 0.169, w: 0.087, h: 0.108, lean: 0.064 },
    { x: 0.087, y: 0.151, w: 0.074, h: 0.090, lean: 0.048 },
  ];
  for (const lock of locks) {
    const w = lock.w;
    const h = lock.h;
    plate(
      face.p([lock.x, lock.y, 0.088]),
      [
        [-w * 0.52, h * 0.08],
        [-w * 0.43, h * 0.56],
        [w * 0.30, h * 0.68],
        [w * 0.6 + lock.lean, h * 0.32],
        [w * 0.38, -h * 0.77],
        [-w * 0.16, -h * 0.44],
      ],
      0.052,
      hair,
      head,
      0.006,
    );
  }
  for (const s of [1, -1]) {
    plate(
      face.p([s * 0.147, 0.069, -0.024]),
      [
        [-0.027, 0.04],
        [0.022, 0.062],
        [0.038, -0.034],
        [0.012, -0.094],
        [-0.023, -0.051],
      ],
      0.068,
      hair,
      head,
      0.006,
    );
  }

  // One compact communications aerial and the cheek microphone.
  b.rod(
    face.p([-0.17, 0.033, -0.042]),
    face.p([-0.201, 0.186, -0.06]),
    0.009,
    { color: C.navy, bone: head, sides: 6 },
  );
  glow(
    ellipsoid(face.p([-0.201, 0.186, -0.06]), [0.013, 0.02, 0.013], C.orange, head),
    0.8,
  );
  b.sweep(
    bezier(
      face.p([-0.16, -0.032, 0]),
      face.p([-0.167, -0.115, 0.115]),
      face.p([-0.078, -0.1, 0.161]),
    ),
    0.006,
    { bone: head, color: C.navy, sides: 6 },
  );
  ellipsoid(face.p([-0.072, -0.1, 0.161]), [0.019, 0.01, 0.012], C.joint, head);

  // ---------------------------------------------------------------------------
  // Torso: broad breastplate, narrow floating waist, layered pelvic plates.
  // ---------------------------------------------------------------------------

  b.loft(
    [
      { at: [0, 1.065, 0], w: 0.36, h: 0.255 },
      { at: [0, 1.24, 0], w: 0.302, h: 0.228 },
      { at: [0, 1.49, 0], w: 0.467, h: 0.283 },
      { at: [0, 1.625, 0], w: 0.375, h: 0.235 },
    ],
    { color: suit, bone: [hips, spine], sides: 8 },
  );

  const breastplate = [
    [-0.217, 0.103],
    [-0.18, 0.265],
    [-0.087, 0.282],
    [0, 0.245],
    [0.087, 0.282],
    [0.18, 0.265],
    [0.217, 0.103],
    [0.147, -0.028],
    [0, -0.084],
    [-0.147, -0.028],
  ];
  plate([0, 1.355, 0.133], breastplate, 0.078, teal, chest, 0.012);
  plate(
    [0, 1.368, 0.172],
    breastplate.map(([x, y]) => [x * 0.925, y * 0.91]),
    0.071,
    ceramic,
    chest,
    0.012,
  );
  graphic([0, 1.518, 0.211], 0.136, 0.136, medicalTexture, chest);

  for (const s of [1, -1]) {
    plate(
      [s * 0.147, 1.473, 0.212],
      [
        [-0.038, -0.024],
        [0.038, -0.024],
        [0.031, 0.017],
        [-0.028, 0.025],
      ],
      0.013,
      C.navy,
      chest,
      0.003,
    );
    for (let i = 0; i < 3; i++) {
      box(
        [s * (0.125 + i * 0.019), 1.475, 0.224],
        [0.008, 0.026, 0.006],
        C.orange,
        chest,
        [0, 0, -s * 14],
      );
    }
    bolt([s * 0.163, 1.579, 0.217], chest);
    bolt([s * 0.126, 1.388, 0.215], chest, 0.009);

    // Side ribs leave the dark undersuit visible between the ceramic blocks.
    for (let i = 0; i < 3; i++) {
      box(
        [s * (0.167 + i * 0.014), 1.297 + i * 0.048, 0.018],
        [0.045, 0.028, 0.222],
        i === 1 ? teal : ceramic,
        spine.joints[1],
        [0, 0, -s * 13],
      );
    }
  }

  for (let i = 0; i < 3; i++) {
    plate(
      [0, 1.196 + i * 0.055, 0.126 + i * 0.01],
      [
        [-0.102 - i * 0.008, 0.019],
        [0.102 + i * 0.008, 0.019],
        [0.087 + i * 0.008, -0.021],
        [0, -0.036],
        [-0.087 - i * 0.008, -0.021],
      ],
      0.026,
      i === 2 ? ceramic : teal,
      spine.joints[0],
      0.005,
    );
  }

  b.sweep(neck, 0.075, {
    color: C.navy,
    sides: 8,
    caps: "flat",
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.047, 1.7, 0.05], [s * 0.044, 1.791, 0.066], 0.012, {
      color: brushed,
      bone: neck.joints[0],
      sides: 6,
    });
  }
  b.lathe(
    [
      [0.09, 0],
      [0.149, 0],
      [0.151, 0.037],
      [0.12, 0.066],
      [0.09, 0.058],
    ],
    {
      at: [0, 1.641, 0],
      color: ceramic,
      bone: chest,
      segments: 12,
    },
  );
  litBar([-0.086, 1.684, 0.12], [0.086, 1.684, 0.12], 0.008, chest);

  // Belt, magnetic buckle, and separate tassets.
  b.sweep(
    catmull(
      [
        [0, 1.112, 0.143],
        [0.183, 1.11, 0.092],
        [0.202, 1.108, -0.05],
        [0, 1.105, -0.149],
        [-0.202, 1.108, -0.05],
        [-0.183, 1.11, 0.092],
      ],
      { closed: true },
    ),
    0.034,
    { color: C.navy, bone: hips, section: "box" },
  );
  plate(
    [0, 1.101, 0.151],
    [
      [-0.075, 0.043],
      [0.075, 0.043],
      [0.083, -0.029],
      [0, -0.057],
      [-0.083, -0.029],
    ],
    0.035,
    ceramic,
    hips,
  );
  cylinder([0, 1.102, 0.178], 0.039, 0.018, C.deepTeal, hips, [0, 0, 1], 10);
  glow(cylinder([0, 1.102, 0.19], 0.025, 0.012, C.mint, hips, [0, 0, 1], 10), 1);
  for (const s of [1, -1]) {
    plate(
      [s * 0.135, 1.028, 0.124],
      [
        [-0.071, 0.064],
        [0.069, 0.047],
        [0.08, -0.082],
        [0.02, -0.115],
        [-0.062, -0.073],
      ],
      0.052,
      ceramic,
      hips,
      0.009,
    );
    box([s * 0.226, 1.075, -0.008], [0.09, 0.15, 0.124], teal, hips);
    box([s * 0.229, 1.121, 0.003], [0.098, 0.031, 0.137], ceramic, hips);
    box([s * 0.229, 1.059, 0.06], [0.043, 0.055, 0.014], C.navy, hips);
    box([s * 0.229, 1.059, 0.071], [0.015, 0.045, 0.006], C.orange, hips);
  }

  // ---------------------------------------------------------------------------
  // Arms and hands. Mechanisms remain visible at the joints.
  // ---------------------------------------------------------------------------

  for (const side of sides) {
    const { s, arm, hand, fingers, thumb } = side;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;

    b.sweep(arm, [0.075, 0.061, 0.049], {
      color: suit,
      sides: 8,
    });
    ellipsoid(shoulder, [0.116, 0.108, 0.112], C.joint, shoulder);
    ellipsoid(elbow, [0.072, 0.072, 0.073], C.joint, elbow);

    plate(
      [s * 0.332, 1.651, 0.012],
      [
        [-0.134, -0.067],
        [-0.131, 0.057],
        [-0.075, 0.105],
        [0.09, 0.086],
        [0.143, 0.019],
        [0.125, -0.086],
        [0.035, -0.112],
      ],
      0.248,
      ceramic,
      shoulder,
      0.015,
    );
    plate(
      [s * 0.334, 1.642, 0.144],
      [
        [-0.098, 0.031],
        [0.072, 0.044],
        [0.103, -0.018],
        [0.081, -0.058],
        [-0.085, -0.058],
      ],
      0.018,
      teal,
      shoulder,
      0.005,
    );
    graphic(
      [s * 0.335, 1.652, 0.158],
      s > 0 ? 0.091 : 0.113,
      0.084,
      s > 0 ? medicalTexture : unitTexture,
      shoulder,
    );
    for (const dx of [-0.097, 0.097]) {
      bolt([s * 0.334 + dx, 1.677, 0.153], shoulder, 0.009);
    }
    box(
      [s * 0.406, 1.707, 0.074],
      [0.037, 0.015, 0.114],
      C.orange,
      shoulder,
      [0, 0, -s * 15],
    );

    b.frustumBox(
      lerp(shoulder, elbow, 0.25),
      lerp(shoulder, elbow, 0.84),
      [0.153, 0.166],
      [0.122, 0.138],
      { color: ceramic, bone: shoulder },
    );
    b.rod(
      lerp(shoulder, elbow, 0.35).add(new THREE.Vector3(0, -0.043, -0.072)),
      lerp(shoulder, elbow, 0.88).add(new THREE.Vector3(0, -0.027, -0.061)),
      0.018,
      { color: brushed, bone: shoulder, sides: 6 },
    );
    cylinder(
      [s * 0.65, 1.477, 0.094],
      0.062,
      0.027,
      C.navy,
      elbow,
      [0, 0, 1],
      12,
    );
    cylinder(
      [s * 0.65, 1.477, 0.112],
      0.043,
      0.017,
      ceramic,
      elbow,
      [0, 0, 1],
      10,
    );
    bolt([s * 0.65, 1.477, 0.127], elbow, 0.017);

    b.frustumBox(
      lerp(elbow, wrist, 0.15),
      lerp(elbow, wrist, 0.92),
      [0.181, 0.185],
      [0.137, 0.145],
      { color: ceramic, bone: elbow },
    );
    b.frustumBox(
      lerp(elbow, wrist, 0.29).add(new THREE.Vector3(0, 0.014, 0.075)),
      lerp(elbow, wrist, 0.84).add(new THREE.Vector3(0, 0.012, 0.067)),
      [0.105, 0.047],
      [0.082, 0.04],
      { color: teal, bone: elbow },
    );
    b.rod(
      lerp(elbow, wrist, 0.3).add(new THREE.Vector3(0, -0.061, -0.056)),
      lerp(elbow, wrist, 0.87).add(new THREE.Vector3(0, -0.047, -0.049)),
      0.02,
      { color: C.navy, bone: elbow, sides: 6 },
    );
    cylinder(wrist, 0.065, 0.047, C.navy, wrist, [s, -0.2, 0], 10);
    cylinder(
      lerp(elbow, wrist, 0.91),
      0.073,
      0.026,
      teal,
      elbow,
      [s, -0.2, 0],
      10,
    );

    // The open hand carries a diagnostic screen; the staff hand has injector pods.
    if (s > 0) {
      box([0.804, 1.458, 0.12], [0.16, 0.104, 0.027], C.navy, elbow, [0, 0, -8]);
      glow(graphic([0.804, 1.458, 0.137], 0.145, 0.096, monitorTexture, elbow), 0.8);
      for (const x of [0.727, 0.881]) bolt([x, 1.458, 0.14], elbow, 0.007);
    } else {
      for (let i = 0; i < 3; i++) {
        cylinder([-0.754 - i * 0.052, 1.444, 0.116], 0.018, 0.062, C.navy, elbow);
        glow(
          cylinder([-0.754 - i * 0.052, 1.444, 0.116], 0.012, 0.044, C.mint, elbow),
          0.8,
        );
        cylinder([-0.754 - i * 0.052, 1.477, 0.116], 0.02, 0.014, ceramic, elbow);
      }
    }

    box([s * 0.995, 1.386, 0.04], [0.097, 0.115, 0.083], C.navy, hand, [0, 0, -s * 8]);
    plate(
      [s * 0.995, 1.387, 0.087],
      [
        [-0.04, 0.041],
        [0.04, 0.041],
        [0.047, -0.03],
        [0.015, -0.048],
        [-0.04, -0.032],
      ],
      0.022,
      ceramic,
      hand,
      0.005,
    );
    litBar(
      [s * 0.98, 1.386, 0.102],
      [s * 1.015, 1.386, 0.102],
      0.005,
      hand,
    );

    for (const finger of [...fingers, thumb]) {
      b.sweep(finger, [0.013, 0.011, 0.009], {
        color: C.joint,
        sides: 6,
        skin: "rigid",
      });
      b.sweep(finger, 0.0135, {
        from: 0.59,
        to: 0.91,
        color: ceramic,
        sides: 6,
        caps: "flat",
      });
      ellipsoid(finger.at(0.48), [0.015, 0.015, 0.014], C.navy, finger.joints[1], 8);
    }
  }

  // ---------------------------------------------------------------------------
  // Legs: strong thigh plates, exposed knees, oversized rescue boots.
  // ---------------------------------------------------------------------------

  for (const side of sides) {
    const { s, leg } = side;
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;

    b.sweep(leg, [0.103, 0.079, 0.066], {
      color: suit,
      sides: 8,
    });
    b.frustumBox(
      lerp(hip, knee, 0.15),
      lerp(hip, knee, 0.81),
      [0.199, 0.195],
      [0.156, 0.163],
      { color: ceramic, bone: hip },
    );
    plate(
      [s * 0.18, 0.894, 0.114],
      [
        [-0.061, 0.096],
        [0.06, 0.085],
        [0.064, -0.078],
        [0, -0.112],
        [-0.058, -0.077],
      ],
      0.028,
      teal,
      hip,
      0.007,
    );
    litBar(
      [s * 0.18, 0.852, 0.134],
      [s * 0.18, 0.94, 0.134],
      0.007,
      hip,
    );
    cylinder([s * 0.19, 0.716, 0.055], 0.09, 0.155, C.navy, knee, [1, 0, 0]);
    plate(
      [s * 0.19, 0.716, 0.139],
      [
        [-0.075, 0.057],
        [-0.043, 0.088],
        [0.055, 0.076],
        [0.08, 0.02],
        [0.043, -0.071],
        [-0.049, -0.06],
      ],
      0.058,
      ceramic,
      knee,
      0.009,
    );
    plate(
      [s * 0.19, 0.723, 0.172],
      [
        [-0.041, 0.026],
        [0.041, 0.026],
        [0.029, -0.019],
        [-0.029, -0.019],
      ],
      0.012,
      C.orange,
      knee,
      0.003,
    );

    b.frustumBox(
      lerp(knee, ankle, 0.16),
      lerp(knee, ankle, 0.94),
      [0.166, 0.165],
      [0.146, 0.159],
      { color: teal, bone: knee },
    );
    plate(
      [s * 0.194, 0.486, 0.111],
      [
        [-0.079, 0.153],
        [0.073, 0.153],
        [0.087, 0.083],
        [0.068, -0.128],
        [-0.057, -0.142],
        [-0.079, -0.037],
      ],
      0.062,
      ceramic,
      knee,
      0.009,
    );
    plate(
      [s * 0.194, 0.501, 0.147],
      [
        [-0.025, 0.093],
        [0.025, 0.093],
        [0.027, -0.083],
        [0, -0.105],
        [-0.027, -0.083],
      ],
      0.012,
      C.navy,
      knee,
      0.003,
    );
    litBar([s * 0.194, 0.44, 0.158], [s * 0.194, 0.565, 0.158], 0.007, knee);
    for (const dx of [-0.056, 0.056]) bolt([s * 0.194 + dx, 0.601, 0.151], knee, 0.008);

    // Boot side profile is a single chunky extruded puppet shape.
    b.extrude(
      [
        [-0.105, 0.011],
        [0.261, 0.011],
        [0.312, 0.067],
        [0.285, 0.126],
        [0.12, 0.181],
        [0.056, 0.319],
        [-0.087, 0.302],
        [-0.12, 0.15],
      ],
      {
        at: [s * 0.195, 0.115, -0.025],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.224,
        bevel: 0.012,
        color: ceramic,
        bone: ankle,
      },
    );
    box([s * 0.195, 0.143, 0.072], [0.236, 0.056, 0.399], C.navy, ankle);
    box([s * 0.195, 0.177, 0.202], [0.239, 0.039, 0.123], teal, ankle);
    plate(
      [s * 0.195, 0.234, 0.267],
      [
        [-0.11, -0.024],
        [0.11, -0.024],
        [0.1, 0.024],
        [-0.1, 0.024],
      ],
      0.027,
      ceramic,
      ankle,
      0.005,
    );
    for (const dx of [-0.072, 0.072]) {
      box([s * 0.195 + dx, 0.196, 0.278], [0.026, 0.018, 0.013], C.orange, ankle);
    }
    for (let i = 0; i < 3; i++) {
      box(
        [s * 0.195, 0.315 + i * 0.037, 0.052 - i * 0.012],
        [0.149, 0.018, 0.042],
        i === 1 ? C.navy : teal,
        ankle,
      );
    }
    cylinder([s * 0.311, 0.328, -0.028], 0.046, 0.018, C.navy, ankle, [s, 0, 0], 10);
    glow(
      cylinder([s * 0.323, 0.328, -0.028], 0.023, 0.01, C.mint, ankle, [s, 0, 0], 8),
      0.8,
    );
  }

  // Thigh-mounted field injector rack, and a compact hard-shell medical pouch.
  const leftHip = sides[0].leg.joints[0];
  box([0.285, 0.905, 0.001], [0.058, 0.195, 0.132], C.navy, leftHip);
  for (let i = 0; i < 2; i++) {
    const z = -0.035 + i * 0.074;
    cylinder([0.319, 0.905, z], 0.023, 0.14, C.edge, leftHip, [0, 1, 0], 8);
    cylinder([0.319, 0.912, z], 0.017, 0.087, C.deepTeal, leftHip, [0, 1, 0], 8);
    glow(cylinder([0.319, 0.917, z], 0.018, 0.056, C.mint, leftHip, [0, 1, 0], 8), 0.8);
    cylinder([0.319, 0.979, z], 0.025, 0.022, C.orange, leftHip, [0, 1, 0], 8);
  }
  const rightHip = sides[1].leg.joints[0];
  box([-0.279, 0.918, 0.017], [0.092, 0.177, 0.161], teal, rightHip);
  box([-0.279, 0.99, 0.017], [0.104, 0.04, 0.173], ceramic, rightHip);
  graphic([-0.279, 0.923, 0.101], 0.076, 0.094, medicalTexture, rightHip);

  // ---------------------------------------------------------------------------
  // Backpack. Six articulated ceramic induction vanes make the medic silhouette.
  // ---------------------------------------------------------------------------

  box([0, 1.479, -0.231], [0.299, 0.373, 0.166], C.navy, chest);
  box([0, 1.499, -0.309], [0.264, 0.321, 0.073], ceramic, chest);
  box([0, 1.656, -0.246], [0.23, 0.043, 0.154], teal, chest);
  cylinder([0, 1.49, -0.359], 0.103, 0.035, teal, chest, [0, 0, -1], 12);
  cylinder([0, 1.49, -0.381], 0.075, 0.018, C.navy, chest, [0, 0, -1], 12);
  glow(
    graphic([0, 1.49, -0.393], 0.124, 0.124, inductionTexture, chest, [0, 0, -1]),
    1.1,
  );
  graphic([0, 1.362, -0.35], 0.197, 0.075, warningTexture, chest, [0, 0, -1]);

  for (const side of sides) {
    const { s, wing } = side;
    cylinder([s * 0.192, 1.49, -0.225], 0.046, 0.302, C.edge, chest, [0, 1, 0], 10);
    cylinder([s * 0.192, 1.49, -0.225], 0.048, 0.162, teal, chest, [0, 1, 0], 10);
    cylinder([s * 0.192, 1.655, -0.225], 0.049, 0.028, C.orange, chest, [0, 1, 0], 10);

    cylinder(wing, 0.074, 0.105, C.joint, wing, [0, 0, 1], 10);
    cylinder([s * 0.205, 1.58, -0.165], 0.047, 0.025, ceramic, wing, [0, 0, 1], 10);
    bolt([s * 0.205, 1.58, -0.147], wing, 0.02);

    const vanePairs = [
      { a: [s * 0.258, 1.628, -0.286], z: [s * 0.466, 2.088, -0.315], width: 0.108 },
      { a: [s * 0.292, 1.554, -0.292], z: [s * 0.715, 1.936, -0.327], width: 0.122 },
      { a: [s * 0.304, 1.489, -0.29], z: [s * 0.831, 1.708, -0.32], width: 0.126 },
    ];

    for (const [i, vane] of vanePairs.entries()) {
      const a = new THREE.Vector3(...(vane.a as [number, number, number]));
      const z = new THREE.Vector3(...(vane.z as [number, number, number]));
      const direction = z.clone().sub(a).normalize();
      const across = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
      const len = a.distanceTo(z);
      const w = vane.width;

      const outline = (
        inset: number,
        front: number,
      ): THREE.Vector3[] => {
        const start = a.clone().addScaledVector(direction, inset);
        const end = z.clone().addScaledVector(direction, -inset);
        const ww = w - inset * 0.9;
        return [
          start.clone().addScaledVector(across, -ww * 0.41),
          start.clone().addScaledVector(across, ww * 0.41),
          end.clone().addScaledVector(direction, -len * 0.08).addScaledVector(across, ww * 0.5),
          end.clone(),
          end.clone().addScaledVector(direction, -len * 0.19).addScaledVector(across, -ww * 0.5),
        ].map((p) => p.add(new THREE.Vector3(0, 0, front)));
      };

      b.slab(outline(0, 0), { thickness: 0.064, color: C.navy, bone: wing });
      b.slab(outline(0.012, 0.032), { thickness: 0.033, color: ceramic, bone: wing });

      const stripA = a.clone().addScaledVector(direction, len * 0.18).add(new THREE.Vector3(0, 0, 0.055));
      const stripB = a.clone().addScaledVector(direction, len * 0.78).add(new THREE.Vector3(0, 0, 0.055));
      b.rod(stripA, stripB, 0.024, { bone: wing, color: teal, section: "box" });
      litBar(stripA, stripB, 0.008, wing);
      const tip = z.clone().addScaledVector(direction, -0.046).add(new THREE.Vector3(0, 0, 0.057));
      ellipsoid(tip, [0.026, 0.022, 0.008], C.orange, wing, 8);
      const fastener = a.clone().addScaledVector(direction, 0.058).add(new THREE.Vector3(0, 0, 0.057));
      bolt(fastener, wing, 0.012);
      if (i === 1) {
        b.rod(
          [s * 0.202, 1.58, -0.26],
          a.clone().addScaledVector(direction, 0.17),
          0.022,
          { color: brushed, bone: wing, sides: 6 },
        );
      }
    }

    b.sweep(
      bezier(
        [s * 0.158, 1.375, -0.23],
        [s * 0.34, 1.313, -0.27],
        [s * 0.34, 1.516, -0.28],
      ),
      0.017,
      { color: C.navy, bone: chest, sides: 6 },
    );
  }

  // ---------------------------------------------------------------------------
  // Healing staff. Functional shaft, protective split crown and induction core.
  // ---------------------------------------------------------------------------

  b.rod([staffX, 0.145, staffZ], [staffX, 2.174, staffZ], 0.032, {
    bone: staff,
    color: brushed,
    sides: 10,
  });
  cylinder([staffX, 0.165, staffZ], 0.053, 0.095, C.navy, staff, [0, 1, 0], 10);
  cylinder([staffX, 0.125, staffZ], 0.055, 0.021, C.edge, staff, [0, 1, 0], 10);

  for (const [a, z] of [
    [0.25, 0.68],
    [0.79, 1.24],
    [1.53, 1.98],
  ]) {
    cylinder([staffX, (a + z) / 2, staffZ], 0.044, z - a, ceramic, staff, [0, 1, 0], 10);
    box([staffX, (a + z) / 2, staffZ + 0.045], [0.023, z - a - 0.065, 0.011], teal, staff);
    litBar(
      [staffX, a + 0.043, staffZ + 0.054],
      [staffX, z - 0.043, staffZ + 0.054],
      0.006,
      staff,
    );
  }

  // Wrapped graphite hand grip; amber rings make the contact easy to read.
  cylinder([staffX, 1.389, staffZ], 0.041, 0.236, C.navy, staff, [0, 1, 0], 10);
  for (let i = 0; i < 7; i++) {
    cylinder([staffX, 1.292 + i * 0.032, staffZ], 0.044, 0.009, C.joint, staff, [0, 1, 0], 10);
  }
  for (const y of [0.23, 0.72, 1.272, 1.516, 2.015]) {
    cylinder([staffX, y, staffZ], 0.052, 0.036, teal, staff, [0, 1, 0], 10);
    cylinder([staffX, y + 0.013, staffZ], 0.055, 0.009, C.orange, staff, [0, 1, 0], 10);
  }

  b.lathe(
    [
      [0, 0],
      [0.047, 0],
      [0.071, 0.059],
      [0.077, 0.125],
      [0.055, 0.17],
      [0, 0.17],
    ],
    {
      at: [staffX, 2.036, staffZ],
      segments: 10,
      color: ceramic,
      bone: staff,
    },
  );
  graphic([staffX, 1.784, staffZ + 0.057], 0.067, 0.108, unitTexture, staff);

  const coreY = 2.352;
  b.part(new THREE.TorusGeometry(0.164, 0.025, 6, 28), C.navy, {
    bone: staff,
    at: [staffX, coreY, staffZ],
  });
  b.part(new THREE.TorusGeometry(0.153, 0.012, 6, 28), ceramic, {
    bone: staff,
    at: [staffX, coreY, staffZ + 0.023],
  });
  glow(
    b.part(new THREE.TorusGeometry(0.127, 0.008, 6, 24), C.mint, {
      bone: staff,
      at: [staffX, coreY, staffZ + 0.014],
    }),
    1.3,
  );

  for (const s of [1, -1]) {
    plate(
      [staffX, 2.12, staffZ],
      [
        [s * 0.027, 0],
        [s * 0.097, 0.018],
        [s * 0.228, 0.226],
        [s * 0.211, 0.364],
        [s * 0.143, 0.443],
        [s * 0.149, 0.303],
        [s * 0.153, 0.224],
        [s * 0.055, 0.071],
      ],
      0.079,
      ceramic,
      staff,
      0.009,
    );
    plate(
      [staffX, 2.12, staffZ + 0.044],
      [
        [s * 0.054, 0.034],
        [s * 0.087, 0.048],
        [s * 0.198, 0.23],
        [s * 0.189, 0.335],
        [s * 0.171, 0.36],
        [s * 0.175, 0.233],
      ],
      0.013,
      teal,
      staff,
      0.003,
    );
    litBar(
      [staffX + s * 0.187, 2.369, staffZ + 0.056],
      [staffX + s * 0.18, 2.447, staffZ + 0.056],
      0.008,
      staff,
    );
    plate(
      [staffX + s * 0.177, 2.499, staffZ + 0.051],
      [
        [-0.023, -0.015],
        [0.023, -0.015],
        [0.012, 0.02],
        [-0.012, 0.02],
      ],
      0.015,
      C.orange,
      staff,
      0.003,
    );
  }

  // Physical cross-braces hold the glowing core inside the cage.
  for (const s of [1, -1]) {
    b.rod(
      [staffX + s * 0.134, coreY - 0.069, staffZ - 0.007],
      [staffX + s * 0.061, coreY - 0.027, staffZ],
      0.012,
      { bone: staff, color: brushed, sides: 6 },
    );
  }
  glow(
    ellipsoid([staffX, coreY, staffZ], [0.087, 0.105, 0.059], C.mint, staff, 10),
    1.15,
  );
  glow(
    graphic([staffX, coreY, staffZ + 0.069], 0.144, 0.144, inductionTexture, staff),
    1.2,
  );
  cylinder([staffX, 2.166, staffZ], 0.062, 0.025, teal, staff, [0, 1, 0], 10);

  b.ring(
    frame([staffX, coreY, staffZ + 0.033], [0, 0, 1]),
    { count: 8, radius: 0.164 },
    (item) => {
      cylinder(item, 0.014, 0.012, C.orange, staff, [0, 0, 1], 6);
    },
  );

  // A flexible cable loops behind the staff grip, not across the face or hand.
  b.sweep(
    bezier(
      [staffX + 0.025, 1.555, staffZ - 0.015],
      [staffX + 0.137, 1.735, staffZ - 0.045],
      [staffX + 0.107, 2.034, staffZ - 0.045],
      [staffX + 0.032, 2.097, staffZ - 0.01],
    ),
    0.012,
    { bone: staff, color: C.navy, sides: 6 },
  );

  // ---------------------------------------------------------------------------
  // Small staged rescue-bay base. Nothing competes with the face and silhouette.
  // ---------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(1.15, 1.205, 0.09, 10), C.navy, {
    at: [0, 0.045, -0.015],
    scale: [1, 1, 0.665],
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(1.131, 1.15, 0.025, 10), brushed, {
    at: [0, 0.1025, -0.015],
    scale: [1, 1, 0.665],
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(0.624, 0.636, 0.006, 10), C.joint, {
    at: [0, 0.118, 0],
    scale: [1, 1, 0.8],
    bone: root,
  });

  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.sin(angle) * 1.078;
    const z = Math.cos(angle) * 0.714 - 0.015;
    const tangent = (angle * 180) / Math.PI;
    box(
      [x, 0.111, z],
      [0.102, 0.012, 0.029],
      i % 3 === 0 ? C.orange : C.deepTeal,
      root,
      [0, tangent, 0],
    );
    if (i % 2 === 0) {
      glow(
        box(
          [x * 0.96, 0.122, z * 0.96],
          [0.067, 0.007, 0.014],
          C.mint,
          root,
          [0, tangent, 0],
        ),
        0.65,
      );
    }
  }

  graphic([0, 0.063, 0.757], 0.59, 0.118, platformTexture, root);

  // Staff parking socket is shallow, so the butt really rests on the platform.
  cylinder([staffX, 0.12, staffZ], 0.081, 0.012, C.dark, root, [0, 1, 0], 10);
  cylinder([staffX, 0.128, staffZ], 0.06, 0.01, teal, root, [0, 1, 0], 10);

  // A spare trauma battery and its carry handle sit behind the boot.
  box([0.563, 0.236, -0.284], [0.237, 0.224, 0.184], teal, root);
  box([0.563, 0.351, -0.284], [0.255, 0.036, 0.198], ceramic, root);
  box([0.563, 0.132, -0.284], [0.245, 0.025, 0.195], C.navy, root);
  graphic([0.563, 0.244, -0.188], 0.127, 0.139, medicalTexture, root);
  for (const x of [0.472, 0.654]) {
    box([x, 0.297, -0.18], [0.027, 0.069, 0.018], C.navy, root);
    box([x, 0.304, -0.167], [0.021, 0.025, 0.01], C.orange, root);
  }
  b.rod([0.502, 0.369, -0.284], [0.502, 0.413, -0.284], 0.012, { color: C.navy, bone: root });
  b.rod([0.624, 0.369, -0.284], [0.624, 0.413, -0.284], 0.012, { color: C.navy, bone: root });
  b.rod([0.502, 0.413, -0.284], [0.624, 0.413, -0.284], 0.016, { color: C.navy, bone: root });

  // Sparse, deterministic little deck fasteners and painted service strokes.
  for (let i = 0; i < 8; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.79 + random() * 0.14;
    cylinder(
      [Math.sin(a) * r, 0.119, Math.cos(a) * r * 0.61],
      0.014,
      0.007,
      C.navy,
      root,
      [0, 1, 0],
      6,
    );
  }
  for (const s of [1, -1]) {
    box([s * 0.481, 0.123, 0.26], [0.027, 0.006, 0.214], C.edge, root);
    box([s * 0.429, 0.123, 0.355], [0.125, 0.006, 0.027], C.edge, root);
  }

  return b.root;
}
```
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  polyline,
  rng,
  svg,
  paint,
  grain,
  mottle,
  noise,
  mix,
} from "../../../../src/index";
import type {
  Joint,
  PointInput,
  DirectionInput,
  OutlinePoint,
  ColorInput,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aelwyn • Ranger of the Verdant Moon",
  description:
    "A silver-haired elven archer in emerald leaf armour, with a gilded recurve bow, embroidered woodland cloak, and a full quiver. A rig-ready high-fantasy anime puppet on a mossy waystone base.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Aelwyn_Verdant_Moon",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(8217);

  const C = {
    ink: "#232d39",
    deep: "#123f3a",
    forest: "#24634d",
    green: "#368163",
    jade: "#67b293",
    mint: "#a8ead1",
    ivory: "#eee7cf",
    gold: "#d6ad57",
    goldLight: "#ffe4a0",
    leather: "#704738",
    leatherDark: "#422d2b",
    skin: "#f3cfb5",
    skinShade: "#d79c86",
    blush: "#e99b94",
    hair: "#eee9d8",
    hairShade: "#a0b8b1",
    hairLight: "#fff6dc",
    stone: "#596a68",
    stoneDark: "#35494a",
    moss: "#728b48",
    shaft: "#ae7950",
    feather: "#cce5d3",
    jewel: "#58ecc9",
    steel: "#b7c9c7",
  };

  const skin = paint((_p, n) =>
    mix(
      "#e9b9a3",
      "#ffe1c4",
      Math.max(0.30, Math.min(1, 0.76 + n.y * 0.17 + n.z * 0.08)),
    ),
  );
  const cloth = paint((p, n) => {
    const weave =
      (Math.sin(p.y * 690) * Math.sin((p.x + p.z) * 720) + 1) * 0.025;
    return mix(
      C.deep,
      C.green,
      Math.min(0.95, 0.52 + n.y * 0.2 + n.z * 0.08 + weave + noise(p, 0.065, 22) * 0.13),
    );
  });
  const cloakPaint = paint((p, n) =>
    mix(
      "#173e3b",
      "#3c7960",
      Math.min(1, 0.36 + 0.22 * n.y + 0.28 * noise(p, 0.12, 4)),
    ),
  );
  const paleCloth = paint((p, n) => {
    const weave =
      Math.sin(p.y * 760) * Math.sin((p.x + p.z) * 810) * 0.013;
    return mix(
      "#c0c8b4",
      "#eee9d4",
      Math.max(0.20, Math.min(0.94, 0.70 + n.y * 0.14 + weave)),
    );
  });
  const trouserCloth = paint((p, n) =>
    mix(
      "#798c78",
      "#bac5a5",
      Math.max(
        0.20,
        Math.min(0.92, 0.57 + n.y * 0.16 + noise(p, 0.035, 61) * 0.10),
      ),
    ),
  );
  const leather = paint((p, n) => {
    const wear = noise(p, 0.14, 15);
    const pores = noise(p, 0.006, 16);
    return mix(
      "#443831",
      "#84624a",
      Math.max(
        0.16,
        Math.min(0.91, 0.48 + n.y * 0.18 + wear * 0.18 + pores * 0.025),
      ),
    );
  });
  const gold = paint((p, n) =>
    mix(
      "#99743a",
      C.goldLight,
      Math.min(1, 0.45 + 0.37 * Math.max(0, n.y) + 0.18 * noise(p, 0.025, 7)),
    ),
  );
  const silverHair = paint((p, n) => {
    const streak = Math.pow(noise(p, 0.013, 43), 1.3);
    const tip = Math.max(0, Math.min(1, (1.38 - p.y) / 0.31));
    const base = mix(C.hairShade, C.hairLight, 0.57 + n.y * 0.16 + streak * 0.22);
    return mix(base, "#86bfa9", tip * 0.58);
  });
  const bowGrain = grain("#576349", "#879166", {
    size: 0.025,
    axis: "y",
    seed: 32,
  });
  const bowWood = paint((p, n) =>
    mix(
      bowGrain.at(p, n),
      "#6e8055",
      0.67 - Math.max(0, n.y) * 0.10,
    ),
  );
  const stonePaint = mottle("#3c5151", "#7b8580", {
    size: 0.095,
    contrast: 1.35,
    seed: 33,
  });
  const groundPaint = paint((p, n) =>
    n.y > 0.45
      ? mix("#40554a", "#788653", noise(p, 0.21, 77))
      : mix("#2d4042", "#62706a", noise(p, 0.13, 79)),
  );

  // Drawings are deliberately bold enough to survive at puppet scale.
  const eyeTexture = svg(
    `<svg viewBox="0 0 100 120">
      <defs>
        <clipPath id="eye"><path d="M10 51 Q23 21 55 28 Q84 31 92 54 Q82 91 52 94 Q20 90 10 51Z"/></clipPath>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#71402b"/>
          <stop offset=".5" stop-color="#dc963b"/>
          <stop offset="1" stop-color="#ffe78f"/>
        </linearGradient>
      </defs>
      <path d="M8 53 Q20 19 56 25 Q85 29 96 53 Q84 96 51 98 Q17 91 8 53Z" fill="#26312f"/>
      <g clip-path="url(#eye)">
        <rect width="100" height="120" fill="#fff8e8"/>
        <ellipse cx="56" cy="61" rx="26" ry="34" fill="url(#iris)"/>
        <path d="M30 62 Q53 77 82 60 L79 83 Q57 100 34 81Z" fill="#efd269"/>
        <ellipse cx="56" cy="61" rx="14" ry="23" fill="#25342e"/>
        <path d="M34 82 L41 74 M47 88 L49 77 M62 88 L60 77 M75 79 L69 72" stroke="#fff0ac" stroke-width="2.5"/>
        <ellipse cx="43" cy="42" rx="10" ry="12" fill="#ffffff"/>
        <circle cx="70" cy="73" r="5" fill="#fffdf0"/>
        <circle cx="76" cy="61" r="2.7" fill="#ffffff"/>
      </g>
      <path d="M8 53 Q22 20 56 26 Q85 29 96 53" fill="none" stroke="#24322e" stroke-width="7" stroke-linecap="round"/>
      <path d="M14 42 L2 28 L7 48 M19 35 L11 21" fill="#24322e"/>
      <path d="M16 91 Q27 100 35 96" fill="none" stroke="#bc7a68" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const blushTexture = svg(
    `<svg viewBox="0 0 120 45">
      <defs>
        <radialGradient id="rose">
          <stop offset="0" stop-color="#eaa89d" stop-opacity=".65"/>
          <stop offset=".72" stop-color="#eaa89d" stop-opacity=".30"/>
          <stop offset="1" stop-color="#eaa89d" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="23" rx="57" ry="20" fill="url(#rose)"/>
      <path d="M43 28 L47 17 M57 29 L61 18 M71 28 L75 17"
        stroke="#cb8c80" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const mouthTexture = svg(
    `<svg viewBox="0 0 140 50">
      <path d="M13 21 Q68 46 126 19 Q77 53 32 36Z" fill="#b66b66"/>
      <path d="M15 21 Q70 39 126 19" fill="none" stroke="#724c4b" stroke-width="5" stroke-linecap="round"/>
      <path d="M48 37 Q72 42 92 34" fill="none" stroke="#ffd9c7" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const leafEmblem = svg(
    `<svg viewBox="0 0 120 160">
      <path d="M60 9 C114 41 105 91 60 141 C15 91 6 41 60 9Z"
        fill="#163d38" stroke="#e0bb69" stroke-width="6"/>
      <path d="M75 26 C103 57 94 102 58 122 C77 88 79 52 75 26Z" fill="#e8ce83"/>
      <path d="M61 27 L61 138 M60 54 L35 39 M60 73 L32 58 M59 93 L38 76 M60 110 L43 95"
        fill="none" stroke="#d8b970" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 4 L65 13 L60 21 L55 13Z M60 142 L65 150 L60 158 L55 150Z" fill="#a8ead1"/>
      <circle cx="22" cy="100" r="3" fill="#f8df9b"/>
      <circle cx="97" cy="100" r="3" fill="#f8df9b"/>
    </svg>`,
    { size: 384 },
  );

  const embroidery = svg(
    `<svg viewBox="0 0 300 110">
      <path d="M0 95 H300 M0 103 H300" stroke="#d5b76c" stroke-width="4"/>
      <path d="M-10 76 Q20 32 50 72 T110 72 T170 72 T230 72 T290 72 T350 72"
        fill="none" stroke="#ddc380" stroke-width="5"/>
      ${[20, 80, 140, 200, 260]
        .map(
          (x) => `<path d="M${x} 74 Q${x - 27} 45 ${x - 8} 28 Q${x + 7} 39 ${x} 74Z" fill="#82bca0" stroke="#e4ca87" stroke-width="3"/>
          <path d="M${x + 16} 68 Q${x + 40} 37 ${x + 45} 53 Q${x + 44} 70 ${x + 16} 68Z" fill="#82bca0" stroke="#e4ca87" stroke-width="3"/>
          <path d="M${x - 8} 28 L${x} 69" stroke="#f3dda0" stroke-width="3"/>`,
        )
        .join("")}
    </svg>`,
    { size: 512 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 200 65">
      <path d="M5 7 H195 M5 57 H195" stroke="#d8bf7b" stroke-width="3"/>
      <g fill="none" stroke="#e7cc85" stroke-width="4" stroke-linecap="square">
        <path d="M20 43 V20 L31 12 L42 20 V43 M20 31 H42"/>
        <path d="M61 13 V44 L80 33 L61 22 M89 13 V44"/>
        <path d="M110 43 V13 L127 29 L110 43 M137 13 V43 L150 31"/>
        <path d="M170 13 V43 M157 22 L170 13 L184 22"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const featherTexture = svg(
    `<svg viewBox="0 0 60 160">
      <path d="M30 155 L8 130 L11 78 L22 12 L31 2 L46 21 L53 83 L50 130Z"
        fill="#d9ecdc" stroke="#416b59" stroke-width="4"/>
      <path d="M31 8 L28 152" stroke="#719780" stroke-width="4"/>
      <path d="M30 40 L46 28 M30 60 L49 45 M30 80 L51 62 M29 100 L49 84
        M29 122 L48 106 M29 58 L15 44 M29 82 L13 63 M29 105 L11 89 M28 125 L11 112"
        fill="none" stroke="#97b7a0" stroke-width="3"/>
      <path d="M10 121 L28 143 L49 120 L50 134 L30 157 L9 137Z" fill="#3d826b"/>
    </svg>`,
    { size: 256 },
  );

  const mapTexture = svg(
    `<svg viewBox="0 0 180 120">
      <rect width="180" height="120" rx="5" fill="#e8d8aa"/>
      <path d="M9 9 H171 V111 H9Z" fill="none" stroke="#856e44" stroke-width="3"/>
      <path d="M14 86 Q45 48 66 68 T112 42 T165 25 M22 25 Q61 37 85 18
        M95 93 Q129 64 160 91" fill="none" stroke="#72846a" stroke-width="4"/>
      <path d="M42 34 L54 17 L66 34 M52 36 L69 13 L83 36 M106 82 L119 60 L136 83"
        fill="none" stroke="#826c49" stroke-width="3"/>
      <path d="M35 97 Q67 98 82 74 Q91 58 120 56" fill="none" stroke="#ad5d42" stroke-width="3" stroke-dasharray="4 5"/>
      <path d="M117 49 L129 61 M129 49 L117 61" stroke="#ad5d42" stroke-width="4"/>
      <path d="M153 12 V37 M143 23 H164 M153 12 L150 19 M153 12 L157 19"
        stroke="#67573c" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const waystoneTexture = svg(
    `<svg viewBox="0 0 120 140">
      <path d="M60 10 L91 40 L60 70 L29 40Z M60 24 V122 M35 83 L60 101 L85 83
        M35 106 L60 124 L85 106" fill="none" stroke="#a6d6b2" stroke-width="7"/>
      <circle cx="60" cy="40" r="7" fill="#eff4ce"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. All positions are in metres, +Z is the front.
  const hips = b.joint("hips", {
    at: [0, 0.96, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.96, 0],
      [0, 1.15, 0],
      [0, 1.36, 0],
    ],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    [
      [0, 1.36, 0],
      [0, 1.46, 0],
      [0, 1.54, 0.01],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.58, 0.012],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.573, 0.016],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return {
      s,
      side,
      chain: b.chain(
        `arm${side}`,
        [
          [s * 0.205, 1.355, 0],
          [s * 0.515, 1.25, 0],
          [s * 0.755, 1.145, 0.013],
        ],
        {
          parent: chest,
          names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
          role: "arm",
        },
      ),
    };
  });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return {
      s,
      side,
      chain: b.chain(
        `leg${side}`,
        [
          [s * 0.125, 0.96, 0],
          [s * 0.145, 0.565, 0.018],
          [s * 0.15, 0.195, 0.035],
        ],
        {
          parent: hips,
          names: [`hip${side}`, `knee${side}`, `ankle${side}`],
          role: "leg",
          contact: [s * 0.15, 0.08, 0.105],
        },
      ),
    };
  });

  const digits = arms.flatMap(({ s, side, chain }) => {
    const names = ["index", "middle", "ring", "little"];
    const fingers = names.map((name, i) => {
      const z = 0.070 - i * 0.042;
      const reach = [0.114, 0.126, 0.115, 0.093][i];
      return {
        chain: b.chain(
          `${name}${side}`,
          [
            [s * 0.817, 1.122 - i * 0.004, z],
            [s * (0.817 + reach * 0.52), 1.105 - i * 0.011, z + (1.5 - i) * 0.008],
            [s * (0.817 + reach), 1.099 - i * 0.015, z + (1.5 - i) * 0.013],
          ],
          {
            parent: chain.tip!,
            names: [`${name}${side}1`, `${name}${side}2`, `${name}${side}Tip`],
            role: "digit",
          },
        ),
        thumb: false,
        side,
      };
    });
    return [
      ...fingers,
      {
        chain: b.chain(
          `thumb${side}`,
          [
            [s * 0.782, 1.145, 0.060],
            [s * 0.811, 1.17, 0.105],
            [s * 0.854, 1.171, 0.137],
          ],
          {
            parent: chain.tip!,
            names: [`thumb${side}1`, `thumb${side}2`, `thumb${side}Tip`],
            role: "digit",
          },
        ),
        thumb: true,
        side,
      },
    ];
  });

  const hairChain = b.chain(
    "hairBack",
    [
      [0, 1.72, -0.075],
      [0, 1.51, -0.13],
      [0, 1.28, -0.20],
      [0, 1.065, -0.185],
    ],
    { parent: head, names: ["hairRoot", "hairMid", "hairTip"], role: "fan" },
  );

  const cloakJoints = [1, -1].map((s) => ({
    s,
    joint: b.joint(`cloak${s > 0 ? "L" : "R"}`, {
      parent: chest,
      at: [s * 0.16, 1.345, -0.085],
      dir: [0, -1, -0.1],
      role: "hinge",
    }),
  }));

  const bowBone = b.joint("bowGrip", {
    parent: arms[0].chain.tip!,
    at: [0.936, 1.15, 0.083],
    dir: [0, 1, 0],
  });
  const quiverBone = b.joint("quiver", {
    parent: chest,
    at: [-0.255, 1.02, -0.17],
    dir: [-0.16, 0.985, -0.075],
  });

  const H = 1.04;
  const face = b.region({ at: [0, 1.65, 0.015], scale: H, bone: head });

  // Reusable primitive assemblies.
  function ellipsoid(
    at: PointInput,
    scale: number[],
    color: ColorInput,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale,
      bone,
      name,
    });
  }

  function box(
    at: PointInput,
    size: number[],
    color: ColorInput,
    bone: Joint,
    name: string,
    rotation?: number[],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      rotation,
    });
  }

  function stud(at: PointInput, bone: Joint, radius = 0.009) {
    return ellipsoid(at, [radius, radius, radius * 0.65], gold, bone, "gilt_rivet", 8);
  }

  function drawing(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
    name = "embroidered_detail",
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir,
      axis: "z",
      up: [0, 1, 0],
      texture,
      bone,
      name,
    });
  }

  function outlineTrim(
    outline: OutlinePoint[],
    at: number[],
    bone: Joint,
    color: ColorInput,
    radius = 0.004,
    zLift = 0.018,
  ) {
    const points = outline.map((p) => [at[0] + p[0], at[1] + p[1], at[2] + zLift]);
    b.sweep(polyline(points, { closed: true }), radius, {
      color,
      bone,
      sides: 6,
      caps: "flat",
      name: "raised_gilt_edge",
    });
  }

  const leafOutline: OutlinePoint[] = [
    [0, 0.11, "sharp"],
    [0.062, 0.045],
    [0.049, -0.052],
    [0, -0.115, "sharp"],
    [-0.049, -0.052],
    [-0.062, 0.045],
  ];

  function leafPlate(
    at: number[],
    width: number,
    height: number,
    bone: Joint,
    color: ColorInput,
    name: string,
    angleDeg = 0,
  ) {
    const angle = angleDeg * Math.PI / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const outline = leafOutline.map((p) => {
      const x = p[0] * width;
      const y = p[1] * height;
      return [x * c - y * s, x * s + y * c] as OutlinePoint;
    });
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color,
      bone,
      name,
    });
    outlineTrim(outline, at, bone, gold, 0.0035, 0.012);
    b.rod(
      [at[0] + 0.075 * height * s, at[1] - 0.075 * height * c, at[2] + 0.014],
      [at[0] - 0.074 * height * s, at[1] + 0.074 * height * c, at[2] + 0.014],
      0.0028,
      { color: C.goldLight, bone, sides: 5 },
    );
    for (const side of [1, -1]) {
      for (const y of [-0.027, 0.027]) {
        const rootY = y * height;
        const tipX = side * 0.035 * width;
        const tipY = (y + 0.025) * height;
        b.rod(
          [at[0] - rootY * s, at[1] + rootY * c, at[2] + 0.014],
          [
            at[0] + tipX * c - tipY * s,
            at[1] + tipX * s + tipY * c,
            at[2] + 0.014,
          ],
          0.0018,
          { color: C.jade, bone, sides: 5, name: "leaf_guard_inlaid_vein" },
        );
      }
    }
  }

  function tassel(at: number[], bone: Joint, length = 0.085) {
    ellipsoid(at, [0.012, 0.018, 0.012], gold, bone, "tassel_cap", 8);
    for (let i = 0; i < 4; i++) {
      b.rod(
        [at[0] + (i - 1.5) * 0.007, at[1] - 0.01, at[2]],
        [at[0] + (i - 1.5) * 0.009, at[1] - length, at[2] + 0.003],
        [0.004, 0.002],
        { color: i % 2 ? C.gold : C.jade, bone, sides: 5 },
      );
    }
  }

  // Settle the face before clothing and equipment.
  const skull = ellipsoid(
    face.p([0, 0.021, -0.004]),
    [face.s(0.124), face.s(0.145), face.s(0.108)],
    skin,
    head,
    "upper_face",
    20,
  );
  const lowerJaw = ellipsoid(
    face.p([0, -0.063, -0.009]),
    [face.s(0.080), face.s(0.065), face.s(0.073)],
    skin,
    jaw,
    "lower_jaw",
    18,
  );

  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: face.p([s * 0.054, 0.009, 0.102]),
      dir: [s * 0.12, 0.01, 1],
      size: [face.s(0.097), face.s(0.097)],
      up: [0, 1, 0],
      mirror: s > 0,
      lift: 0.0018,
      segments: 9,
      bone: head,
      name: `amber_eye${s > 0 ? "L" : "R"}`,
    });

    const eyebrow = b.surface(skull).drape(
      bezier(
        face.p([s * 0.028, 0.070, 0.090]),
        face.p([s * 0.065, 0.083, 0.089]),
        face.p([s * 0.102, 0.066, 0.070]),
      ),
      { lift: 0.0025 },
    );
    b.sweep(eyebrow, [0.0048, 0.0018], {
      color: "#788d80",
      bone: head,
      sides: 5,
      name: "delicate_eyebrow",
    });

    b.decal(skull, blushTexture, {
      at: face.p([s * 0.081, -0.044, 0.078]),
      dir: [s * 0.24, -0.02, 1],
      size: [0.045, 0.018],
      lift: 0.0015,
      segments: 6,
      bone: head,
      name: "painted_cheek_blush",
    });

    const ear: OutlinePoint[] = [
      [0, -0.031],
      [0.043, -0.044],
      [0.111, -0.006],
      [0.190, 0.083, "sharp"],
      [0.066, 0.040],
      [0, 0.039],
    ];
    b.extrude(
      ear.map((p) => [face.s(p[0] * 0.85), face.s(p[1])] as OutlinePoint),
      {
        at: face.p([s * 0.107, 0.022, -0.014]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: face.s(0.035),
        bevel: 0.005,
        smoothing: 1,
        color: skin,
        bone: head,
        name: `pointed_ear${s > 0 ? "L" : "R"}`,
      },
    );
    b.extrude(
      [
        [0.013, -0.022],
        [0.045, -0.025],
        [0.083, 0.008],
        [0.132, 0.061, "sharp"],
        [0.050, 0.024],
        [0.016, 0.024],
      ],
      {
        at: face.p([s * 0.111, 0.024, 0.007]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: "#dcae99",
        bone: head,
        name: "inner_ear_fold",
      },
    );
    const earringAt = face.p([s * 0.159, -0.018, 0.013]);
    b.part(new THREE.TorusGeometry(0.018, 0.0035, 5, 12), gold, {
      at: earringAt,
      bone: head,
      name: "earring_hoop",
    });
    b.rod(
      face.p([s * 0.159, -0.036, 0.014]),
      face.p([s * 0.159, -0.058, 0.014]),
      0.003,
      { color: gold, bone: head, sides: 5 },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.014), C.jewel, {
        at: face.p([s * 0.159, -0.068, 0.014]),
        scale: [0.7, 1.4, 0.6],
        bone: head,
        name: "earring_dewdrop",
      }),
      0.45,
    );
  }

  b.extrude(
    [
      [0, 0.010],
      [0.012, -0.014],
      [0.021, -0.020],
      [0.014, -0.027],
      [0, -0.025],
    ],
    {
      at: face.p([0, -0.009, 0.093]),
      thickness: 0.015,
      color: skin,
      bone: head,
      name: "small_angular_nose",
    },
  );
  ellipsoid(
    face.p([0, -0.028, 0.114]),
    [0.007, 0.003, 0.003],
    "#ffe4cc",
    head,
    "nose_highlight",
    8,
  );
  b.decal(lowerJaw, mouthTexture, {
    at: face.p([0, -0.079, 0.074]),
    dir: [0, 0, 1],
    size: [0.048, 0.015],
    lift: 0.0017,
    bone: jaw,
    segments: 6,
    name: "quiet_smile",
  });

  // Silver hair: a solid cap and a restrained collection of broad tapered locks.
  ellipsoid(
    face.p([0, 0.052, -0.052]),
    [face.s(0.138), face.s(0.165), face.s(0.120)],
    silverHair,
    head,
    "silver_hair_cap",
    16,
  );

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.017 - i * 0.035;
      b.sweep(
        bezier(
          face.p([s * 0.011, 0.207 - i * 0.004, z - 0.021]),
          face.p([s * 0.104, 0.205 - i * 0.010, z]),
          face.p([s * 0.132, 0.058 - i * 0.020, z - 0.009]),
        ),
        (t) => [
          face.s(0.022 * Math.sin(Math.PI * (0.09 + t * 0.87)) + 0.001),
          face.s(0.008 * (1 - t * 0.6)),
        ],
        {
          color: i === 1 ? C.hairLight : silverHair,
          bone: head,
          sides: 6,
          caps: "point",
          name: "swept_crown_hair_lock",
        },
      );
    }
  }

  b.sweep(hairChain, (t) => [0.100 * (1 - t * 0.73), 0.052 * (1 - t * 0.7)], {
    color: silverHair,
    sides: 8,
    caps: "point",
    name: "back_hair_silhouette",
  });

  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.023;
    const start = [x * 0.9, 1.755 - Math.abs(x) * 0.22, -0.101];
    const control = [x * 1.15, 1.43, -0.201 - Math.abs(x) * 0.30];
    const end = [x * 0.7 + Math.sin(i * 1.7) * 0.02, 1.065 + (i % 3) * 0.035, -0.218];
    b.sweep(bezier(start, control, end), (t) => [0.021 * Math.sin(Math.PI * (t * 0.9 + 0.05)), 0.008], {
      color: i % 3 === 0 ? C.hairLight : silverHair,
      bone: hairChain,
      sides: 6,
      caps: "point",
      name: "broad_back_hair_lock",
    });
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const rootX = s * (0.012 + i * 0.026);
      const tipX = s * (0.060 + i * 0.025);
      const fringe = b.sweep(
        bezier(
          face.p([rootX, 0.167 - i * 0.006, -0.006]),
          face.p([s * (0.044 + i * 0.029), 0.130, 0.087]),
          face.p([tipX, 0.090 - i * 0.003, 0.094 - i * 0.011]),
        ),
        (t) => [
          face.s((0.028 - i * 0.001) * (1 - t) + 0.001),
          face.s(0.0065 * (1 - t * 0.65)),
        ],
        {
          color: silverHair,
          bone: head,
          caps: "point",
          section: { ngon: 4 },
          name: "broad_parted_forehead_lock",
        },
      );
      b.sweep(fringe.line(0, 0.0007).slice(0.12, 0.83), [0.0018, 0.0005], {
        color: C.hairLight,
        bone: head,
        sides: 5,
        name: "fringe_drawn_highlight",
      });
    }

    b.sweep(
      bezier(
        face.p([s * 0.112, 0.113, -0.027]),
        face.p([s * 0.137, -0.013, 0.027]),
        face.p([s * 0.120, -0.176, 0.032]),
      ),
      (t) => [0.025 * (1 - t * 0.87), 0.012 * (1 - t * 0.8)],
      {
        color: silverHair,
        bone: head,
        caps: "point",
        sides: 6,
        name: "cheek_framing_lock",
      },
    );

    const braidX = s * 0.113;
    b.sweep(
      [
        [braidX, 1.616, -0.040],
        [braidX * 1.13, 1.46, -0.060],
        [braidX * 1.08, 1.32, -0.070],
      ],
      [0.020, 0.011],
      { color: C.hairShade, bone: head, sides: 6, name: "braid_core" },
    );
    for (let i = 0; i < 7; i++) {
      const y = 1.59 - i * 0.037;
      ellipsoid(
        [braidX + s * (i % 2 ? 0.008 : -0.005), y, -0.050],
        [0.022, 0.025, 0.015],
        i % 2 ? silverHair : C.hairLight,
        head,
        "braided_hair_link",
        8,
      );
    }
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.016, 8), gold, {
      at: [braidX, 1.327, -0.061],
      bone: head,
      name: "braid_gilt_clasp",
    });
    tassel([braidX, 1.315, -0.060], head, 0.056);
  }

  // Delicate crown sits above the eyes, never over them.
  const circletPath = catmull([
    face.p([-0.125, 0.071, 0.018]),
    face.p([-0.075, 0.104, 0.076]),
    face.p([0, 0.121, 0.078]),
    face.p([0.075, 0.104, 0.076]),
    face.p([0.125, 0.071, 0.018]),
  ]);
  b.sweep(circletPath, 0.0045, {
    color: gold,
    bone: head,
    sides: 6,
    name: "forehead_circlet",
  });
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.033, 0.007], [0.047, 0.033], [0.010, 0.021]],
      {
        at: face.p([s * 0.015, 0.122, 0.080]),
        x: [s, 0, 0],
        thickness: 0.006,
        color: gold,
        bone: head,
        name: "circlet_leaf",
      },
    );
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.016), C.jewel, {
      at: face.p([0, 0.129, 0.087]),
      scale: [0.62, 1.18, 0.5],
      bone: head,
      name: "circlet_moonstone",
    }),
    0.65,
  );

  // Torso and supple underlayers, built on the continuous spine.
  const torso = b.loft(
    [
      { at: [0, 0.94, 0], w: 0.34, h: 0.235 },
      { at: [0, 1.075, 0], w: 0.275, h: 0.205 },
      { at: [0, 1.25, 0], w: 0.366, h: 0.24 },
      { at: [0, 1.35, 0], w: 0.398, h: 0.204 },
      { at: [0, 1.39, 0], w: 0.18, h: 0.14 },
    ],
    { bone: spine, color: cloth, sides: 8, name: "fitted_ranger_tunic" },
  );
  b.sweep(neck, [0.066, 0.050], {
    color: skin,
    sides: 10,
    name: "neck_skin",
  });

  b.lathe(
    [
      [0.060, 0],
      [0.086, 0],
      [0.082, 0.025],
      [0.071, 0.066],
      [0.059, 0.066],
      [0.058, 0.025],
    ],
    {
      at: [0, 1.373, 0],
      axis: [0, 1, 0],
      color: C.deep,
      bone: chest,
      segments: 12,
      name: "clean_high_ranger_collar",
    },
  );
  for (const band of [
    { y: 1.380, radius: 0.086 },
    { y: 1.438, radius: 0.071 },
  ]) {
    b.part(new THREE.TorusGeometry(band.radius, 0.0032, 5, 16), gold, {
      at: [0, band.y, 0],
      rotation: [90, 0, 0],
      bone: chest,
      name: "collar_continuous_gilt_rim",
    });
  }
  drawing(
    [0, 1.409, 0.078],
    0.057,
    0.024,
    runeTexture,
    chest,
    [0, 0, 1],
    "collar_elven_woven_script",
  );

  const cuirassOutline: OutlinePoint[] = [
    [-0.142, 0.101],
    [-0.056, 0.138],
    [0, 0.110],
    [0.056, 0.138],
    [0.142, 0.101],
    [0.150, 0.034],
    [0.100, -0.128],
    [0, -0.165, "sharp"],
    [-0.100, -0.128],
    [-0.150, 0.034],
  ];
  b.extrude(cuirassOutline, {
    at: [0, 1.213, 0.105],
    x: [1, 0, 0],
    thickness: 0.044,
    bevel: 0.008,
    color: C.deep,
    bone: chest,
    name: "emerald_leaf_cuirass",
  });
  outlineTrim(cuirassOutline, [0, 1.213, 0.105], chest, gold, 0.005, 0.027);
  drawing([0.044, 1.252, 0.134], 0.121, 0.165, leafEmblem, chest, [0, 0, 1], "verdant_moon_crest");

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      stud([s * (0.119 - i * 0.007), 1.269 - i * 0.043, 0.134], chest, 0.007);
    }
    b.sweep(
      [
        [s * 0.079, 1.205, 0.135],
        [s * 0.069, 1.144, 0.140],
        [s * 0.045, 1.096, 0.136],
      ],
      0.003,
      { color: C.jade, bone: chest, sides: 5, name: "cuirass_inlaid_vein" },
    );
  }

  // Open A-pose arms: sleeve, exposed elbow, leaf bracer and fingerless glove.
  for (const { s, side, chain } of arms) {
    b.sweep(chain, [0.064, 0.056, 0.039], {
      color: skin,
      sides: 8,
      name: `arm_skin${side}`,
    });
    const sleeve = b.sweep(chain, (t) => 0.071 - t * 0.016, {
      from: 0,
      to: 0.51,
      color: paleCloth,
      sides: 8,
      caps: "flat",
      name: `ivory_sleeve${side}`,
    });
    b.sweep(
      b.surface(sleeve).loop(chain.at(0.46), { lift: 0.005 }),
      0.006,
      { color: gold, sides: 6, name: "sleeve_cuff_braid" },
    );

    const shoulderAt = [s * 0.225, 1.364, -0.010];
    ellipsoid(shoulderAt, [0.080, 0.045, 0.062], C.deep, chain.joints[0], "shoulder_armour_underplate", 10);
    for (let i = 0; i < 3; i++) {
      const x = s * (0.211 + i * 0.049);
      const y = 1.407 - i * 0.024;
      const outline: OutlinePoint[] = [
        [-0.043, 0.008],
        [0.009, 0.039],
        [0.063, 0.002],
        [0.085, -0.057, "sharp"],
        [0.015, -0.049],
        [-0.043, -0.020],
      ];
      const origin = [x, y, 0.048];
      const X = [s * 0.95, -0.31, 0];
      const Y = [s * 0.31, 0.95, 0];
      b.extrude(outline, {
        at: origin,
        x: X,
        y: Y,
        thickness: 0.034,
        bevel: 0.004,
        color: i % 2 ? C.forest : C.green,
        bone: chain.joints[0],
        name: "sloping_overlapping_pauldron_leaf",
      });
      const border = outline.map((p) => [
        origin[0] + X[0] * p[0] + Y[0] * p[1],
        origin[1] + X[1] * p[0] + Y[1] * p[1],
        origin[2] + 0.020,
      ]);
      b.sweep(polyline(border, { closed: true }), 0.0035, {
        color: gold,
        bone: chain.joints[0],
        sides: 5,
        name: "pauldron_leaf_gilt_border",
      });
      b.rod(
        [x - s * 0.014, y + 0.003, 0.071],
        [x + s * 0.060, y - 0.045, 0.071],
        0.003,
        {
          color: C.goldLight,
          bone: chain.joints[0],
          sides: 5,
          name: "pauldron_leaf_midvein",
        },
      );
    }

    const bracer = b.sweep(chain, (t) => 0.050 - (t - 0.56) * 0.02, {
      from: 0.56,
      to: 0.99,
      color: leather,
      sides: 8,
      caps: "flat",
      name: `leather_bracer${side}`,
    });
    for (const t of [0.60, 0.91]) {
      b.sweep(
        b.surface(bracer).loop(chain.at(t), { lift: 0.004 }),
        0.0055,
        { color: gold, sides: 6, name: "bracer_gilt_band" },
      );
    }
    leafPlate(
      [s * 0.646, 1.203, 0.061],
      0.70,
      0.83,
      chain.joints[1],
      C.forest,
      "bracer_leaf_guard",
      s * 68,
    );
    for (let i = 0; i < 3; i++) {
      stud([s * (0.599 + i * 0.042), 1.218 - i * 0.018, 0.070], chain.joints[1], 0.0065);
    }

    ellipsoid(
      [s * 0.798, 1.132, 0.013],
      [0.061, 0.031, 0.073],
      leather,
      chain.tip!,
      `fingerless_glove${side}`,
      10,
    );
    box(
      [s * 0.798, 1.145, 0.071],
      [0.070, 0.026, 0.015],
      C.deep,
      chain.tip!,
      "glove_knuckle_patch",
    );
    for (let i = 0; i < 3; i++) {
      stud([s * (0.775 + i * 0.019), 1.155, 0.078], chain.tip!, 0.0045);
    }
  }

  for (const { chain, thumb, side } of digits) {
    b.sweep(chain, [thumb ? 0.0125 : 0.0105, 0.008], {
      color: skin,
      sides: 6,
      name: `separated_finger_${chain.joints[0].name}`,
    });
    b.sweep(chain, [thumb ? 0.014 : 0.012, 0.011], {
      from: 0,
      to: 0.25,
      color: leather,
      sides: 6,
      caps: "flat",
      name: `glove_finger_root${side}`,
    });
  }

  // Leg silhouettes stay distinct under the pointed tunic panels.
  for (const { s, side, chain } of legs) {
    b.sweep(chain, [0.083, 0.070, 0.054], {
      color: trouserCloth,
      sides: 8,
      name: `fitted_trouser${side}`,
    });
    b.sweep(chain, (t) => [0.085 - t * 0.019, 0.052 - t * 0.006], {
      from: 0.04,
      to: 0.45,
      color: trouserCloth,
      sectors: [[-20, 20, C.deep]],
      sides: 8,
      caps: "flat",
      name: `tailored_trouser_seam${side}`,
    });
    const boot = b.sweep(chain, (t) => 0.081 - Math.max(0, t - 0.5) * 0.029, {
      from: 0.45,
      to: 1,
      color: leather,
      sides: 8,
      caps: "flat",
      name: `high_boot${side}`,
    });
    b.sweep(
      b.surface(boot).loop(chain.at(0.48), { lift: 0.004 }),
      0.010,
      { color: C.deep, sides: 6, name: "boot_folded_cuff" },
    );
    b.sweep(
      b.surface(boot).loop(chain.at(0.49), { lift: 0.014 }),
      0.004,
      { color: gold, sides: 5, name: "boot_cuff_piping" },
    );

    b.extrude(
      [
        [-0.036, 0.008],
        [0.212, 0.008],
        [0.250, 0.032, "sharp"],
        [0.214, 0.062],
        [0.115, 0.089],
        [0.072, 0.145],
        [0.065, 0.190],
        [-0.026, 0.190],
      ],
      {
        at: [s * 0.15, 0.08, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.137,
        bevel: 0.012,
        color: leather,
        bone: chain.tip!,
        name: `sculpted_pointed_boot${side}`,
      },
    );
    b.extrude(
      [
        [-0.039, 0],
        [0.214, 0],
        [0.252, 0.023, "sharp"],
        [0.214, 0.030],
        [-0.039, 0.024],
      ],
      {
        at: [s * 0.15, 0.08, 0],
        x: [0, 0, 1],
        thickness: 0.143,
        bevel: 0.003,
        color: C.leatherDark,
        bone: chain.tip!,
        name: "shaped_boot_sole",
      },
    );
    box(
      [s * 0.15, 0.095, -0.009],
      [0.123, 0.029, 0.065],
      C.leatherDark,
      chain.tip!,
      "boot_heel",
    );
    b.slab(
      [
        [s * 0.15 - 0.065, 0.161, 0.137],
        [s * 0.15 + 0.065, 0.161, 0.137],
        [s * 0.15 + 0.039, 0.143, 0.218],
        [s * 0.15, 0.119, 0.249],
        [s * 0.15 - 0.039, 0.143, 0.218],
      ],
      {
        thickness: 0.008,
        color: C.deep,
        bone: chain.tip!,
        name: "leaf_shaped_boot_toe_cap",
      },
    );
    b.sweep(
      [
        [s * 0.15 - 0.065, 0.166, 0.137],
        [s * 0.15, 0.155, 0.186],
        [s * 0.15 + 0.065, 0.166, 0.137],
      ],
      0.0038,
      {
        color: gold,
        bone: chain.tip!,
        sides: 5,
        name: "boot_toe_cap_gilt_edge",
      },
    );
    b.rod(
      [s * 0.15, 0.157, 0.184],
      [s * 0.15, 0.126, 0.245],
      0.003,
      { color: gold, bone: chain.tip!, sides: 5, name: "toe_leaf_midvein" },
    );

    leafPlate(
      [s * 0.146, 0.552, 0.097],
      1.0,
      0.67,
      chain.joints[1],
      C.deep,
      "leaf_knee_guard",
    );
    b.sweep(
      [
        [s * 0.148, 0.501, 0.096],
        [s * 0.152, 0.375, 0.099],
        [s * 0.151, 0.232, 0.090],
      ],
      [0.010, 0.006],
      { color: C.gold, bone: chain.joints[1], sides: 5, name: "boot_front_spine" },
    );

    for (let i = 0; i < 5; i++) {
      const y = 0.459 - i * 0.044;
      b.rod(
        [s * 0.151 - 0.028, y + 0.007, 0.093],
        [s * 0.151 + 0.028, y - 0.007, 0.093],
        0.003,
        { color: C.ivory, bone: chain.joints[1], sides: 5, name: "boot_cross_lacing" },
      );
    }
    box(
      [s * 0.19, 0.269, 0.061],
      [0.027, 0.032, 0.013],
      gold,
      chain.joints[1],
      "ankle_strap_buckle",
    );
  }

  // Seven pointed tassets form a readable leaf-shaped skirt.
  for (let i = -3; i <= 3; i++) {
    const angle = i * 0.42;
    const x = Math.sin(angle) * 0.188;
    const z = Math.cos(angle) * 0.135;
    const length = 0.222 + (i === 0 ? 0.029 : 0) - Math.abs(i) * 0.012;
    const outline: OutlinePoint[] = [
      [-0.043, 0.010],
      [0.043, 0.010],
      [0.054, -length * 0.64],
      [0, -length, "sharp"],
      [-0.054, -length * 0.64],
    ];
    b.extrude(outline, {
      at: [x, 0.972, z],
      x: [Math.cos(angle), 0, -Math.sin(angle)],
      y: [0, 1, 0],
      thickness: 0.021,
      color: i % 2 ? C.forest : cloth,
      bone: hips,
      name: "pointed_tunic_tasset",
    });
    const border = outline.map((p) => [
      x + p[0] * Math.cos(angle) + Math.sin(angle) * 0.014,
      0.972 + p[1],
      z - p[0] * Math.sin(angle) + Math.cos(angle) * 0.014,
    ]);
    b.sweep(polyline(border, { closed: true }), 0.0035, {
      color: gold,
      bone: hips,
      sides: 5,
      name: "tasset_gold_edge",
    });
    drawing(
      [x + Math.sin(angle) * 0.016, 0.875, z + Math.cos(angle) * 0.016],
      0.051,
      0.100,
      leafEmblem,
      hips,
      [Math.sin(angle), 0, Math.cos(angle)],
      "tasset_leaf_embroidery",
    );
  }

  const beltSurface = b.surface(torso);
  b.sweep(beltSurface.loop([0, 1.035, 0], { dir: [0, 1, 0], lift: 0.014 }), 0.025, {
    color: leather,
    bone: hips,
    sides: 8,
    name: "broad_ranger_belt",
  });
  for (const y of [1.014, 1.057]) {
    b.sweep(beltSurface.loop([0, y, 0], { dir: [0, 1, 0], lift: 0.024 }), 0.0035, {
      color: gold,
      bone: hips,
      sides: 5,
      name: "belt_edge_stitch",
    });
  }
  box([0, 1.036, 0.165], [0.071, 0.061, 0.020], gold, hips, "belt_buckle_frame");
  box([0, 1.036, 0.177], [0.049, 0.041, 0.006], C.deep, hips, "belt_buckle_inset");
  glow(
    b.part(new THREE.OctahedronGeometry(0.020), C.jewel, {
      at: [0, 1.036, 0.183],
      scale: [0.85, 0.9, 0.4],
      bone: hips,
      name: "belt_moonstone",
    }),
    0.5,
  );

  const strapPath = beltSurface.drape(
    [
      [-0.183, 1.365, 0.064],
      [-0.131, 1.272, 0.124],
      [-0.056, 1.165, 0.124],
      [0.063, 1.085, 0.121],
      [0.145, 1.032, 0.063],
    ],
    { lift: 0.036 },
  );
  b.sweep(strapPath, () => [0.021, 0.006], {
    section: "box",
    color: leather,
    bone: spine,
    caps: "flat",
    name: "diagonal_quiver_bandolier",
  });
  b.along(strapPath, 10, (at) => {
    b.stick(new THREE.SphereGeometry(0.005, 6, 4), gold, at, {
      embed: 0,
      name: "bandolier_stitch_stud",
    });
  });
  box([-0.10, 1.235, 0.161], [0.036, 0.043, 0.016], gold, chest, "bandolier_slide", [0, 0, -30]);
  box([-0.10, 1.235, 0.172], [0.022, 0.027, 0.007], C.leatherDark, chest, "bandolier_slide_opening", [0, 0, -30]);

  // Belt accessories: stitched map pouch and a small sheathed ranger's knife.
  box([-0.229, 0.933, 0.003], [0.105, 0.139, 0.071], leather, hips, "map_pouch");
  box([-0.229, 0.989, 0.048], [0.111, 0.061, 0.016], C.leatherDark, hips, "pouch_foldover_flap");
  drawing([-0.229, 0.933, 0.040], 0.074, 0.043, runeTexture, hips);
  stud([-0.229, 0.971, 0.063], hips, 0.012);
  for (const s of [1, -1]) {
    b.rod(
      [-0.229 + s * 0.046, 0.990, 0.043],
      [-0.229 + s * 0.046, 0.877, 0.043],
      0.0025,
      { color: C.gold, bone: hips, sides: 5, name: "pouch_edge_stitching" },
    );
  }
  const foldedMap = box(
    [-0.242, 1.010, -0.003],
    [0.073, 0.083, 0.014],
    C.ivory,
    hips,
    "map_peeking_from_pouch",
    [0, 0, 9],
  );
  drawing([-0.242, 1.018, 0.006], 0.070, 0.072, mapTexture, hips, [0, 0, 1], "drawn_trail_map");
  foldedMap.mesh.name = "folded_trail_map";

  b.sweep(
    [[0.228, 1.023, 0.013], [0.271, 0.852, -0.006], [0.284, 0.755, -0.009]],
    (t) => [0.025 * (1 - t * 0.58), 0.017 * (1 - t * 0.52)],
    {
      section: "box",
      color: C.deep,
      bone: hips,
      caps: "point",
      name: "knife_sheath",
    },
  );
  b.rod([0.232, 1.016, 0.015], [0.213, 1.098, 0.022], 0.013, {
    color: leather,
    bone: hips,
    sides: 8,
    name: "knife_wrapped_handle",
  });
  b.rod([0.194, 1.017, 0.019], [0.264, 1.032, 0.019], 0.008, {
    color: gold,
    bone: hips,
    sides: 6,
    name: "knife_leaf_crossguard",
  });
  ellipsoid([0.211, 1.105, 0.023], [0.017, 0.012, 0.014], gold, hips, "knife_pommel", 8);
  tassel([0.264, 0.965, 0.010], hips, 0.095);

  // Split travelling cloak, including broad pleats and stitched ivy at the hem.
  for (const { s, joint } of cloakJoints) {
    const inside = [
      [0, 1.363, -0.137],
      [s * 0.045, 1.160, -0.195],
      [s * 0.060, 0.795, -0.278],
    ];
    const outside = [
      [s * 0.210, 1.345, -0.079],
      [s * 0.335, 1.137, -0.205],
      [s * 0.426, 0.751, -0.288],
    ];
    const cloakPanel = b.membrane(inside, outside, {
      color: cloakPaint,
      thickness: 0.014,
      rows: 4,
      cols: 7,
      bone: joint,
      name: "split_woodland_cloak",
    });
    b.decal(cloakPanel, embroidery, {
      at: [s * 0.240, 0.856, -0.28],
      dir: [0, 0, 1],
      size: [0.290, 0.112],
      lift: 0.002,
      segments: 12,
      bone: joint,
      mirror: s < 0,
      name: "front_cloak_ivy_embroidery",
    });

    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const topX = s * (0.04 + t * 0.15);
      const bottomX = s * (0.065 + t * 0.35);
      b.sweep(
        [
          [topX, 1.340, -0.103 - t * 0.018],
          [s * (0.04 + t * 0.27), 1.10, -0.232],
          [bottomX, 0.792 - t * 0.044, -0.299],
        ],
        [0.009, 0.014],
        {
          color: i % 2 ? "#32624f" : "#214c43",
          bone: joint,
          sides: 5,
          caps: "flat",
          name: "broad_cloak_fold",
        },
      );
    }

    b.sweep(catmull(outside), 0.005, {
      color: gold,
      bone: joint,
      sides: 5,
      name: "cloak_outer_gilt_binding",
    });
    b.sweep(
      [
        [s * 0.060, 0.795, -0.290],
        [s * 0.205, 0.767, -0.301],
        [s * 0.426, 0.751, -0.299],
      ],
      0.006,
      { color: gold, bone: joint, sides: 6, name: "cloak_hem_binding" },
    );
    b.decal(cloakPanel, embroidery, {
      at: [s * 0.240, 0.856, -0.29],
      dir: [0, 0, -1],
      size: [0.290, 0.112],
      lift: 0.003,
      segments: 12,
      bone: joint,
      mirror: s > 0,
      name: "back_cloak_ivy_embroidery",
    });
    tassel([s * 0.427, 0.756, -0.29], joint, 0.065);
  }

  b.sweep(
    catmull([
      [-0.222, 1.363, -0.054],
      [-0.147, 1.414, -0.109],
      [0, 1.435, -0.135],
      [0.147, 1.414, -0.109],
      [0.222, 1.363, -0.054],
    ]),
    0.042,
    {
      color: cloth,
      bone: chest,
      sides: 8,
      caps: "round",
      name: "lowered_hood_roll",
    },
  );
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.194, 1.372, 0.075],
        [s * 0.124, 1.345, 0.136],
        [s * 0.056, 1.369, 0.140],
      ),
      0.0038,
      { color: gold, bone: chest, sides: 6, name: "cloak_clasp_chain" },
    );
    ellipsoid([s * 0.191, 1.373, 0.085], [0.025, 0.023, 0.010], gold, chest, "cloak_leaf_clasp", 10);
  }

  // A real, open-topped quiver sits behind the right shoulder.
  const q = b.region({
    at: quiverBone.at,
    quat: quiverBone.quat,
    bone: quiverBone,
  });
  b.lathe(
    [
      [0, 0],
      [0.048, 0],
      [0.059, 0.021],
      [0.067, 0.328],
      [0.070, 0.354],
      [0.058, 0.354],
      [0.054, 0.044],
      [0, 0.044],
    ],
    {
      at: q.p([0, 0, 0]),
      axis: quiverBone.axis,
      segments: 10,
      color: leather,
      bone: quiverBone,
      name: "open_leather_quiver",
    },
  );
  for (const y of [0.027, 0.294, 0.347]) {
    b.part(new THREE.CylinderGeometry(0.070, 0.070, 0.019, 10, 1, true), gold, {
      at: q.p([0, y, 0]),
      dir: quiverBone.axis,
      bone: quiverBone,
      name: "quiver_gilt_band",
    });
  }
  drawing(q.p([0, 0.174, 0.063]), 0.063, 0.094, leafEmblem, quiverBone, q.d([0, 0, 1]), "quiver_leaf_badge");

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const x = Math.sin(a) * 0.028;
    const z = Math.cos(a) * 0.028;
    const top = 0.505 + (i % 3) * 0.037;
    b.rod(q.p([x, 0.15, z]), q.p([x, top, z]), 0.0038, {
      color: C.shaft,
      bone: quiverBone,
      sides: 6,
      name: "quiver_arrow_shaft",
    });
    b.rod(q.p([x, top - 0.002, z]), q.p([x, top + 0.018, z]), 0.0048, {
      color: gold,
      bone: quiverBone,
      sides: 5,
      name: "arrow_nock",
    });
    for (let j = 0; j < 2; j++) {
      const theta = j * Math.PI / 2 + a;
      b.cards(
        [
          frame(q.p([x, top - 0.116, z]), quiverBone.axis, q.d([Math.sin(theta), 0, Math.cos(theta)])),
        ],
        featherTexture,
        {
          size: [0.037, 0.099],
          flow: q.d([Math.sin(theta), 0, Math.cos(theta)]),
          lean: 0,
          sink: 0,
          bone: quiverBone,
        },
      );
    }
    b.rod(q.p([x, top - 0.130, z]), q.p([x, top - 0.109, z]), 0.006, {
      color: C.deep,
      bone: quiverBone,
      sides: 6,
      name: "arrow_fletching_binding",
    });
  }

  // Ornate recurve bow, on the outer hand: its silhouette never crosses the face.
  const bowPoints = [
    [0.892, 0.525, 0.083],
    [0.943, 0.475, 0.083],
    [1.080, 0.632, 0.083],
    [1.087, 0.878, 0.083],
    [0.936, 1.150, 0.083],
    [1.088, 1.426, 0.083],
    [1.090, 1.710, 0.083],
    [0.947, 1.893, 0.083],
    [0.897, 1.840, 0.083],
  ];
  const bowPath = catmull(bowPoints);
  const bow = b.sweep(
    bowPath,
    (t) => [0.013 + Math.sin(Math.PI * t) * 0.010, 0.015],
    {
      color: bowWood,
      bone: bowBone,
      sides: 8,
      caps: "flat",
      name: "living_wood_recurve_bow",
    },
  );

  b.sweep(bow.line(90, 0.002), 0.0034, {
    color: gold,
    bone: bowBone,
    sides: 5,
    name: "bow_long_gilt_inlay",
  });
  b.sweep(bow.line(-90, 0.002), 0.0034, {
    color: C.deep,
    bone: bowBone,
    sides: 5,
    name: "bow_dark_edge_lamination",
  });
  b.rod([0.892, 0.525, 0.083], [0.897, 1.840, 0.083], 0.0018, {
    color: "#eee2bc",
    bone: bowBone,
    sides: 5,
    name: "taut_bowstring",
  });

  b.rod([0.936, 1.085, 0.083], [0.936, 1.220, 0.083], 0.024, {
    color: C.leatherDark,
    bone: bowBone,
    sides: 8,
    name: "bow_leather_grip",
  });
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.CylinderGeometry(0.0255, 0.0255, 0.004, 8), i % 2 ? C.leather : C.gold, {
      at: [0.936, 1.093 + i * 0.016, 0.083],
      bone: bowBone,
      name: "bow_grip_wrap",
    });
  }

  for (const t of [0.075, 0.18, 0.32, 0.68, 0.82, 0.93]) {
    const line = bowPath.at(t);
    b.ring(
      frame(line, bowPath.tangentAt(t)),
      { count: 8, radius: 0.023 },
      (item) => {
        const seated = b.surface(bow).nearest(item.at);
        b.stick(new THREE.SphereGeometry(0.0045, 6, 4), gold, seated, {
          embed: 0.40,
          bone: bowBone,
          name: "bow_binding_bead",
        });
      },
    );
  }

  for (const y of [0.672, 1.700]) {
    leafPlate([1.091, y, 0.107], 0.56, 0.65, bowBone, C.deep, "bow_tip_leaf_mount");
    glow(
      b.part(new THREE.OctahedronGeometry(0.022), C.jewel, {
        at: [1.091, y, 0.130],
        scale: [0.62, 1.4, 0.48],
        bone: bowBone,
        name: "bow_tip_moonstone",
      }),
      0.8,
    );
  }
  drawing([1.058, 1.423, 0.109], 0.042, 0.101, leafEmblem, bowBone, [0, 0, 1], "bow_upper_rune_leaf");
  drawing([1.058, 0.887, 0.109], 0.042, 0.101, leafEmblem, bowBone, [0, 0, 1], "bow_lower_rune_leaf");
  b.rod([0.851, 1.145, 0.083], [0.936, 1.145, 0.083], 0.012, {
    color: C.leatherDark,
    bone: bowBone,
    sides: 6,
    name: "bow_hand_grip_bridge",
  });
  tassel([0.971, 1.097, 0.091], bowBone, 0.100);

  // A small woodland stage, grounded at y=0. The feet rest on its 8 cm top.
  b.part(new THREE.CylinderGeometry(1.14, 1.16, 0.076, 32), groundPaint, {
    at: [0.02, 0.038, 0],
    scale: [1.035, 1, 0.46],
    bone: hips,
    name: "oval_mossy_woodland_base",
  });
  b.part(new THREE.CylinderGeometry(1.16, 1.16, 0.018, 32), C.stoneDark, {
    at: [0.02, 0.011, 0],
    scale: [1.035, 1, 0.46],
    bone: hips,
    name: "dark_base_plinth",
  });

  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    const x = 0.02 + Math.cos(a) * 1.076;
    const z = Math.sin(a) * 0.457;
    const w = 0.105 + random() * 0.055;
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, 0.066, z],
      scale: [w, 0.044 + random() * 0.018, 0.072],
      rotation: [0, (-a * 180) / Math.PI, 0],
      bone: hips,
      name: "perimeter_waystone",
    });
  }

  for (let i = 0; i < 9; i++) {
    const x = -0.72 + random() * 1.41;
    const z = -0.37 + random() * 0.57;
    if (Math.abs(x) < 0.26 && z > -0.13) continue;
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, 0.083, z],
      scale: [0.057 + random() * 0.04, 0.026, 0.038 + random() * 0.029],
      rotation: [0, random() * 180, 0],
      bone: hips,
      name: "forest_scattered_pebble",
    });
  }

  const waystone = b.extrude(
    [
      [-0.095, 0],
      [0.098, 0],
      [0.088, 0.225],
      [0.035, 0.309],
      [-0.058, 0.286],
      [-0.100, 0.191],
    ],
    {
      at: [-0.737, 0.075, -0.270],
      x: [1, 0, 0],
      thickness: 0.102,
      bevel: 0.008,
      color: stonePaint,
      bone: hips,
      name: "ancient_trail_waystone",
    },
  );
  glow(
    drawing(
      [-0.737, 0.231, -0.214],
      0.104,
      0.173,
      waystoneTexture,
      hips,
      [0, 0, 1],
      "carved_elven_waymarker",
    ),
    0.40,
  );
  b.sweep(
    [[-0.800, 0.209, -0.216], [-0.764, 0.233, -0.216], [-0.769, 0.280, -0.216]],
    0.0025,
    { color: C.stoneDark, bone: hips, sides: 5, name: "waystone_surface_crack" },
  );
  b.stick(
    new THREE.DodecahedronGeometry(0.055, 0),
    C.moss,
    b.surface(waystone).nearest([-0.795, 0.101, -0.231]),
    { scale: [1, 0.25, 0.7], name: "waystone_moss" },
  );

  function fern(at: number[], s: number, height: number) {
    const stem = [
      at,
      [at[0] + s * 0.026, at[1] + height * 0.52, at[2] - 0.016],
      [at[0] + s * 0.073, at[1] + height, at[2] - 0.035],
    ];
    b.sweep(catmull(stem), [0.003, 0.001], {
      color: C.moss,
      bone: hips,
      sides: 5,
      name: "fern_stem",
    });
    for (let i = 0; i < 4; i++) {
      const y = at[1] + height * (0.19 + i * 0.18);
      const centerX = at[0] + s * 0.058 * (i / 4);
      const width = 0.063 * (1 - i * 0.17);
      for (const side of [1, -1]) {
        b.slab(
          [
            [centerX, y, at[2] - 0.009],
            [centerX + side * width * 0.58, y + 0.017, at[2] - 0.018],
            [centerX + side * width, y + 0.043, at[2] - 0.027],
            [centerX + side * width * 0.61, y + 0.003, at[2] - 0.023],
          ],
          {
            thickness: 0.003,
            color: i % 2 ? "#809c55" : "#4d7d55",
            bone: hips,
            name: "broad_fern_leaflet",
          },
        );
      }
    }
  }
  fern([-0.83, 0.082, -0.25], -1, 0.20);
  fern([-0.87, 0.082, -0.22], 1, 0.13);
  fern([-0.80, 0.082, -0.27], 1, 0.16);
  fern([0.60, 0.082, -0.31], 1, 0.18);
  fern([0.63, 0.082, -0.28], -1, 0.13);
  fern([0.82, 0.082, 0.12], 1, 0.13);
  fern([0.84, 0.082, 0.09], -1, 0.095);

  for (const at of [[-0.54, 0.08, -0.37], [0.43, 0.08, -0.43]]) {
    b.rod(at, [at[0], at[1] + 0.065, at[2]], 0.012, {
      color: C.ivory,
      bone: hips,
      sides: 6,
      name: "tiny_forest_mushroom_stalk",
    });
    b.lathe(
      [[0, 0], [0.043, 0], [0.037, 0.021], [0.018, 0.031], [0, 0.030]],
      {
        at: [at[0], at[1] + 0.054, at[2]],
        color: "#b67750",
        bone: hips,
        segments: 8,
        name: "small_mushroom_cap",
      },
    );
  }

  return b.root;
}

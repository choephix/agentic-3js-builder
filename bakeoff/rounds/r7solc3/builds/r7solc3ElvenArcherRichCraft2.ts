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
    "A silver-haired elven ranger with sharp amber eyes, layered emerald leaf armour, an embroidered travelling cloak, and a luminous recurve bow. Rig-ready primitive-built high-fantasy anime character on a woodland waystone stage.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Aelwyn_Verdant_Moon",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(8217);

  const C = {
    ink: "#233333",
    deep: "#123e3b",
    forest: "#236852",
    green: "#39876a",
    jade: "#77baa0",
    mint: "#b3e8ce",
    ivory: "#eee6ca",
    gold: "#cda651",
    goldLight: "#f4d990",
    leatherDark: "#46332c",
    hair: "#e9ecdb",
    hairShade: "#9bb8ac",
    hairLight: "#fff7df",
    stoneDark: "#2c4241",
    moss: "#728b48",
    shaft: "#aa794f",
    jewel: "#76f1cf",
    steel: "#c1d3cf",
  };

  const skin = paint((_p, n) =>
    mix(
      "#dcaa96",
      "#ffe0c2",
      Math.max(0.25, Math.min(1, 0.78 + n.y * 0.14 + n.z * 0.08)),
    ),
  );
  const cloth = paint((p, n) =>
    mix(
      "#153d39",
      "#388668",
      Math.min(
        0.95,
        0.48 +
          n.y * 0.18 +
          n.z * 0.09 +
          noise(p, 0.075, 22) * 0.15 +
          Math.sin(p.y * 700) * Math.sin(p.x * 720) * 0.018,
      ),
    ),
  );
  const cloakPaint = paint((p, n) =>
    mix(
      "#193e3d",
      "#39735e",
      Math.min(0.9, 0.30 + n.y * 0.16 + noise(p, 0.14, 4) * 0.29),
    ),
  );
  const paleCloth = paint((p, n) =>
    mix(
      "#b9c4ad",
      "#f0e7cc",
      Math.max(
        0.2,
        Math.min(
          0.94,
          0.72 + n.y * 0.12 + Math.sin(p.y * 770) * Math.sin(p.z * 800) * 0.02,
        ),
      ),
    ),
  );
  const trouserCloth = paint((p, n) =>
    mix(
      "#64796b",
      "#a4b69a",
      Math.min(0.91, 0.61 + n.y * 0.13 + noise(p, 0.04, 61) * 0.10),
    ),
  );
  const leather = paint((p, n) =>
    mix(
      "#3b302c",
      "#866047",
      Math.max(
        0.17,
        Math.min(
          0.91,
          0.46 + n.y * 0.18 + noise(p, 0.14, 15) * 0.18 + noise(p, 0.007, 16) * 0.025,
        ),
      ),
    ),
  );
  const gold = paint((p, n) =>
    mix(
      "#99783d",
      C.goldLight,
      Math.min(1, 0.49 + 0.34 * Math.max(0, n.y) + noise(p, 0.028, 7) * 0.15),
    ),
  );
  const hairPaint = paint((p, n) =>
    mix(
      mix(C.hairShade, C.hairLight, 0.65 + n.y * 0.16 + noise(p, 0.028, 43) * 0.12),
      "#85baa3",
      Math.max(0, Math.min(0.38, (1.39 - p.y) * 0.95)),
    ),
  );
  const woodGrain = grain("#536044", "#849067", {
    size: 0.021,
    axis: "y",
    seed: 32,
  });
  const bowWood = paint((p, n) =>
    mix(woodGrain.at(p, n), "#6b7951", 0.52),
  );
  const stonePaint = mottle("#3c5150", "#73817a", {
    size: 0.095,
    contrast: 1.2,
    seed: 33,
  });
  const groundPaint = paint((p, n) =>
    n.y > 0.45
      ? mix("#30483c", "#65734b", noise(p, 0.18, 77))
      : mix("#263b39", "#52635b", noise(p, 0.12, 79)),
  );

  function texture(body: string, viewBox: string, size = 384) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`,
      { size },
    );
  }

  const eyes = texture(
    `
    <defs>
      <clipPath id="e"><path d="M9 54 Q37 24 82 36 L94 49 Q71 85 40 80 Q18 76 9 54Z"/></clipPath>
      <linearGradient id="i" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#734228"/>
        <stop offset=".52" stop-color="#c98a32"/>
        <stop offset="1" stop-color="#ffe88d"/>
      </linearGradient>
    </defs>
    <path d="M5 52 Q34 20 82 33 L98 47 Q76 88 39 84 Q16 80 5 52Z" fill="#243732"/>
    <g clip-path="url(#e)">
      <rect width="100" height="110" fill="#fff8df"/>
      <ellipse cx="55" cy="55" rx="24" ry="30" fill="url(#i)"/>
      <path d="M33 66 Q53 75 79 65 L75 85 H34Z" fill="#f2cf63"/>
      <ellipse cx="56" cy="54" rx="10" ry="21" fill="#253730"/>
      <path d="M37 77 L42 69 M49 80 L50 70 M63 80 L62 70 M73 73 L68 67"
        fill="none" stroke="#fff0b0" stroke-width="2.5"/>
      <ellipse cx="43" cy="41" rx="8.5" ry="10" fill="#fffef5"/>
      <circle cx="68" cy="69" r="4.3" fill="#ffffff"/>
      <circle cx="73" cy="57" r="2.4" fill="#ffffff"/>
    </g>
    <path d="M5 52 Q35 20 83 34 L98 47" fill="none" stroke="#243732" stroke-width="6" stroke-linecap="round"/>
    <path d="M11 46 L1 31 L6 50 M18 39 L11 26" fill="#243732"/>
    <path d="M19 81 Q28 86 37 84" fill="none" stroke="#bd806d" stroke-width="3"/>
    `,
    "0 0 100 110",
    512,
  );

  const mouth = texture(
    `<path d="M13 19 Q69 38 126 16 Q82 44 36 32Z" fill="#b8756d"/>
     <path d="M13 19 Q71 36 126 16" fill="none" stroke="#805347" stroke-width="4.5" stroke-linecap="round"/>
     <path d="M48 32 Q72 37 94 29" fill="none" stroke="#ffdbc4" stroke-width="3.5"/>`,
    "0 0 140 46",
    256,
  );

  const cheek = texture(
    `<path d="M18 24 L22 13 M32 26 L36 15 M46 25 L50 14"
      fill="none" stroke="#d49883" stroke-width="3.7" stroke-linecap="round"/>
     <circle cx="64" cy="16" r="2.6" fill="#bc8971"/>
     <circle cx="73" cy="22" r="2.2" fill="#bc8971"/>`,
    "0 0 90 38",
    256,
  );

  const leafEmblem = texture(
    `<path d="M60 9 C114 41 105 91 60 141 C15 91 6 41 60 9Z"
      fill="#153d37" stroke="#d7b564" stroke-width="6"/>
     <path d="M75 26 C103 57 94 102 58 122 C77 88 79 52 75 26Z" fill="#e8ce83"/>
     <path d="M61 27 L61 138 M60 54 L35 39 M60 73 L32 58 M59 93 L38 76 M60 110 L43 95"
      fill="none" stroke="#d8b970" stroke-width="4" stroke-linecap="round"/>
     <path d="M60 4 L65 13 L60 21 L55 13Z M60 142 L65 150 L60 158 L55 150Z" fill="#b3e8ce"/>`,
    "0 0 120 160",
  );

  const embroidery = texture(
    `<path d="M0 95 H300 M0 103 H300" stroke="#d5b76c" stroke-width="4"/>
     <path d="M-10 76 Q20 32 50 72 T110 72 T170 72 T230 72 T290 72 T350 72"
      fill="none" stroke="#ddc380" stroke-width="5"/>
     ${[20, 80, 140, 200, 260]
       .map(
         (x) => `<path d="M${x} 74 Q${x - 27} 45 ${x - 8} 28 Q${x + 7} 39 ${x} 74Z"
          fill="#86baa0" stroke="#e4ca87" stroke-width="3"/>
          <path d="M${x + 16} 68 Q${x + 40} 37 ${x + 45} 53 Q${x + 44} 70 ${x + 16} 68Z"
          fill="#86baa0" stroke="#e4ca87" stroke-width="3"/>`,
       )
       .join("")}`,
    "0 0 300 110",
    512,
  );

  const runes = texture(
    `<path d="M5 7 H195 M5 57 H195" stroke="#d8bf7b" stroke-width="3"/>
     <g fill="none" stroke="#e7cc85" stroke-width="4">
      <path d="M20 43 V20 L31 12 L42 20 V43 M20 31 H42"/>
      <path d="M61 13 V44 L80 33 L61 22 M89 13 V44"/>
      <path d="M110 43 V13 L127 29 L110 43 M137 13 V43 L150 31"/>
      <path d="M170 13 V43 M157 22 L170 13 L184 22"/>
     </g>`,
    "0 0 200 65",
  );

  const mapTexture = texture(
    `<rect width="180" height="120" rx="5" fill="#e8d8aa"/>
     <path d="M9 9 H171 V111 H9Z" fill="none" stroke="#856e44" stroke-width="3"/>
     <path d="M14 86 Q45 48 66 68 T112 42 T165 25 M22 25 Q61 37 85 18
       M95 93 Q129 64 160 91" fill="none" stroke="#72846a" stroke-width="4"/>
     <path d="M42 34 L54 17 L66 34 M52 36 L69 13 L83 36 M106 82 L119 60 L136 83"
       fill="none" stroke="#826c49" stroke-width="3"/>
     <path d="M35 97 Q67 98 82 74 Q91 58 120 56" fill="none" stroke="#ad5d42" stroke-width="3" stroke-dasharray="4 5"/>
     <path d="M117 49 L129 61 M129 49 L117 61" stroke="#ad5d42" stroke-width="4"/>`,
    "0 0 180 120",
  );

  const waystoneTexture = texture(
    `<path d="M60 10 L91 40 L60 70 L29 40Z M60 24 V122 M35 83 L60 101 L85 83
      M35 106 L60 124 L85 106" fill="none" stroke="#8fbb9d" stroke-width="7"/>
     <circle cx="60" cy="40" r="6" fill="#d6ecc5"/>`,
    "0 0 120 140",
    256,
  );

  const featherDrawing = texture(
    `<path d="M30 156 L8 128 L12 77 L24 9 L32 3 L48 26 L53 88 L47 131Z"
      fill="#d7ead7" stroke="#547d67" stroke-width="3"/>
     <path d="M31 7 L28 151 M30 42 L45 29 M30 66 L49 48 M29 88 L49 67
       M29 111 L47 91 M29 130 L45 113 M30 61 L16 44 M29 89 L13 65 M29 112 L12 89"
      fill="none" stroke="#94b59a" stroke-width="3"/>
     <path d="M10 116 L28 140 L48 117 L47 132 L30 156 L9 130Z" fill="#34765b"/>`,
    "0 0 60 160",
    256,
  );

  // Rig first; the neutral A-pose leaves every limb and digit readable.
  const hips = b.joint("hips", {
    at: [0, 0.96, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.96, 0], [0, 1.15, 0], [0, 1.36, 0]],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    [[0, 1.36, 0], [0, 1.445, 0], [0, 1.51, 0.01]],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.556, 0.012],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.55, 0.016],
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

  const fingers = arms.flatMap(({ s, side, chain }) => {
    const names = ["index", "middle", "ring", "little"];
    const result = names.map((name, i) => {
      const z = 0.071 - i * 0.038;
      const reach = [0.109, 0.122, 0.110, 0.089][i];
      const path =
        s > 0
          ? [
              [0.817, 1.141 - i * 0.025, z],
              [0.874 + (i === 3 ? -0.012 : 0), 1.144 - i * 0.025, z + 0.037],
              [0.885 + (i === 3 ? -0.012 : 0), 1.123 - i * 0.025, z + 0.008],
            ]
          : [
              [s * 0.817, 1.122 - i * 0.004, z],
              [s * (0.817 + reach * 0.52), 1.107 - i * 0.011, z + (1.5 - i) * 0.008],
              [s * (0.817 + reach), 1.10 - i * 0.015, z + (1.5 - i) * 0.013],
            ];
      return {
        thumb: false,
        chain: b.chain(`${name}${side}`, path, {
          parent: chain.tip!,
          names: [`${name}${side}1`, `${name}${side}2`, `${name}${side}Tip`],
          role: "digit",
        }),
      };
    });
    result.push({
      thumb: true,
      chain: b.chain(
        `thumb${side}`,
        s > 0
          ? [[0.782, 1.145, 0.060], [0.830, 1.17, 0.103], [0.875, 1.175, 0.090]]
          : [[-0.782, 1.145, 0.060], [-0.811, 1.17, 0.105], [-0.854, 1.171, 0.137]],
        {
          parent: chain.tip!,
          names: [`thumb${side}1`, `thumb${side}2`, `thumb${side}Tip`],
          role: "digit",
        },
      ),
    });
    return result;
  });

  const hairChain = b.chain(
    "hairBack",
    [[0, 1.72, -0.075], [0, 1.50, -0.145], [0, 1.27, -0.20], [0, 1.055, -0.18]],
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
    at: [0.876, 1.145, 0.083],
    dir: [0, 1, 0],
  });
  const quiverBone = b.joint("quiver", {
    parent: chest,
    at: [-0.247, 1.025, -0.175],
    dir: [-0.16, 0.985, -0.075],
  });

  function ellipsoid(
    at: PointInput,
    scale: number[],
    color: ColorInput,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, scale, bone, name,
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
      at, bone, name, rotation,
    });
  }

  function drawing(
    at: PointInput,
    width: number,
    height: number,
    tex: THREE.Texture,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
    name = "embroidered_detail",
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir,
      axis: "z",
      up: [0, 1, 0],
      texture: tex,
      bone,
      name,
    });
  }

  function stud(at: PointInput, bone: Joint, radius = 0.007) {
    return ellipsoid(at, [radius, radius, radius * 0.7], gold, bone, "gilt_rivet", 8);
  }

  function jewel(at: PointInput, size: number, bone: Joint, name: string) {
    return glow(
      b.part(new THREE.OctahedronGeometry(size), C.jewel, {
        at,
        scale: [0.66, 1.26, 0.5],
        bone,
        name,
      }),
      0.65,
    );
  }

  function tassel(at: number[], bone: Joint, length = 0.075) {
    ellipsoid(at, [0.011, 0.014, 0.011], gold, bone, "tassel_cap", 8);
    for (let i = 0; i < 4; i++) {
      b.rod(
        [at[0] + (i - 1.5) * 0.006, at[1] - 0.009, at[2]],
        [at[0] + (i - 1.5) * 0.008, at[1] - length, at[2] + 0.003],
        [0.0033, 0.0018],
        { color: i % 2 ? C.gold : C.jade, bone, sides: 5 },
      );
    }
  }

  // Plates use solid nested silhouettes, rather than raised wire outlines.
  const leafOutline: OutlinePoint[] = [
    [0, 0.110, "sharp"],
    [0.060, 0.045],
    [0.048, -0.049],
    [0, -0.112, "sharp"],
    [-0.048, -0.049],
    [-0.060, 0.045],
  ];
  function leafPlate(
    at: number[],
    width: number,
    height: number,
    bone: Joint,
    fill: ColorInput,
    name: string,
    angleDeg = 0,
  ) {
    const a = angleDeg * Math.PI / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const transformed = (inset: number): OutlinePoint[] =>
      leafOutline.map((p) => [
        (p[0] * width * c - p[1] * height * s) * inset,
        (p[0] * width * s + p[1] * height * c) * inset,
      ]);
    b.extrude(transformed(1), {
      at,
      x: [1, 0, 0],
      thickness: 0.023,
      bevel: 0.003,
      color: gold,
      bone,
      name: `${name}_solid_gilt_rim`,
    });
    b.extrude(transformed(0.89), {
      at: [at[0], at[1], at[2] + 0.013],
      x: [1, 0, 0],
      thickness: 0.008,
      color: fill,
      bone,
      name,
    });
    b.rod(
      [at[0] + 0.075 * height * s, at[1] - 0.075 * height * c, at[2] + 0.019],
      [at[0] - 0.078 * height * s, at[1] + 0.078 * height * c, at[2] + 0.019],
      0.0028,
      { color: C.goldLight, bone, sides: 5, name: "leaf_plate_midvein" },
    );
    for (const side of [1, -1]) {
      for (const y of [-0.027, 0.027]) {
        const r = y * height;
        const u = side * 0.034 * width;
        const v = (y + 0.023) * height;
        b.rod(
          [at[0] - r * s, at[1] + r * c, at[2] + 0.019],
          [at[0] + u * c - v * s, at[1] + u * s + v * c, at[2] + 0.019],
          0.0019,
          { color: C.jade, bone, sides: 5, name: "leaf_plate_inlaid_branch" },
        );
      }
    }
  }

  // Larger anime head, shorter neck, more pointed chin.
  const H = 1.13;
  const face = b.region({ at: [0, 1.635, 0.015], scale: H, bone: head });
  const skull = ellipsoid(
    face.p([0, 0.024, -0.007]),
    [face.s(0.124), face.s(0.140), face.s(0.106)],
    skin,
    head,
    "upper_face",
    20,
  );
  const lowerJaw = b.loft(
    [
      { at: face.p([0, -0.033, 0.006]), w: face.s(0.190), h: face.s(0.133) },
      { at: face.p([0, -0.075, 0.010]), w: face.s(0.137), h: face.s(0.104) },
      { at: face.p([0, -0.112, 0.009]), w: face.s(0.068), h: face.s(0.068) },
    ],
    { color: skin, bone: jaw, sides: 10, caps: "round", name: "tapered_lower_jaw" },
  );

  for (const s of [1, -1]) {
    b.decal(skull, eyes, {
      at: face.p([s * 0.056, 0.006, 0.10]),
      dir: [s * 0.14, 0.02, 1],
      size: [face.s(0.096), face.s(0.087)],
      mirror: s > 0,
      lift: 0.0018,
      segments: 10,
      bone: head,
      name: `amber_eye${s > 0 ? "L" : "R"}`,
    });
    const eyebrow = b.surface(skull).drape(
      bezier(
        face.p([s * 0.028, 0.066, 0.093]),
        face.p([s * 0.065, 0.077, 0.087]),
        face.p([s * 0.102, 0.058, 0.071]),
      ),
      { lift: 0.0025 },
    );
    b.sweep(eyebrow, [0.0043, 0.0016], {
      color: "#658272", bone: head, sides: 5, name: "confident_eyebrow",
    });
    b.decal(skull, cheek, {
      at: face.p([s * 0.080, -0.038, 0.083]),
      dir: [s * 0.24, 0, 1],
      size: [0.035, 0.015],
      mirror: s > 0,
      lift: 0.0017,
      segments: 6,
      bone: head,
      name: "subtle_cheek_freckles",
    });

    const ear: OutlinePoint[] = [
      [0, -0.027],
      [0.042, -0.039],
      [0.093, -0.005],
      [0.162, 0.070, "sharp"],
      [0.065, 0.035],
      [0, 0.034],
    ];
    b.extrude(ear, {
      at: face.p([s * 0.108, 0.025, -0.025]),
      x: [s, 0, 0],
      thickness: 0.031,
      bevel: 0.004,
      smoothing: 1,
      color: skin,
      bone: head,
      name: "swept_pointed_elven_ear",
    });
    b.extrude(
      [[0.015, -0.021], [0.041, -0.024], [0.072, 0.005], [0.128, 0.054, "sharp"], [0.049, 0.021], [0.015, 0.020]],
      {
        at: face.p([s * 0.112, 0.027, -0.006]),
        x: [s, 0, 0],
        thickness: 0.004,
        color: "#d7a58d",
        bone: head,
        name: "ear_inner_fold",
      },
    );
    b.part(new THREE.TorusGeometry(0.017, 0.003, 5, 12), gold, {
      at: face.p([s * 0.150, -0.012, 0.002]),
      bone: head,
      name: "gilt_earring",
    });
    b.rod(
      face.p([s * 0.150, -0.028, 0.002]),
      face.p([s * 0.150, -0.048, 0.002]),
      0.0028,
      { color: gold, bone: head, sides: 5 },
    );
    jewel(face.p([s * 0.150, -0.059, 0.002]), 0.012, head, "earring_moonstone");
  }

  b.extrude(
    [[0, 0.008], [0.011, -0.012], [0.019, -0.018], [0.012, -0.025], [0, -0.023]],
    {
      at: face.p([0, -0.011, 0.092]),
      thickness: 0.014,
      color: skin,
      bone: head,
      name: "small_angular_nose",
    },
  );
  ellipsoid(
    face.p([0, -0.029, 0.111]),
    [0.0055, 0.0027, 0.0028],
    "#ffe3c6",
    head,
    "nose_highlight",
    8,
  );
  b.decal(lowerJaw, mouth, {
    at: face.p([0, -0.072, 0.068]),
    dir: [0, 0, 1],
    size: [0.048, 0.014],
    lift: 0.0018,
    bone: jaw,
    segments: 7,
    name: "knowing_half_smile",
  });

  // Solid cap and broad, shaped locks: no stringy fringe or exposed scalp gaps.
  ellipsoid(
    face.p([0, 0.058, -0.054]),
    [face.s(0.137), face.s(0.159), face.s(0.118)],
    hairPaint,
    head,
    "silver_hair_cap",
    16,
  );
  b.sweep(hairChain, (t) => [0.105 * (1 - t * 0.73), 0.047 * (1 - t * 0.70)], {
    color: hairPaint, sides: 8, caps: "point", name: "back_hair_silhouette",
  });
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.030;
    const lock = b.sweep(
      bezier(
        [x, 1.769 - Math.abs(x) * 0.25, -0.095],
        [x * 1.18, 1.43, -0.220],
        [x * 0.73 + Math.sin(i * 1.6) * 0.020, 1.065 + (i % 3) * 0.040, -0.219],
      ),
      (t) => [0.029 * Math.sin(Math.PI * (t * 0.9 + 0.05)), 0.010],
      { color: hairPaint, bone: hairChain, sides: 6, caps: "point", name: "broad_back_hair_lock" },
    );
    b.sweep(lock.line(0, 0.0008).slice(0.13, 0.91), [0.0022, 0.0008], {
      color: C.hairLight, bone: hairChain, sides: 5, name: "back_lock_highlight",
    });
  }

  for (const s of [1, -1]) {
    const bangOutlines: OutlinePoint[][] = [
      [[0.001, 0.185], [0.050, 0.193], [0.085, 0.151], [0.079, 0.089, "sharp"], [0.052, 0.100], [0.022, 0.128]],
      [[0.035, 0.187], [0.085, 0.177], [0.123, 0.123], [0.116, 0.058, "sharp"], [0.086, 0.081], [0.068, 0.132]],
      [[0.083, 0.162], [0.129, 0.137], [0.145, 0.076], [0.129, 0.014, "sharp"], [0.117, 0.069], [0.106, 0.111]],
    ];
    for (let i = 0; i < bangOutlines.length; i++) {
      const at = face.p([0, 0, 0.069 + i * 0.009]);
      const bang = b.extrude(bangOutlines[i], {
        at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.017,
        bevel: 0.003,
        color: hairPaint,
        bone: head,
        name: "solid_swept_anime_bang",
      });
      const end = i === 0 ? [0.069, 0.113] : i === 1 ? [0.107, 0.087] : [0.131, 0.051];
      const outward = s > 0 ? 1 : -1;
      b.sweep(
        bezier(
          bang.local([i === 0 ? 0.025 : i === 1 ? 0.061 : 0.106, 0.167 - i * 0.013, outward * 0.010]),
          bang.local([0.066 + i * 0.026, 0.141 - i * 0.011, outward * 0.010]),
          bang.local([end[0], end[1], outward * 0.010]),
        ),
        [0.0022, 0.0007],
        { color: C.hairLight, bone: head, sides: 5, name: "bang_engraved_highlight" },
      );
    }

    b.sweep(
      bezier(
        face.p([s * 0.116, 0.090, -0.020]),
        face.p([s * 0.140, -0.035, 0.010]),
        face.p([s * 0.122, -0.177, 0.035]),
      ),
      (t) => [0.026 * (1 - t * 0.91), 0.013 * (1 - t * 0.85)],
      { color: hairPaint, bone: head, caps: "point", sides: 6, name: "cheek_framing_lock" },
    );

    const bx = s * 0.119;
    b.sweep(
      [[bx, 1.590, -0.054], [bx * 1.09, 1.45, -0.069], [bx * 1.04, 1.31, -0.065]],
      [0.019, 0.010],
      { color: C.hairShade, bone: head, sides: 6, name: "braid_core" },
    );
    for (let i = 0; i < 7; i++) {
      ellipsoid(
        [bx + s * (i % 2 ? 0.006 : -0.004), 1.574 - i * 0.034, -0.057],
        [0.019, 0.022, 0.014],
        i % 2 ? hairPaint : C.hair,
        head,
        "braided_hair_link",
        8,
      );
    }
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.014, 8), gold, {
      at: [bx, 1.338, -0.062], bone: head, name: "braid_leaf_clasp",
    });
    tassel([bx, 1.326, -0.062], head, 0.047);
  }

  b.sweep(
    catmull([
      face.p([-0.124, 0.074, 0.017]),
      face.p([-0.071, 0.100, 0.092]),
      face.p([0, 0.114, 0.099]),
      face.p([0.071, 0.100, 0.092]),
      face.p([0.124, 0.074, 0.017]),
    ]),
    0.0038,
    { color: gold, bone: head, sides: 6, name: "gilt_forehead_circlet" },
  );
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.026, 0.005], [0.043, 0.030], [0.010, 0.019]], {
      at: face.p([s * 0.016, 0.115, 0.101]),
      x: [s, 0, 0],
      thickness: 0.005,
      color: gold,
      bone: head,
      name: "circlet_leaf",
    });
  }
  jewel(face.p([0, 0.121, 0.107]), 0.014, head, "circlet_moonstone");

  // Fitted body and neck.
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
  b.sweep(neck, [0.063, 0.051], {
    color: skin, sides: 10, name: "neck_skin",
  });
  b.lathe(
    [[0.059, 0], [0.083, 0], [0.079, 0.027], [0.065, 0.081], [0.054, 0.081], [0.054, 0.022]],
    {
      at: [0, 1.373, 0],
      color: C.deep,
      bone: chest,
      segments: 12,
      name: "high_embroidered_ranger_collar",
    },
  );
  for (const band of [{ y: 1.382, r: 0.082 }, { y: 1.451, r: 0.065 }]) {
    b.part(new THREE.TorusGeometry(band.r, 0.003, 5, 16), gold, {
      at: [0, band.y, 0], rotation: [90, 0, 0], bone: chest, name: "collar_gilt_rim",
    });
  }
  drawing([0, 1.418, 0.078], 0.055, 0.026, runes, chest);

  const cuirass: OutlinePoint[] = [
    [-0.141, 0.099], [-0.056, 0.135], [0, 0.109],
    [0.056, 0.135], [0.141, 0.099], [0.147, 0.032],
    [0.098, -0.125], [0, -0.157, "sharp"], [-0.098, -0.125], [-0.147, 0.032],
  ];
  b.extrude(cuirass, {
    at: [0, 1.213, 0.106], x: [1, 0, 0], thickness: 0.044,
    bevel: 0.005, color: gold, bone: chest, name: "cuirass_solid_gilt_border",
  });
  b.extrude(cuirass.map((p) => [p[0] * 0.95, p[1] * 0.96] as OutlinePoint), {
    at: [0, 1.213, 0.132], x: [1, 0, 0], thickness: 0.012,
    bevel: 0.002, color: C.deep, bone: chest, name: "emerald_leaf_cuirass",
  });
  drawing([0.040, 1.246, 0.141], 0.123, 0.169, leafEmblem, chest);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      stud([s * (0.120 - i * 0.008), 1.27 - i * 0.041, 0.143], chest, 0.006);
    }
    b.sweep(
      [[s * 0.082, 1.20, 0.143], [s * 0.069, 1.15, 0.145], [s * 0.045, 1.105, 0.140]],
      0.0025,
      { color: C.jade, bone: chest, sides: 5, name: "cuirass_inlaid_vein" },
    );
  }

  // Continuous arm skin, sleeves, solid layered shoulder leaves.
  for (const { s, side, chain } of arms) {
    b.sweep(chain, [0.064, 0.054, 0.036], {
      color: skin, sides: 8, name: `arm_skin${side}`,
    });
    const sleeve = b.sweep(chain, (t) => 0.070 - t * 0.017, {
      from: 0, to: 0.50, color: paleCloth, sides: 8, caps: "flat", name: `ivory_sleeve${side}`,
    });
    b.sweep(b.surface(sleeve).loop(chain.at(0.46), { lift: 0.003 }), 0.006, {
      color: gold, sides: 6, name: "sleeve_cuff_braid",
    });

    ellipsoid(
      [s * 0.231, 1.365, 0.008],
      [0.082, 0.046, 0.064],
      C.deep,
      chain.joints[0],
      "pauldron_underplate",
      10,
    );
    const n = s > 0 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const origin = [s * (0.205 + i * 0.041), 1.405 - i * 0.019, 0.060];
      const X = [s * 0.95, -0.31, 0];
      const Y = [s * 0.31, 0.95, 0];
      const outline: OutlinePoint[] = [
        [-0.042, 0.003], [0.012, 0.040], [0.061, 0],
        [0.082, -0.049, "sharp"], [0.016, -0.044], [-0.042, -0.021],
      ];
      const outward = s > 0 ? 1 : -1;
      const plate = b.extrude(outline, {
        at: origin, x: X, y: Y, thickness: 0.029,
        bevel: 0.003, color: gold, bone: chain.joints[0],
        name: "pauldron_solid_leaf_rim",
      });
      b.extrude(outline.map((p) => [p[0] * 0.88, p[1] * 0.86] as OutlinePoint), {
        at: [origin[0], origin[1], origin[2] + 0.018],
        x: X, y: Y, thickness: 0.008,
        color: i % 2 ? C.forest : C.green, bone: chain.joints[0],
        name: "overlapping_pauldron_leaf",
      });
      b.rod(
        plate.local([-0.019, 0.002, outward * 0.024]),
        plate.local([0.067, -0.032, outward * 0.024]),
        0.003,
        { color: C.goldLight, bone: chain.joints[0], sides: 5, name: "pauldron_midvein" },
      );
      stud([origin[0], origin[1] - 0.008, origin[2] + 0.027], chain.joints[0], 0.005);
    }

    const bracer = b.sweep(chain, (t) => 0.049 - (t - 0.56) * 0.021, {
      from: 0.56, to: 0.99, color: leather, sides: 8, caps: "flat", name: `bracer${side}`,
    });
    for (const t of [0.60, 0.92]) {
      b.sweep(b.surface(bracer).loop(chain.at(t), { lift: 0.003 }), 0.005, {
        color: gold, sides: 6, name: "bracer_gilt_band",
      });
    }
    leafPlate([s * 0.645, 1.204, 0.060], 0.70, 0.82, chain.joints[1], C.forest, "bracer_leaf", s * 68);
    ellipsoid(
      [s * 0.798, 1.132, 0.013],
      [0.057, 0.030, 0.068],
      leather,
      chain.tip!,
      `fingerless_glove${side}`,
      10,
    );
    box([s * 0.797, 1.145, 0.071], [0.068, 0.024, 0.012], C.deep, chain.tip!, "knuckle_patch");
    for (let i = 0; i < 3; i++) {
      stud([s * (0.775 + i * 0.019), 1.153, 0.079], chain.tip!, 0.004);
    }
  }
  for (const { chain, thumb } of fingers) {
    b.sweep(chain, [thumb ? 0.012 : 0.010, 0.0078], {
      color: skin, sides: 6, name: `finger_${chain.joints[0].name}`,
    });
    b.sweep(chain, [thumb ? 0.013 : 0.011, 0.010], {
      from: 0, to: 0.23, color: leather, sides: 6, caps: "flat", name: "glove_finger_root",
    });
  }

  // Trousers, shaped riding boots and separated planted feet.
  for (const { s, side, chain } of legs) {
    b.sweep(chain, [0.082, 0.067, 0.047], {
      color: trouserCloth, sides: 8, name: `trouser${side}`,
    });
    const boot = b.sweep(chain, (t) => [0.080 - Math.max(0, t - 0.49) * 0.050, 0.071 - Math.max(0, t - 0.49) * 0.038], {
      from: 0.45, to: 1, color: leather, sides: 8, caps: "flat", name: `tapered_high_boot${side}`,
    });
    b.sweep(b.surface(boot).loop(chain.at(0.48), { lift: 0.003 }), 0.010, {
      color: C.deep, sides: 6, name: "boot_folded_cuff",
    });
    b.sweep(b.surface(boot).loop(chain.at(0.49), { lift: 0.012 }), 0.0033, {
      color: gold, sides: 5, name: "boot_cuff_piping",
    });
    b.extrude(
      [[-0.031, 0.008], [0.202, 0.008], [0.240, 0.029, "sharp"], [0.201, 0.061],
       [0.109, 0.086], [0.064, 0.136], [0.057, 0.185], [-0.025, 0.185]],
      {
        at: [s * 0.15, 0.08, 0], x: [0, 0, 1], thickness: 0.127,
        bevel: 0.009, color: leather, bone: chain.tip!, name: `pointed_boot${side}`,
      },
    );
    b.extrude(
      [[-0.034, 0], [0.202, 0], [0.243, 0.021, "sharp"], [0.202, 0.027], [-0.034, 0.021]],
      {
        at: [s * 0.15, 0.08, 0], x: [0, 0, 1], thickness: 0.134,
        bevel: 0.002, color: C.leatherDark, bone: chain.tip!, name: "boot_sole",
      },
    );
    box([s * 0.15, 0.094, -0.005], [0.116, 0.027, 0.058], C.leatherDark, chain.tip!, "boot_heel");
    const toe = [
      [s * 0.15 - 0.059, 0.160, 0.135],
      [s * 0.15 + 0.059, 0.160, 0.135],
      [s * 0.15 + 0.034, 0.143, 0.206],
      [s * 0.15, 0.116, 0.236],
      [s * 0.15 - 0.034, 0.143, 0.206],
    ];
    b.slab(toe, { thickness: 0.008, color: C.deep, bone: chain.tip!, name: "leaf_boot_toe_cap" });
    b.sweep(polyline(toe, { closed: true }), 0.0032, {
      color: gold, bone: chain.tip!, sides: 5, name: "toe_cap_gold_edge",
    });
    b.rod([s * 0.15, 0.163, 0.138], [s * 0.15, 0.123, 0.230], 0.003, {
      color: gold, bone: chain.tip!, sides: 5, name: "toe_midvein",
    });
    leafPlate([s * 0.146, 0.552, 0.096], 0.95, 0.66, chain.joints[1], C.deep, "leaf_knee_guard");
    b.sweep(
      [[s * 0.148, 0.491, 0.098], [s * 0.152, 0.363, 0.087], [s * 0.151, 0.239, 0.074]],
      [0.005, 0.003],
      { color: gold, bone: chain.joints[1], sides: 5, name: "boot_front_inlay" },
    );
    for (let i = 0; i < 4; i++) {
      const y = 0.450 - i * 0.045;
      b.rod([s * 0.15 - 0.025, y + 0.008, 0.093 - i * 0.004], [s * 0.15 + 0.025, y - 0.008, 0.093 - i * 0.004], 0.0025, {
        color: C.ivory, bone: chain.joints[1], sides: 5, name: "boot_cross_lacing",
      });
    }
    box([s * 0.19, 0.267, 0.055], [0.024, 0.027, 0.011], gold, chain.joints[1], "ankle_buckle");
  }

  // Seven overlapping leaf tassets.
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.42;
    const x = Math.sin(a) * 0.185;
    const z = Math.cos(a) * 0.137;
    const length = 0.219 + (i === 0 ? 0.029 : 0) - Math.abs(i) * 0.010;
    const outline: OutlinePoint[] = [
      [-0.043, 0.010], [0.043, 0.010], [0.052, -length * 0.64],
      [0, -length, "sharp"], [-0.052, -length * 0.64],
    ];
    const X = [Math.cos(a), 0, -Math.sin(a)];
    b.extrude(outline, {
      at: [x, 0.973, z], x: X, thickness: 0.019,
      color: gold, bone: hips, name: "tasset_solid_gold_border",
    });
    b.extrude(outline.map((p) => [p[0] * 0.88, p[1] * 0.96] as OutlinePoint), {
      at: [x + Math.sin(a) * 0.012, 0.973, z + Math.cos(a) * 0.012],
      x: X, thickness: 0.005, color: i % 2 ? C.forest : cloth,
      bone: hips, name: "pointed_leaf_tasset",
    });
    drawing(
      [x + Math.sin(a) * 0.017, 0.875, z + Math.cos(a) * 0.017],
      0.048, 0.096, leafEmblem, hips, [Math.sin(a), 0, Math.cos(a)],
      "tasset_leaf_embroidery",
    );
  }

  const bodySurface = b.surface(torso);
  b.sweep(bodySurface.loop([0, 1.036, 0], { dir: [0, 1, 0], lift: 0.013 }), 0.024, {
    color: leather, bone: hips, sides: 8, name: "broad_ranger_belt",
  });
  for (const y of [1.016, 1.056]) {
    b.sweep(bodySurface.loop([0, y, 0], { dir: [0, 1, 0], lift: 0.023 }), 0.003, {
      color: gold, bone: hips, sides: 5, name: "belt_edge_stitch",
    });
  }
  box([0, 1.036, 0.164], [0.068, 0.055, 0.018], gold, hips, "buckle_frame");
  box([0, 1.036, 0.175], [0.047, 0.037, 0.006], C.deep, hips, "buckle_inset");
  jewel([0, 1.036, 0.183], 0.017, hips, "belt_moonstone");

  const strap = bodySurface.drape(
    [[-0.183, 1.366, 0.064], [-0.132, 1.271, 0.124],
     [-0.056, 1.165, 0.124], [0.063, 1.085, 0.121], [0.145, 1.032, 0.064]],
    { lift: 0.037 },
  );
  b.sweep(strap, () => [0.019, 0.005], {
    section: "box", color: leather, bone: spine, caps: "flat", name: "quiver_bandolier",
  });
  b.along(strap, 9, (at) => {
    b.stick(new THREE.SphereGeometry(0.004, 6, 4), gold, at, { embed: 0, name: "strap_stitch_stud" });
  });
  box([-0.100, 1.236, 0.164], [0.033, 0.039, 0.014], gold, chest, "bandolier_slide", [0, 0, -30]);
  box([-0.100, 1.236, 0.174], [0.020, 0.025, 0.005], C.leatherDark, chest, "slide_opening", [0, 0, -30]);

  box([-0.227, 0.933, 0.007], [0.099, 0.132, 0.069], leather, hips, "map_pouch");
  box([-0.227, 0.986, 0.048], [0.106, 0.057, 0.016], C.leatherDark, hips, "pouch_flap");
  drawing([-0.227, 0.931, 0.044], 0.072, 0.041, runes, hips);
  stud([-0.227, 0.972, 0.060], hips, 0.010);
  for (const s of [1, -1]) {
    b.rod([-0.227 + s * 0.044, 0.988, 0.046], [-0.227 + s * 0.044, 0.881, 0.046], 0.002, {
      color: C.gold, bone: hips, sides: 5, name: "pouch_edge_stitch",
    });
  }
  box([-0.241, 1.008, 0.002], [0.070, 0.075, 0.014], C.ivory, hips, "folded_map");
  drawing([-0.241, 1.013, 0.011], 0.065, 0.070, mapTexture, hips);

  b.sweep([[0.227, 1.02, 0.01], [0.263, 0.85, -0.009], [0.280, 0.758, -0.013]], (t) => [0.024 * (1 - t * 0.56), 0.015 * (1 - t * 0.5)], {
    section: "box", color: C.deep, bone: hips, caps: "point", name: "ranger_knife_sheath",
  });
  b.rod([0.229, 1.016, 0.015], [0.212, 1.094, 0.022], 0.012, {
    color: leather, bone: hips, sides: 8, name: "knife_handle",
  });
  b.rod([0.194, 1.017, 0.019], [0.260, 1.029, 0.019], 0.007, {
    color: gold, bone: hips, sides: 6, name: "knife_leaf_crossguard",
  });
  ellipsoid([0.211, 1.102, 0.023], [0.016, 0.011, 0.013], gold, hips, "knife_pommel", 8);
  tassel([0.259, 0.967, 0.015], hips, 0.085);

  // A fuller, split travelling cloak with shallow broad folds.
  for (const { s, joint } of cloakJoints) {
    const inside = [
      [0, 1.369, -0.138],
      [s * 0.027, 1.155, -0.193],
      [s * 0.045, 0.723, -0.265],
    ];
    const outside = [
      [s * 0.211, 1.345, -0.085],
      [s * 0.327, 1.135, -0.201],
      [s * 0.401, 0.691, -0.297],
    ];
    const panel = b.membrane(inside, outside, {
      color: cloakPaint, thickness: 0.014, rows: 5, cols: 8, bone: joint, name: "split_woodland_cloak",
    });
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      b.sweep(
        [
          [s * (0.03 + t * 0.15), 1.340, -0.127],
          [s * (0.03 + t * 0.27), 1.104, -0.226],
          [s * (0.043 + t * 0.36), 0.723 - t * 0.032, -0.298],
        ],
        [0.008, 0.012],
        { color: i % 2 ? "#345e4e" : "#214b43", bone: joint, sides: 5, caps: "flat", name: "broad_cloak_pleat" },
      );
    }
    b.sweep(catmull(outside), 0.0042, {
      color: gold, bone: joint, sides: 5, name: "cloak_outer_binding",
    });
    b.sweep(
      [[s * 0.045, 0.723, -0.272], [s * 0.201, 0.704, -0.289], [s * 0.401, 0.691, -0.299]],
      0.0048,
      { color: gold, bone: joint, sides: 6, name: "cloak_hem_binding" },
    );
    for (const dir of [1, -1]) {
      b.decal(panel, embroidery, {
        at: [s * 0.230, 0.79, -0.277],
        dir: [0, 0, dir],
        size: [0.280, 0.11],
        lift: 0.0025,
        segments: 12,
        bone: joint,
        mirror: s * dir < 0,
        name: "cloak_ivy_embroidery",
      });
    }
    tassel([s * 0.401, 0.695, -0.299], joint, 0.059);
  }

  b.sweep(
    catmull([[-0.221, 1.363, -0.054], [-0.147, 1.414, -0.109], [0, 1.435, -0.135], [0.147, 1.414, -0.109], [0.221, 1.363, -0.054]]),
    0.038,
    { color: cloth, bone: chest, sides: 8, name: "lowered_hood_roll" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.188, 1.374, 0.080], [s * 0.119, 1.353, 0.137], [s * 0.047, 1.375, 0.133]),
      0.0031,
      { color: gold, bone: chest, sides: 6, name: "cloak_clasp_chain" },
    );
    leafPlate([s * 0.186, 1.373, 0.081], 0.31, 0.22, chest, C.forest, "cloak_leaf_clasp", s * 22);
  }

  // Open quiver, with broad physical fletching rather than edge-on cards.
  const q = b.region({ at: quiverBone.at, quat: quiverBone.quat, bone: quiverBone });
  b.lathe(
    [[0, 0], [0.048, 0], [0.058, 0.02], [0.065, 0.329], [0.068, 0.352],
     [0.057, 0.352], [0.052, 0.04], [0, 0.04]],
    {
      at: q.p([0, 0, 0]), axis: quiverBone.axis, segments: 10,
      color: leather, bone: quiverBone, name: "open_leather_quiver",
    },
  );
  for (const y of [0.027, 0.298, 0.346]) {
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.017, 10, 1, true), gold, {
      at: q.p([0, y, 0]), dir: quiverBone.axis, bone: quiverBone, name: "quiver_gilt_band",
    });
  }
  drawing(q.p([0, 0.168, 0.064]), 0.068, 0.118, leafEmblem, quiverBone, q.d([0, 0, 1]), "quiver_badge");
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const x = Math.sin(a) * 0.029;
    const z = Math.cos(a) * 0.029;
    const top = 0.496 + (i % 3) * 0.030;
    b.rod(q.p([x, 0.15, z]), q.p([x, top, z]), 0.0037, {
      color: C.shaft, bone: quiverBone, sides: 6, name: "quiver_arrow_shaft",
    });
    b.rod(q.p([x, top - 0.009, z]), q.p([x, top + 0.014, z]), 0.005, {
      color: gold, bone: quiverBone, sides: 5, name: "arrow_nock",
    });
    for (let j = 0; j < 3; j++) {
      const theta = j * Math.PI * 2 / 3 + a;
      const X = q.d([Math.sin(theta), 0, Math.cos(theta)]);
      const feather = b.extrude(
        [[0.004, 0], [0.024, 0.014], [0.030, 0.055], [0.008, 0.105, "sharp"], [0.004, 0.086]],
        {
          at: q.p([x, top - 0.117, z]),
          x: X,
          y: quiverBone.axis,
          thickness: 0.003,
          color: j % 2 ? C.mint : C.ivory,
          bone: quiverBone,
          name: "broad_arrow_fletching",
        },
      );
      b.rod(
        feather.local([0.008, 0.015, 0.002]),
        feather.local([0.008, 0.090, 0.002]),
        0.0016,
        { color: C.forest, bone: quiverBone, sides: 5, name: "fletching_quill" },
      );
    }
    b.rod(q.p([x, top - 0.130, z]), q.p([x, top - 0.109, z]), 0.0056, {
      color: C.deep, bone: quiverBone, sides: 6, name: "fletching_binding",
    });
  }
  drawing(q.p([0, 0.335, 0.071]), 0.105, 0.027, runes, quiverBone, q.d([0, 0, 1]), "quiver_rim_script");

  // Recurve bow is moved into the fingers, with no artificial connecting bar.
  function BP(x: number, y: number, z = 0.083) {
    return [x - 0.060, y, z];
  }
  const bowPath = catmull([
    BP(0.892, 0.543), BP(0.943, 0.498), BP(1.070, 0.65),
    BP(1.080, 0.891), BP(0.936, 1.145), BP(1.080, 1.413),
    BP(1.073, 1.687), BP(0.947, 1.866), BP(0.897, 1.821),
  ]);
  const bow = b.sweep(bowPath, (t) => [0.012 + Math.sin(Math.PI * t) * 0.009, 0.014], {
    color: bowWood, bone: bowBone, sides: 8, caps: "flat", name: "living_wood_recurve_bow",
  });
  b.sweep(bow.line(90, 0.0016), 0.003, {
    color: gold, bone: bowBone, sides: 5, name: "bow_gilt_inlay",
  });
  b.sweep(bow.line(-90, 0.0016), 0.0027, {
    color: C.deep, bone: bowBone, sides: 5, name: "bow_dark_lamination",
  });
  b.rod(BP(0.892, 0.543), BP(0.897, 1.821), 0.0016, {
    color: "#eaddb6", bone: bowBone, sides: 5, name: "taut_bowstring",
  });
  b.rod(BP(0.936, 1.073), BP(0.936, 1.215), 0.022, {
    color: C.leatherDark, bone: bowBone, sides: 8, name: "bow_leather_grip",
  });
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.0035, 8), i % 3 ? leather : gold, {
      at: BP(0.936, 1.083 + i * 0.016), bone: bowBone, name: "bow_grip_wrap",
    });
  }
  // The wrist sling is an actual loop, seated on glove and grip.
  b.sweep(
    catmull(
      [[0.759, 1.150, 0.066], [0.801, 1.181, 0.087], [0.861, 1.177, 0.097],
       [0.881, 1.104, 0.090], [0.808, 1.102, 0.075], [0.758, 1.125, 0.052]],
      { closed: true },
    ),
    0.0045,
    { color: leather, bone: bowBone, sides: 6, name: "bow_wrist_sling" },
  );

  for (const t of [0.08, 0.20, 0.33, 0.68, 0.81, 0.93]) {
    b.ring(frame(bowPath.at(t), bowPath.tangentAt(t)), { count: 8, radius: 0.022 }, (item) => {
      b.stick(new THREE.SphereGeometry(0.0037, 6, 4), gold, b.surface(bow).nearest(item.at), {
        embed: 0.35, bone: bowBone, name: "bow_binding_stud",
      });
    });
  }
  for (const y of [0.679, 1.689]) {
    leafPlate(BP(1.075, y, 0.105), 0.54, 0.63, bowBone, C.deep, "bow_leaf_mount");
    jewel(BP(1.075, y, 0.132), 0.020, bowBone, "bow_moonstone");
  }
  drawing(BP(1.052, 1.418, 0.108), 0.037, 0.095, leafEmblem, bowBone);
  drawing(BP(1.052, 0.891, 0.108), 0.037, 0.095, leafEmblem, bowBone);
  tassel(BP(0.965, 1.089, 0.096), bowBone, 0.089);

  // A feather charm echoes the full-size arrow fletching.
  b.cards(
    [frame(BP(0.972, 1.047, 0.097), [0, 1, 0])],
    featherDrawing,
    { size: [0.022, 0.069], lean: 180, flow: [0, 0, 1], sink: 0, bone: bowBone },
  );

  // Compact setting: feet touch its 8 cm upper surface, plinth touches y=0.
  b.part(new THREE.CylinderGeometry(0.91, 0.925, 0.076, 28), groundPaint, {
    at: [0.065, 0.038, -0.027], scale: [1, 1, 0.51], bone: hips, name: "mossy_woodland_stage",
  });
  b.part(new THREE.CylinderGeometry(0.928, 0.928, 0.015, 28), C.stoneDark, {
    at: [0.065, 0.0075, -0.027], scale: [1, 1, 0.51], bone: hips, name: "dark_base_plinth",
  });
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 12;
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [0.065 + Math.cos(a) * 0.839, 0.070, -0.027 + Math.sin(a) * 0.413],
      scale: [0.077 + random() * 0.028, 0.029 + random() * 0.012, 0.059],
      rotation: [0, -a * 180 / Math.PI, 0],
      bone: hips,
      name: "stage_edge_waystone",
    });
  }
  for (let i = 0; i < 6; i++) {
    const x = -0.61 + random() * 1.29;
    const z = -0.31 + random() * 0.45;
    if (Math.abs(x) < 0.27 && z > -0.12) continue;
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, 0.082, z],
      scale: [0.035 + random() * 0.027, 0.018, 0.030 + random() * 0.018],
      rotation: [0, random() * 180, 0],
      bone: hips,
      name: "small_forest_pebble",
    });
  }

  const marker = b.extrude(
    [[-0.077, 0], [0.078, 0], [0.071, 0.201], [0.027, 0.273], [-0.047, 0.252], [-0.080, 0.170]],
    {
      at: [-0.591, 0.075, -0.242], x: [1, 0, 0], thickness: 0.089,
      bevel: 0.006, color: stonePaint, bone: hips, name: "ancient_trail_waystone",
    },
  );
  glow(
    drawing([-0.591, 0.211, -0.195], 0.084, 0.151, waystoneTexture, hips, [0, 0, 1], "elven_waymarker"),
    0.35,
  );
  b.sweep(
    [[-0.644, 0.19, -0.194], [-0.612, 0.219, -0.194], [-0.620, 0.269, -0.194]],
    0.002,
    { color: C.stoneDark, bone: hips, sides: 5, name: "waystone_crack" },
  );
  b.stick(
    new THREE.DodecahedronGeometry(0.049, 0),
    C.moss,
    b.surface(marker).nearest([-0.643, 0.103, -0.197]),
    { scale: [1, 0.24, 0.7], name: "waystone_moss" },
  );

  function fern(at: number[], side: number, height: number) {
    b.sweep(
      catmull([at, [at[0] + side * 0.023, at[1] + height * 0.52, at[2] - 0.014],
        [at[0] + side * 0.065, at[1] + height, at[2] - 0.029]]),
      [0.0028, 0.001],
      { color: C.moss, bone: hips, sides: 5, name: "fern_stem" },
    );
    for (let i = 0; i < 4; i++) {
      const y = at[1] + height * (0.19 + i * 0.18);
      const cx = at[0] + side * 0.052 * i / 4;
      const w = 0.061 * (1 - i * 0.16);
      for (const s of [1, -1]) {
        b.slab(
          [[cx, y, at[2] - 0.007], [cx + s * w * 0.57, y + 0.015, at[2] - 0.015],
           [cx + s * w, y + 0.039, at[2] - 0.023], [cx + s * w * 0.60, y + 0.001, at[2] - 0.019]],
          { thickness: 0.003, color: i % 2 ? "#839959" : "#507755", bone: hips, name: "broad_fern_leaflet" },
        );
      }
    }
  }
  fern([-0.684, 0.081, -0.224], -1, 0.187);
  fern([-0.653, 0.081, -0.259], 1, 0.148);
  fern([0.597, 0.081, -0.289], 1, 0.169);
  fern([0.627, 0.081, -0.250], -1, 0.125);
  fern([0.740, 0.081, 0.034], 1, 0.115);

  for (const at of [[-0.409, 0.08, -0.337], [0.435, 0.08, -0.337]]) {
    b.rod(at, [at[0], at[1] + 0.048, at[2]], 0.009, {
      color: C.ivory, bone: hips, sides: 6, name: "mushroom_stalk",
    });
    b.lathe([[0, 0], [0.034, 0], [0.029, 0.019], [0.015, 0.025], [0, 0.025]], {
      at: [at[0], at[1] + 0.040, at[2]], color: "#b38355",
      bone: hips, segments: 8, name: "forest_mushroom_cap",
    });
  }

  return b.root;
}

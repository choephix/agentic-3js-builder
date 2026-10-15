import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  svg,
  paint,
  scales,
  mix,
  type Joint,
  type Paint,
} from "../../../../src/index";
import { animeEye, cel } from "../../../../kits/toon";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin of the Cloud Court",
  description:
    "An ivory-maned, jade-scaled qilin with branching coral antlers, gilded cloven hooves, flowing cloud whiskers and a celestial seal beneath its feet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Qilin of the Cloud Court",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(8713);

  // A small, deliberately limited palette: porcelain, jade, coral and old gold.
  const INK = "#183c48";
  const HOOF = "#213443";
  const GOLD = metal("gilt", {
    polish: 0.45,
    tarnish: 0.08,
    size: 0.13,
    seed: 12,
  });
  const JADE = cel("#41b9a8", "#238a8c");
  const PALE_JADE = cel("#7ed4bd", "#41a9a4");
  const DEEP_JADE = cel("#239a99", "#236f81");
  const IVORY = cel("#fff4d9", "#bbdcd2");
  const MANE = paint((p, n) => {
    const warmth = Math.max(0, n.y) * 0.45;
    const c = mix("#c5e4dc", "#fff8e4", 0.63 + warmth);
    return p.y < 0.55 ? mix(c, "#82bdb9", 0.16) : c;
  });
  const CORAL = cel("#efa58f", "#c96d79");
  const TIP = cel("#fff0ca", "#e7bca6");
  const EAR_INNER = cel("#d8878e", "#a96480");
  const STONE = cel("#396d72", "#244d5e");
  const STONE_TOP = paint((p, n) => {
    const stripe = Math.sin(p.x * 10 + p.z * 3) * 0.025;
    return mix("#426e73", "#719b95", 0.45 + n.y * 0.23 + stripe);
  });
  const COAT = cel(
    scales(["#36aa9e", "#43b5a5", "#4abbaa"], "#318c91", {
      size: 0.16,
      width: 0.065,
      seed: 22,
    }),
    "#2d838c",
  );
  const BODY_PAINT = paint((p, n) => {
    if (n.y < -0.4 && p.y < 1.25) return IVORY;
    return COAT;
  });

  // Drawings are reused on the actual forms rather than on a billboard portrait.
  const EYE = animeEye({
    iris: "#eaa33c",
    irisLight: "#fff1a3",
    irisDark: "#9f5439",
    ink: "#203745",
    blush: false,
    brow: false,
    size: 512,
  });

  const CLOUD = svg(
    `<svg viewBox="0 0 180 100">
      <path d="M12 76 C40 86 73 84 91 70 C111 55 108 30 91 28
        C76 26 70 42 79 49 C88 55 96 48 92 42
        M45 77 C33 67 37 49 50 48 C62 46 68 56 62 64
        M98 73 C132 80 158 66 164 49
        M117 66 C117 51 128 42 139 47 C149 52 145 63 137 62"
        fill="none" stroke="#4b9e9c" stroke-width="5"
        stroke-linecap="round"/>
      <path d="M18 88 C67 98 122 90 156 75
        M30 32 C42 19 62 17 72 23"
        fill="none" stroke="#dbb45f" stroke-width="3.5"
        stroke-linecap="round"/>
      <circle cx="151" cy="29" r="4" fill="#dbb45f"/>
    </svg>`,
    { size: 384 },
  );

  const CHEST_SEAL = svg(
    `<svg viewBox="0 0 120 160">
      <path d="M60 7 C76 30 103 42 103 76 C103 111 78 140 60 151
        C42 140 17 111 17 76 C17 42 44 30 60 7Z"
        fill="#edd28a" stroke="#376d77" stroke-width="5"/>
      <path d="M60 19 C73 40 91 47 91 78 C91 102 74 125 60 136
        C46 125 29 102 29 78 C29 47 47 40 60 19Z"
        fill="#f9edc6" stroke="#b79045" stroke-width="3"/>
      <path d="M39 93 C29 84 34 68 47 70 C60 72 58 88 48 87
        M45 104 C68 118 88 95 78 80 C73 73 62 75 64 85
        M60 38 L68 57 L60 68 L52 57Z"
        fill="none" stroke="#389c98" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 123 Q60 132 76 123" fill="none"
        stroke="#c79446" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const FOREHEAD = svg(
    `<svg viewBox="0 0 100 130">
      <path d="M50 5 L67 34 Q88 47 78 70 L61 106 L50 124
        L39 106 L22 70 Q12 47 33 34Z"
        fill="#efd486" stroke="#255c69" stroke-width="5"/>
      <path d="M50 20 L61 43 L70 57 L50 92 L30 57 L39 43Z"
        fill="#2b9c99" stroke="#fff2be" stroke-width="4"/>
      <path d="M50 30 L55 51 L50 73 L45 51Z" fill="#a3f3d7"/>
      <path d="M22 90 Q34 91 40 103 M78 90 Q66 91 60 103"
        fill="none" stroke="#d19c44" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const HOOF_RUNE = svg(
    `<svg viewBox="0 0 80 100">
      <path d="M40 12 L56 34 L40 57 L24 34Z M40 57 L40 83
        M20 73 Q40 94 60 73"
        fill="none" stroke="#234c5b" stroke-width="7"
        stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M40 22 L46 34 L40 44 L34 34Z" fill="#fff0b6"/>
    </svg>`,
    { size: 192 },
  );

  const FLOOR_SEAL = svg(
    `<svg viewBox="0 0 220 420">
      <g fill="none" stroke="#b3b881">
        <ellipse cx="110" cy="210" rx="103" ry="202" stroke-width="2"/>
        <ellipse cx="110" cy="210" rx="95" ry="189" stroke-width="1.5"/>
        <ellipse cx="110" cy="210" rx="83" ry="167" stroke-width="1"
          stroke-dasharray="3 7"/>
        <path d="M110 44 L125 73 L110 102 L95 73Z
          M110 318 L125 347 L110 376 L95 347Z" stroke-width="2"/>
        <path d="M34 173 Q17 186 34 201 Q53 214 61 198
          Q68 183 54 181 Q43 179 44 190
          M186 219 Q204 232 186 247 Q167 260 159 244
          Q152 229 166 227 Q177 225 176 236" stroke-width="2.5"/>
        <path d="M43 111 Q70 91 87 111 M133 309 Q154 328 177 308
          M37 279 Q58 263 74 281 M146 137 Q165 152 185 135"
          stroke-width="2"/>
      </g>
      <g fill="#d8c990">
        <circle cx="110" cy="22" r="3"/>
        <circle cx="110" cy="398" r="3"/>
        <circle cx="12" cy="210" r="3"/>
        <circle cx="208" cy="210" r="3"/>
      </g>
    </svg>`,
    { size: 1024 },
  );

  const NAMEPLATE = svg(
    `<svg viewBox="0 0 420 100">
      <rect x="3" y="3" width="414" height="94" rx="16"
        fill="#254b58" stroke="#e8c776" stroke-width="6"/>
      <path d="M25 50 L43 28 L61 50 L43 72Z
        M359 50 L377 28 L395 50 L377 72Z"
        fill="none" stroke="#b9d6bb" stroke-width="3"/>
      <text x="210" y="49" text-anchor="middle" font-family="serif"
        font-size="38" letter-spacing="9" fill="#fff0c6">QILIN</text>
      <text x="210" y="78" text-anchor="middle" font-family="serif"
        font-size="14" letter-spacing="4" fill="#a9d6c8">THE CLOUD COURT</text>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton. The display platform belongs to root, not to a moving leg or hip.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.28, -0.64],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.28, -0.64],
      [0, 1.35, -0.12],
      [0, 1.41, 0.43],
    ],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 1.43, 0.43],
      [0, 1.66, 0.64],
      [0, 1.91, 0.87],
      [0, 2.02, 0.98],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neck3", "poll"],
      role: "neck",
    },
  );

  const H = 1.05;
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 2.02, 0.98],
    dir: [0, 0, 1],
    role: "head",
  });
  const hr = b.region({ at: head.at, scale: H, bone: head });
  const hp = (p: number[]) => hr.p(p);
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, -0.145, 0.16]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const legs: {
    chain: ReturnType<typeof b.chain>;
    side: number;
    suffix: string;
    foot: number[];
    front: boolean;
  }[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fore = b.chain(
      `fore${side}`,
      [
        [s * 0.28, 1.38, 0.48],
        [s * 0.34, 0.89, 0.60],
        [s * 0.35, 0.43, 0.64],
        [s * 0.35, 0.29, 0.69],
      ],
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoofF${side}`],
        role: "leg",
        contact: [s * 0.35, 0.15, 0.72],
      },
    );
    const hind = b.chain(
      `hind${side}`,
      [
        [s * 0.28, 1.27, -0.61],
        [s * 0.38, 0.91, -0.43],
        [s * 0.40, 0.55, -0.79],
        [s * 0.40, 0.29, -0.76],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
        role: "leg",
        contact: [s * 0.40, 0.15, -0.73],
      },
    );
    legs.push(
      { chain: fore, side: s, suffix: `F${side}`, foot: [s * 0.35, 0.29, 0.69], front: true },
      { chain: hind, side: s, suffix: `H${side}`, foot: [s * 0.40, 0.29, -0.76], front: false },
    );
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.30, -0.80],
      [0.015, 1.27, -1.16],
      [0.15, 1.36, -1.54],
      [0.29, 1.57, -1.86],
      [0.32, 1.81, -1.99],
    ]),
    {
      parent: hips,
      count: 5,
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    },
  );
  const tailFan = b.joint("tailFan", {
    parent: tail.tip!,
    at: tail.at(1),
    dir: [0, 0.4, -1],
    role: "fan",
  });

  const ears: Joint[] = [];
  const antlers: Joint[] = [];
  const whiskers: ReturnType<typeof b.chain>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ears.push(
      b.joint(`ear${side}`, {
        parent: head,
        at: hp([s * 0.205, 0.115, -0.035]),
        dir: [s * 0.7, 0.7, -0.1],
        role: "hinge",
      }),
    );
    antlers.push(
      b.joint(`antler${side}`, {
        parent: head,
        at: hp([s * 0.15, 0.22, 0]),
        dir: [s * 0.25, 1, -0.25],
        role: "fan",
      }),
    );
    whiskers.push(
      b.chain(
        `whisker${side}`,
        catmull([
          hp([s * 0.12, -0.10, 0.53]),
          hp([s * 0.32, -0.19, 0.64]),
          hp([s * 0.53, -0.12, 0.52]),
          hp([s * 0.59, 0.015, 0.31]),
        ]),
        { parent: head, count: 3, role: "tentacle" },
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Reusable primitive and ornament helpers.
  // ---------------------------------------------------------------------------
  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    size: number[],
    color: string | Paint,
    bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name,
      at,
      scale: size,
      bone,
      flat: true,
    });
  }

  function bead(
    name: string,
    at: number[] | THREE.Vector3,
    r: number,
    color: string | Paint,
    bone: Joint,
  ) {
    return b.part(new THREE.IcosahedronGeometry(r, 0), color, {
      name,
      at,
      bone,
    });
  }

  function torus(
    name: string,
    at: number[] | THREE.Vector3,
    radius: number,
    tube: number,
    direction: number[] | THREE.Vector3,
    color: string | Paint,
    bone: Joint,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, {
      name,
      at,
      dir: direction,
      axis: "z",
      bone,
    });
  }

  const cloudOutline: number[][] = [
    [0, -0.075],
    [0.17, -0.145],
    [0.35, -0.13],
    [0.48, -0.055],
    [0.535, 0.045],
    [0.505, 0.14],
    [0.425, 0.195],
    [0.335, 0.175],
    [0.275, 0.095],
    [0.205, 0.14],
    [0.10, 0.135],
    [0.015, 0.055],
  ];

  function cloudLock(
    name: string,
    at: number[] | THREE.Vector3,
    s: number,
    size: number,
    bone: Joint,
    drawing = true,
  ) {
    const outline = cloudOutline.map(([x, y]) => [x * size, y * size]);
    b.extrude(outline, {
      name: `${name}GoldRim`,
      at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.16 * size,
      smoothing: 2,
      color: GOLD,
      bone,
    });
    const inside = b.extrude(
      cloudOutline.map(([x, y]) => [
        (x * 0.94 + 0.012) * size,
        y * 0.90 * size,
      ]),
      {
        name,
        at,
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.17 * size,
        smoothing: 2,
        color: MANE,
        bone,
      },
    );
    if (drawing) {
      const pos = at instanceof THREE.Vector3 ? at : new THREE.Vector3(at[0], at[1], at[2]);
      b.decal(inside, CLOUD, {
        name: `${name}Scroll`,
        at: pos.clone().add(new THREE.Vector3(s * 0.087 * size, 0.022 * size, -0.29 * size)),
        dir: [s, 0, 0],
        size: [0.36 * size, 0.20 * size],
        segments: 5,
        lift: 0.002,
        bone,
      });
    }
    return inside;
  }

  function scaleGeometry(width: number, length: number, depth: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-width * 0.48, length * 0.34);
    shape.lineTo(-width * 0.5, -length * 0.03);
    shape.lineTo(-width * 0.32, -length * 0.31);
    shape.lineTo(0, -length * 0.57);
    shape.lineTo(width * 0.32, -length * 0.31);
    shape.lineTo(width * 0.5, -length * 0.03);
    shape.lineTo(width * 0.48, length * 0.34);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 1,
      steps: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }

  // ---------------------------------------------------------------------------
  // The face is completed first. The broad muzzle and two graphic eyes stay clear.
  // ---------------------------------------------------------------------------
  const skull = ellipsoid(
    "PorcelainJadeSkull",
    hp([0, 0.035, 0.08]),
    [0.245 * H, 0.255 * H, 0.305 * H],
    JADE,
    head,
    16,
  );
  ellipsoid(
    "UpperMuzzle",
    hp([0, -0.10, 0.35]),
    [0.18 * H, 0.115 * H, 0.225 * H],
    IVORY,
    head,
    12,
  );
  ellipsoid(
    "SeparateLowerJaw",
    hp([0, -0.215, 0.345]),
    [0.155 * H, 0.060 * H, 0.205 * H],
    IVORY,
    jaw,
    12,
  );
  ellipsoid(
    "MouthInterior",
    hp([0, -0.163, 0.39]),
    [0.145 * H, 0.016 * H, 0.16 * H],
    "#3e4759",
    jaw,
  );
  ellipsoid(
    "SoftCoralNose",
    hp([0, -0.073, 0.545]),
    [0.113 * H, 0.064 * H, 0.047 * H],
    "#c67e88",
    head,
  );

  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = faceSurface.around(hp([0, 0.035, 0.08])).at(s * 39, 9);
    b.decal(skull, EYE, {
      name: s > 0 ? "EyeL" : "EyeR",
      at: eyeHit,
      size: [0.158 * H, 0.205 * H],
      mirror: s > 0,
      segments: 8,
      lift: 0.0025,
      bone: head,
    });

    b.sweep(
      bezier(
        hp([s * 0.079, 0.162, 0.307]),
        hp([s * 0.17, 0.23, 0.26]),
        hp([s * 0.265, 0.16, 0.135]),
      ),
      [0.019 * H, 0.009 * H],
      { name: `GildedBrow${s > 0 ? "L" : "R"}`, color: GOLD, bone: head, sides: 6 },
    );

    ellipsoid(
      `Nostril${s}`,
      hp([s * 0.064, -0.070, 0.58]),
      [0.021 * H, 0.012 * H, 0.007 * H],
      INK,
      head,
      8,
    );

    const smile = bezier(
      hp([s * 0.025, -0.18, 0.535]),
      hp([s * 0.11, -0.187, 0.48]),
      hp([s * 0.158, -0.145, 0.375]),
    );
    b.sweep(smile, 0.006, { name: `Smile${s}`, color: "#44777a", bone: head, sides: 5 });

    cloudLock(
      `CheekCloud${s}`,
      hp([s * 0.22, -0.055, 0.225]),
      s,
      0.57,
      head,
      false,
    );
  }

  b.decal(skull, FOREHEAD, {
    name: "ForeheadDiadem",
    at: hp([0, 0.19, 0.275]),
    dir: [0, 0.25, 1],
    size: [0.115 * H, 0.15 * H],
    bone: head,
    segments: 6,
    lift: 0.003,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.030 * H, 0), "#9bf7dc", {
      name: "LivingJadeForeheadGem",
      at: hp([0, 0.19, 0.322]),
      scale: [0.72, 1.2, 0.55],
      bone: head,
    }),
    0.8,
  );

  // Deer ears: a solid jade silhouette, a gold lip, and an inset coral leaf.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];
    const origin = hp([s * 0.205, 0.115, -0.035]);
    const earOutline = [
      [0, 0],
      [0.11 * H, -0.015 * H],
      [0.285 * H, 0.21 * H],
      [0.275 * H, 0.295 * H],
      [0.12 * H, 0.255 * H],
      [-0.018 * H, 0.11 * H],
    ];
    b.extrude(earOutline, {
      name: `EarRim${i}`,
      at: origin,
      x: [s, 0, 0],
      y: [0, 1, -0.12],
      thickness: 0.055 * H,
      smoothing: 1,
      color: GOLD,
      bone: ear,
    });
    b.extrude(
      earOutline.map(([x, y]) => [x * 0.91 + 0.009, y * 0.88 + 0.012]),
      {
        name: `EarJade${i}`,
        at: origin,
        x: [s, 0, 0],
        y: [0, 1, -0.12],
        thickness: 0.059 * H,
        smoothing: 1,
        color: JADE,
        bone: ear,
      },
    );
    b.extrude(
      [
        [0.045, 0.064],
        [0.115, 0.052],
        [0.242, 0.233],
        [0.132, 0.205],
        [0.038, 0.118],
      ].map(([x, y]) => [x * H, y * H]),
      {
        name: `EarInner${i}`,
        at: origin.clone().add(new THREE.Vector3(0, 0, 0.034 * H)),
        x: [s, 0, 0],
        y: [0, 1, -0.12],
        thickness: 0.008,
        smoothing: 1,
        color: EAR_INNER,
        bone: ear,
      },
    );
    b.sweep(
      [hp([s * 0.25, 0.205, -0.015]), hp([s * 0.43, 0.36, -0.037])],
      [0.006, 0.002],
      { color: TIP, bone: ear, sides: 5, name: `EarVein${i}` },
    );
  }

  for (let i = 0; i < whiskers.length; i++) {
    b.sweep(whiskers[i], [0.018, 0.014, 0.009, 0.0015], {
      name: `FloatingCloudWhisker${i}`,
      color: TIP,
      sides: 6,
      bands: [[0.24, GOLD], [1, TIP]],
      caps: "flat",
    });
  }

  // A little three-part cloud beard, rooted in the separate lower jaw.
  for (const s of [-1, 0, 1]) {
    b.sweep(
      catmull([
        hp([s * 0.065, -0.23, 0.32]),
        hp([s * 0.08, -0.34, 0.30]),
        hp([s * 0.10, -0.43 + Math.abs(s) * 0.035, 0.21]),
        hp([s * 0.115, -0.39, 0.12]),
      ]),
      [0.046, 0.052, 0.025, 0],
      { name: `CloudBeard${s + 1}`, color: MANE, bone: jaw, sides: 6 },
    );
  }

  // ---------------------------------------------------------------------------
  // Torso and neck: continuous skinned shapes under the ornamental scale plates.
  // ---------------------------------------------------------------------------
  const body = b.sweep(
    spine,
    (t) => {
      const fullness = Math.sin(Math.PI * t);
      return [0.305 + fullness * 0.065, 0.325 + fullness * 0.075];
    },
    {
      name: "JadeScaledTorso",
      color: BODY_PAINT,
      sides: 10,
      smooth: false,
      caps: "round",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.25 - t * 0.095, 0.24 - t * 0.075],
    {
      name: "RisingDragonNeck",
      color: JADE,
      sides: 10,
      smooth: false,
      caps: "round",
    },
  );

  const bib = ellipsoid(
    "PorcelainChestBib",
    [0, 1.52, 0.83],
    [0.205, 0.29, 0.125],
    IVORY,
    neck.joints[0],
    12,
  );
  b.decal(bib, CHEST_SEAL, {
    name: "AuspiciousChestSeal",
    at: [0, 1.54, 0.957],
    dir: [0, 0, 1],
    size: [0.19, 0.25],
    segments: 7,
    lift: 0.002,
    bone: neck.joints[0],
  });

  // Seven staggered columns on each flank; each plate has a real gilded edge.
  const plateOuter = scaleGeometry(0.175, 0.235, 0.018);
  const plateInner = scaleGeometry(0.147, 0.201, 0.009);
  const plateColors = [JADE, PALE_JADE, DEEP_JADE, PALE_JADE];

  for (const s of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        const t = 0.095 + col * 0.122 + (row % 2) * 0.033;
        const hit = body.at(t, s * (49 + row * 34));
        b.stick(plateOuter, GOLD, hit, {
          name: `ScaleRim_${s}_${row}_${col}`,
          flow: [0, 0, -1],
          embed: 0.35,
        });
        b.stick(
          plateInner,
          plateColors[(col + row * 2) % plateColors.length],
          hit.moved([0, 0.014, 0]),
          {
            name: `ScaleFace_${s}_${row}_${col}`,
            flow: [0, 0, -1],
            embed: 0.1,
          },
        );
      }
    }
  }

  // Low, leaf-shaped dorsal plates continue the gold motif into the tail.
  b.along(
    body,
    8,
    (at) => {
      b.stick(
        new THREE.ConeGeometry(0.058, 0.15, 4),
        GOLD,
        at,
        {
          name: `DorsalCrown${Math.round(at.t * 100)}`,
          scale: [0.75, 1, 1.2],
          embed: 0.35,
          flow: [0, 0, -1],
        },
      );
    },
    { from: 0.05, to: 0.87 },
  );

  // A close-fitting necklace is seated on the actual neck, with no floating band.
  const collar = b.surface(neckTube).loop(neck.at(0.34), { lift: 0.008 });
  b.sweep(collar, 0.019, {
    name: "CloudCourtNeckRing",
    color: GOLD,
    sides: 6,
  });
  b.along(collar, 10, (at) => {
    b.stick(new THREE.IcosahedronGeometry(0.025, 0), "#b6ebcc", at, {
      name: `CollarJade${Math.round(at.t * 100)}`,
      embed: 0.4,
    });
  });

  // ---------------------------------------------------------------------------
  // Cloud mane: broad overlapping primitive locks, not hundreds of hair strands.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const locks = [
      { y: 2.125, z: 1.015, size: 0.91, bone: head },
      { y: 1.995, z: 0.865, size: 1.02, bone: neck.joints[2] },
      { y: 1.850, z: 0.710, size: 1.09, bone: neck.joints[1] },
      { y: 1.700, z: 0.555, size: 1.10, bone: neck.joints[1] },
      { y: 1.555, z: 0.400, size: 1.04, bone: neck.joints[0] },
      { y: 1.435, z: 0.275, size: 0.87, bone: spine.tip! },
    ];
    locks.forEach((lock, i) => {
      cloudLock(
        `Mane_${s}_${i}`,
        [s * (0.175 + i * 0.012), lock.y, lock.z],
        s,
        lock.size,
        lock.bone,
      );
    });

    // One continuous champagne-coloured streamer makes the mane's flow legible.
    b.sweep(
      catmull([
        hp([s * 0.12, 0.23, -0.045]),
        [s * 0.16, 2.13, 0.68],
        [s * 0.20, 1.87, 0.38],
        [s * 0.26, 1.57, 0.08],
        [s * 0.30, 1.45, -0.12],
      ]),
      [0.055, 0.075, 0.068, 0.046, 0],
      {
        name: `ManeCentralRibbon${s}`,
        color: IVORY,
        bone: [head, neck, spine],
        sides: 6,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Four separated, articulated legs and eight individually modelled hoof toes.
  // ---------------------------------------------------------------------------
  for (const info of legs) {
    const chain = info.chain;
    const bone = chain.tip!;
    const x = info.foot[0];
    const z = info.foot[2];

    b.sweep(chain, info.front ? [0.135, 0.095, 0.067, 0.058] : [0.17, 0.115, 0.065, 0.056], {
      name: `Leg${info.suffix}`,
      color: JADE,
      sides: 8,
      smooth: false,
      bands: [[0.47, JADE], [0.78, PALE_JADE], [1, IVORY]],
    });

    const upperHit = b.surface(body).nearest(chain.joints[0].at);
    b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      PALE_JADE,
      upperHit,
      {
        name: `HaunchArmor${info.suffix}`,
        scale: info.front ? [0.14, 0.035, 0.20] : [0.17, 0.045, 0.23],
        embed: 0.35,
        bone: chain.joints[0],
        flow: [0, -1, 0],
      },
    );

    const kneePoint = chain.joints[1].at;
    ellipsoid(
      `GildedKnee${info.suffix}`,
      kneePoint,
      [0.10, 0.105, 0.095],
      GOLD,
      chain.joints[1],
      10,
    );
    ellipsoid(
      `KneeJadeInset${info.suffix}`,
      kneePoint.clone().add(new THREE.Vector3(info.side * 0.066, 0.004, 0.018)),
      [0.043, 0.062, 0.055],
      DEEP_JADE,
      chain.joints[1],
      8,
    );

    b.part(new THREE.CylinderGeometry(0.085, 0.093, 0.065, 8), GOLD, {
      name: `FetlockCuff${info.suffix}`,
      at: [x, 0.385, z - 0.016],
      bone,
    });
    torus(
      `CuffUpperLip${info.suffix}`,
      [x, 0.419, z - 0.016],
      0.083,
      0.011,
      [0, 1, 0],
      IVORY,
      bone,
    );

    for (const toe of [-1, 1]) {
      const tx = x + toe * 0.057;
      b.part(new THREE.BoxGeometry(0.111, 0.035, 0.292), HOOF, {
        name: `HoofSole${info.suffix}_${toe}`,
        at: [tx, 0.1575, z + 0.02],
        bone,
      });
      b.extrude(
        [
          [-0.052, 0],
          [0.052, 0],
          [0.052, 0.115],
          [0.029, 0.19],
          [-0.036, 0.19],
          [-0.052, 0.10],
        ],
        {
          name: `ClovenToe${info.suffix}_${toe}`,
          at: [tx, 0.16, z + 0.02],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.28,
          bevel: 0.01,
          color: HOOF,
          bone,
        },
      );
      b.extrude(
        [
          [-0.044, 0.018],
          [0.044, 0.018],
          [0.043, 0.106],
          [0.024, 0.158],
          [-0.029, 0.158],
          [-0.044, 0.088],
        ],
        {
          name: `GildedHoofFace${info.suffix}_${toe}`,
          at: [tx, 0.16, z + 0.166],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.012,
          bevel: 0.003,
          color: GOLD,
          bone,
        },
      );
      b.part(new THREE.PlaneGeometry(0.065, 0.09), "#ffffff", {
        name: `HoofRune${info.suffix}_${toe}`,
        at: [tx, 0.245, z + 0.173],
        texture: HOOF_RUNE,
        bone,
      });
    }

    // A small dewclaw and cloud flourish grow behind each ankle.
    b.spike(
      [x, 0.40, z - 0.07],
      [x, 0.38, z - 0.19],
      null,
      0.034,
      { name: `Dewclaw${info.suffix}`, color: GOLD, bone, sides: 5 },
    );
    cloudLock(
      `AnkleCloud${info.suffix}`,
      [x + info.side * 0.035, 0.48, z - 0.005],
      info.side,
      0.43,
      chain.joints[2],
      false,
    );
  }

  // ---------------------------------------------------------------------------
  // Branching coral antlers. All tines on a side ride one recognisable fan bone.
  // ---------------------------------------------------------------------------
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = antlers[i];
    const mainPoints = [
      hp([s * 0.15, 0.22, 0]),
      hp([s * 0.25, 0.44, -0.085]),
      hp([s * 0.38, 0.66, -0.19]),
      hp([s * 0.54, 0.89, -0.30]),
      hp([s * 0.63, 1.04, -0.22]),
    ];
    const main = catmull(mainPoints);
    b.sweep(main, [0.065, 0.056, 0.041, 0.026, 0.003], {
      name: `AntlerBeam${i}`,
      color: CORAL,
      bone,
      sides: 6,
      smooth: false,
      bands: [[0.16, GOLD], [0.80, CORAL], [1, TIP]],
      caps: "flat",
    });

    const branches = [
      [
        mainPoints[1],
        hp([s * 0.22, 0.60, 0.055]),
        hp([s * 0.30, 0.80, 0.12]),
      ],
      [
        mainPoints[2],
        hp([s * 0.57, 0.73, -0.10]),
        hp([s * 0.72, 0.92, -0.02]),
      ],
      [
        mainPoints[3],
        hp([s * 0.47, 1.025, -0.37]),
        hp([s * 0.51, 1.17, -0.39]),
      ],
    ];
    branches.forEach((points, j) => {
      b.sweep(catmull(points), [0.037 - j * 0.004, 0.024, 0.002], {
        name: `AntlerTine${i}_${j}`,
        color: CORAL,
        bone,
        sides: 6,
        smooth: false,
        bands: [[0.66, CORAL], [1, TIP]],
        caps: "flat",
      });
    });

    for (const t of [0.08, 0.24, 0.39]) {
      const radius = 0.063 - t * 0.04;
      torus(
        `AntlerEngravedBand${i}_${t}`,
        main.at(t),
        radius,
        0.006,
        main.tangentAt(t),
        GOLD,
        bone,
      );
    }

    const pendantStart = hp([s * 0.56, 0.75, -0.09]);
    const pendantEnd = hp([s * 0.57, 0.57, -0.085]);
    b.sweep([pendantStart, pendantEnd], 0.005, {
      name: `AntlerPendantChain${i}`,
      color: GOLD,
      bone,
      sides: 5,
    });
    bead(`AntlerPendantGold${i}`, pendantEnd, 0.036, GOLD, bone);
    glow(
      b.part(new THREE.OctahedronGeometry(0.034, 0), "#a0ebcc", {
        name: `AntlerPendantJade${i}`,
        at: pendantEnd.clone().add(new THREE.Vector3(0, -0.034, 0)),
        scale: [0.75, 1.35, 0.75],
        bone,
      }),
      0.35,
    );
  }

  // ---------------------------------------------------------------------------
  // Dragon tail and its airy, curling cloud brush.
  // ---------------------------------------------------------------------------
  const tailTube = b.sweep(tail, [0.15, 0.125, 0.095, 0.064, 0.045, 0.035], {
    name: "ExtendedJadeTail",
    color: JADE,
    sides: 8,
    sectors: [[135, 225, IVORY]],
    caps: "flat",
  });

  b.along(
    tailTube,
    7,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.037, 0.10, 4), GOLD, at, {
        name: `TailCrest${Math.round(at.t * 100)}`,
        embed: 0.35,
        flow: [0, 0, -1],
      });
    },
    { from: 0.08, to: 0.85 },
  );

  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const t = 0.12 + k * 0.17;
      const hit = tailTube.at(t, s * 82);
      b.stick(scaleGeometry(0.105, 0.17, 0.013), GOLD, hit, {
        name: `TailScaleRim${s}_${k}`,
        flow: tail.at(t).tangent,
        embed: 0.4,
      });
      b.stick(
        scaleGeometry(0.085, 0.145, 0.007),
        PALE_JADE,
        hit.moved([0, 0.010, 0]),
        {
          name: `TailScale${s}_${k}`,
          flow: tail.at(t).tangent,
          embed: 0.1,
        },
      );
    }
  }

  const tailEnd = tail.at(1).at;
  for (let i = -3; i <= 3; i++) {
    const spread = i / 3;
    const start = tailEnd.clone().add(new THREE.Vector3(spread * 0.025, 0, 0.02));
    const points = [
      start,
      tailEnd.clone().add(new THREE.Vector3(spread * 0.14, 0.12, -0.13)),
      tailEnd.clone().add(new THREE.Vector3(spread * 0.31, 0.24 - Math.abs(spread) * 0.08, -0.30)),
      tailEnd.clone().add(new THREE.Vector3(spread * 0.36, 0.37 - Math.abs(spread) * 0.10, -0.35)),
      tailEnd.clone().add(new THREE.Vector3(spread * 0.28, 0.39 - Math.abs(spread) * 0.06, -0.28)),
    ];
    b.sweep(catmull(points), [0.045, 0.091, 0.087, 0.045, 0], {
      name: `TailCloudLock${i + 3}`,
      color: MANE,
      bone: tailFan,
      sides: 6,
      bands: [[0.78, MANE], [1, TIP]],
      caps: "flat",
    });

    const goldPath = points.map((p) => p.clone().add(new THREE.Vector3(0, 0.015, 0.060)));
    b.sweep(catmull(goldPath), [0.009, 0.011, 0.009, 0.004, 0], {
      name: `TailCloudFiligree${i + 3}`,
      color: GOLD,
      bone: tailFan,
      sides: 5,
    });
  }

  torus(
    "TailBrushBinding",
    tailEnd,
    0.064,
    0.016,
    tail.at(1).tangent,
    GOLD,
    tailFan,
  );

  // ---------------------------------------------------------------------------
  // A restrained shrine-floor display: shallow enough not to compete with him.
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1, 1, 0.09, 16), STONE, {
    name: "SixteenSidedShrineFoundation",
    at: [0, 0.045, -0.40],
    scale: [1.08, 1, 2.12],
    bone: root,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.055, 16), GOLD, {
    name: "FoundationGoldReveal",
    at: [0, 0.095, -0.40],
    scale: [1.055, 1, 2.085],
    bone: root,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.055, 16), STONE_TOP, {
    name: "CeladonSealStone",
    at: [0, 0.1225, -0.40],
    scale: [1.035, 1, 2.065],
    bone: root,
    flat: true,
  });

  b.part(new THREE.PlaneGeometry(2.02, 4.02), "#ffffff", {
    name: "EngravedCelestialFloor",
    at: [0, 0.1515, -0.40],
    rotation: [-90, 0, 0],
    texture: FLOOR_SEAL,
    bone: root,
  });

  const rimPoints: number[][] = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    rimPoints.push([Math.sin(a) * 1.02, 0.155, -0.40 + Math.cos(a) * 2.045]);
  }
  b.sweep(catmull(rimPoints, { closed: true }), 0.009, {
    name: "FineGoldFloorRim",
    color: GOLD,
    bone: root,
    sides: 5,
  });

  // Low clouds hugging the back of the seal leave the front legs unobstructed.
  const groundClouds = [
    { at: [0.70, 0.235, -1.38], side: 1, size: 0.58 },
    { at: [-0.74, 0.235, -1.03], side: -1, size: 0.52 },
    { at: [-0.37, 0.215, -2.12], side: -1, size: 0.40 },
  ];
  groundClouds.forEach((c, i) => {
    cloudLock(`ShrineMist${i}`, c.at, c.side, c.size, root, false);
  });

  // Tiny lotus-like corner inlays, each a modest assembly of broad petals.
  for (const s of [1, -1]) {
    const cx = s * 0.77;
    const cz = 0.85;
    for (let i = 0; i < 5; i++) {
      const angle = ((i - 2) * Math.PI) / 7;
      const dx = Math.sin(angle);
      const dz = Math.cos(angle);
      b.extrude(
        [
          [-0.035, 0],
          [-0.05, 0.10],
          [0, 0.23],
          [0.05, 0.10],
          [0.035, 0],
        ],
        {
          name: `LotusInlay${s}_${i}`,
          at: [cx, 0.157, cz],
          x: [dz, 0, -dx],
          y: [dx, 0, dz],
          thickness: 0.006,
          smoothing: 1,
          color: i % 2 === 0 ? GOLD : PALE_JADE,
          bone: root,
        },
      );
    }
    bead(`LotusHeart${s}`, [cx, 0.171, cz + 0.07], 0.034, GOLD, root);
  }

  // Subtle stone chips, all supported by the seal, add handmade shrine character.
  for (let i = 0; i < 9; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    const x = s * (0.70 + random() * 0.13);
    const z = -0.50 - random() * 1.20;
    const r = 0.025 + random() * 0.025;
    b.part(new THREE.DodecahedronGeometry(r, 0), STONE, {
      name: `SealStoneChip${i}`,
      at: [x, 0.15 + r * 0.45, z],
      scale: [1.5, 0.55, 1],
      rotation: [0, random() * 180, 0],
      bone: root,
    });
  }

  b.part(new THREE.BoxGeometry(0.58, 0.108, 0.028), GOLD, {
    name: "TitlePlaqueBacking",
    at: [0, 0.079, 1.698],
    bone: root,
  });
  b.part(new THREE.PlaneGeometry(0.55, 0.098), "#ffffff", {
    name: "QilinTitlePlaque",
    at: [0, 0.079, 1.713],
    texture: NAMEPLATE,
    bone: root,
  });

  // Two small fixed jade studs finish the platform's front edge.
  for (const s of [1, -1]) {
    b.stick(
      new THREE.IcosahedronGeometry(0.019, 0),
      "#a9dec5",
      frame([s * 0.35, 0.082, 1.68], [0, 0, 1]),
      { name: `PlaqueJadeStud${s}`, bone: root, embed: 0.4 },
    );
  }

  return b.root;
}

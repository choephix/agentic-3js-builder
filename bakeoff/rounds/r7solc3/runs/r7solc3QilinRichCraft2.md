```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  scales,
  mix,
  type Joint,
  type Paint,
} from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin of the Cloud Court",
  description:
    "A celestial jade qilin with coral antlers, an ivory cloud mane, shingled enamel scales and gilded cloven hooves, presented on a celadon shrine seal.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Root the whiskers inside the muzzle and close the conspicuous mouth gap.
   * 2. Expose the porcelain throat and chest emblem: the previous bib was buried.
   * 3. Replace the mane's repeated shells with overlapping, asymmetric billows.
   * 4. Give the tail brush broad, flowing locks instead of skeletal finger shapes.
   * 5. Refine the scale shingles, enlarge the eyes and slightly shorten the antlers.
   * 6. Seat hoof drawings on the actual armor surfaces; retain the restrained shrine.
   */
  const b = createBuilder({
    name: "Qilin of the Cloud Court",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(8713);

  const INK = "#183c48";
  const HOOF = "#315762";
  const GOLD = metal("gilt", {
    polish: 0.45,
    tarnish: 0.08,
    size: 0.13,
    seed: 12,
  });
  const JADE = cel("#41b9a8", "#238a8c");
  const PALE_JADE = cel("#8cdcc4", "#48aaa8");
  const DEEP_JADE = cel("#259b9c", "#236b82");
  const IVORY = cel("#fff4df", "#bfdcd8");
  const MANE = paint((_p, n) =>
    mix("#b5d3d9", "#fff8e9", 0.67 + Math.max(0, n.y) * 0.33),
  );
  const CORAL = cel("#efa58f", "#c96d79");
  const SILK = cel("#df827e", "#ac586f");
  const TIP = cel("#fff0ca", "#e7bca6");
  const EAR_INNER = cel("#d8878e", "#a96480");
  const STONE = cel("#396d72", "#244d5e");
  const STONE_TOP = paint((p, n) =>
    mix(
      "#426e73",
      "#719b95",
      0.45 + n.y * 0.23 + Math.sin(p.x * 10 + p.z * 3) * 0.025,
    ),
  );
  const COAT = cel(
    scales(["#36aa9e", "#43b5a5", "#4abbaa"], "#318c91", {
      size: 0.11,
      width: 0.045,
      seed: 22,
    }),
    "#2d838c",
  );
  const BODY_PAINT = paint((p, n) =>
    n.y < -0.4 && p.y < 1.25 ? IVORY : COAT,
  );
  const NECK_PAINT = paint((_p, n) =>
    n.z > 0.42 && n.y < 0.35 ? IVORY : JADE,
  );
  const SCALE_FACE = paint((p, n) =>
    mix(
      "#309b99",
      "#76d6b7",
      0.46 + n.y * 0.25 + Math.sin(p.z * 9) * 0.035,
    ),
  );

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
    `<svg viewBox="0 0 200 120">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 84 C42 101 98 105 121 78
          C139 57 124 35 108 40 C92 45 97 65 109 63
          C119 61 116 51 110 53
          M43 91 C25 76 34 53 52 56 C69 59 66 78 54 77
          M125 87 C151 95 181 76 183 57
          M143 79 C136 62 149 48 162 55 C173 62 166 74 158 68"
          stroke="#4b9e9c" stroke-width="3"/>
        <path d="M24 105 C77 120 147 103 178 82
          M42 39 C59 24 81 27 87 35
          M151 33 L158 24 L165 33 L158 42Z"
          stroke="#d5b567" stroke-width="2.5"/>
        <path d="M50 96 C80 100 100 94 113 83"
          stroke="#fff0bf" stroke-width="3"/>
      </g>
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
        M20 73 Q40 94 60 73" fill="none" stroke="#234c5b"
        stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
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
        <circle cx="110" cy="22" r="3"/><circle cx="110" cy="398" r="3"/>
        <circle cx="12" cy="210" r="3"/><circle cx="208" cy="210" r="3"/>
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

  // Skeleton first. The legs and tail are deliberately separated for animation.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.28, -0.64],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.28, -0.64], [0, 1.35, -0.12], [0, 1.41, 0.43]],
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
  const H = 1.11;
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 2.02, 0.98],
    dir: [0, 0, 1],
    role: "head",
  });
  const hr = b.region({ at: head.at, scale: H, bone: head });
  const hp = (p: number[]) => hr.p(p);
  const ap = (p: number[]) => hp([p[0], 0.22 + (p[1] - 0.22) * 0.84, p[2]]);
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
      {
        chain: fore,
        side: s,
        suffix: `F${side}`,
        foot: [s * 0.35, 0.29, 0.69],
        front: true,
      },
      {
        chain: hind,
        side: s,
        suffix: `H${side}`,
        foot: [s * 0.40, 0.29, -0.76],
        front: false,
      },
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
          hp([s * 0.095, -0.080, 0.505]),
          hp([s * 0.29, -0.15, 0.61]),
          hp([s * 0.49, -0.07, 0.50]),
          hp([s * 0.55, 0.065, 0.32]),
        ]),
        { parent: head, count: 3, role: "tentacle" },
      ),
    );
  }

  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    size: number[],
    color: string | Paint,
    bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name, at, scale: size, bone, flat: true,
    });
  }
  function bead(
    name: string,
    at: number[] | THREE.Vector3,
    radius: number,
    color: string | Paint,
    bone: Joint,
  ) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, {
      name, at, bone,
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
      name, at, dir: direction, axis: "z", bone,
    });
  }

  // Broad overlapping cloud masses are the silhouette; linework is subordinate.
  function cloudLock(
    name: string,
    at: number[] | THREE.Vector3,
    s: number,
    size: number,
    bone: Joint,
    drawing = true,
    variation = 0,
  ) {
    const origin = at instanceof THREE.Vector3
      ? at.clone()
      : new THREE.Vector3(at[0], at[1], at[2]);
    const p = (x: number, y: number, z: number) =>
      origin.clone().add(new THREE.Vector3(x * size, y * size, z * size));

    const rootCloud = ellipsoid(
      `${name}Root`, p(0, -0.008, -0.10),
      [0.155 * size, 0.153 * size, 0.195 * size], MANE, bone,
    );
    const crestCloud = ellipsoid(
      `${name}HighBillow`, p(s * 0.026, 0.079, -0.235),
      [0.147 * size, 0.164 * size, 0.161 * size], MANE, bone,
    );
    const rearCloud = ellipsoid(
      `${name}RearBillow`, p(s * 0.018, 0.036, -0.352),
      [0.126 * size, 0.126 * size, 0.150 * size], MANE, bone,
    );
    ellipsoid(
      `${name}SmallScallop`, p(s * 0.033, 0.145, -0.12),
      [0.102 * size, 0.102 * size, 0.112 * size], IVORY, bone,
    );
    const curl = b.sweep(
      catmull([
        p(0, -0.038, -0.23),
        p(s * 0.014, -0.014, -0.39),
        p(s * 0.024, 0.063, -0.51 - variation),
        p(s * 0.032, 0.17, -0.52 - variation),
        p(s * 0.035, 0.20, -0.455 - variation),
        p(s * 0.035, 0.158, -0.425 - variation),
      ]),
      [
        0.098 * size, 0.094 * size, 0.076 * size,
        0.047 * size, 0.023 * size, 0.001 * size,
      ],
      {
        name: `${name}WindCurl`, color: MANE, bone,
        sides: 7, smooth: false, caps: "flat",
      },
    );
    b.sweep(
      catmull([
        p(0, -0.06, -0.03),
        p(s * 0.008, -0.13, -0.20),
        p(s * 0.014, -0.105, -0.37),
        p(s * 0.019, -0.04, -0.50),
      ]),
      [0.066 * size, 0.067 * size, 0.043 * size, 0],
      { name: `${name}LowerWisp`, color: IVORY, bone, sides: 6 },
    );
    if (drawing) {
      b.sweep(
        curl.line(s > 0 ? 270 : 90, 0.002 * size).slice(0.55, 0.92),
        [0.0035 * size, 0.0018 * size],
        { name: `${name}GoldTip`, color: GOLD, bone, sides: 5 },
      );
      b.decal([rootCloud, crestCloud, rearCloud], CLOUD, {
        name: `${name}CloudCalligraphy`,
        at: p(s * 0.17, 0.015, -0.235),
        dir: [s, 0, 0],
        size: [0.34 * size, 0.195 * size],
        segments: 7,
        lift: 0.002,
        bone,
      });
    }
    return rootCloud;
  }

  function scaleGeometry(width: number, length: number, depth: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-width * 0.42, length * 0.38);
    shape.lineTo(-width * 0.50, length * 0.12);
    shape.lineTo(-width * 0.43, -length * 0.18);
    shape.lineTo(-width * 0.24, -length * 0.40);
    shape.lineTo(0, -length * 0.53);
    shape.lineTo(width * 0.24, -length * 0.40);
    shape.lineTo(width * 0.43, -length * 0.18);
    shape.lineTo(width * 0.50, length * 0.12);
    shape.lineTo(width * 0.42, length * 0.38);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: Math.min(depth * 0.35, 0.002),
      bevelThickness: depth * 0.28,
      bevelSegments: 1,
      curveSegments: 1,
      steps: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }

  // Face and separate lower jaw.
  const skull = ellipsoid(
    "PorcelainJadeSkull", hp([0, 0.035, 0.08]),
    [0.265 * H, 0.26 * H, 0.305 * H], PALE_JADE, head, 16,
  );
  ellipsoid(
    "UpperMuzzle", hp([0, -0.064, 0.35]),
    [0.166 * H, 0.093 * H, 0.225 * H], IVORY, head,
  );
  ellipsoid(
    "TaperedNasalBridge", hp([0, 0.005, 0.325]),
    [0.103 * H, 0.114 * H, 0.16 * H], PALE_JADE, head,
  );
  ellipsoid(
    "SeparateLowerJaw", hp([0, -0.146, 0.345]),
    [0.146 * H, 0.039 * H, 0.193 * H], IVORY, jaw,
  );
  ellipsoid(
    "RecessedMouthInterior", hp([0, -0.135, 0.395]),
    [0.108 * H, 0.003 * H, 0.10 * H], "#385660", jaw,
  );
  ellipsoid(
    "PorcelainNoseBridge", hp([0, -0.064, 0.515]),
    [0.122 * H, 0.054 * H, 0.066 * H], IVORY, head,
  );
  ellipsoid(
    "UpperLip", hp([0, -0.119, 0.452]),
    [0.139 * H, 0.023 * H, 0.091 * H], IVORY, head,
  );

  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = faceSurface.around(hp([0, 0.035, 0.08])).at(s * 31, 11);
    b.decal(skull, EYE, {
      name: s > 0 ? "EyeL" : "EyeR",
      at: eyeHit,
      size: [0.19 * H, 0.238 * H],
      mirror: s > 0,
      segments: 8,
      lift: 0.0025,
      bone: head,
    });
    b.sweep(
      bezier(
        hp([s * 0.075, 0.179, 0.326]),
        hp([s * 0.16, 0.235, 0.29]),
        hp([s * 0.25, 0.182, 0.19]),
      ),
      [0.012 * H, 0.003 * H],
      { name: `GildedBrow${s}`, color: GOLD, bone: head, sides: 6 },
    );
    ellipsoid(
      `Nostril${s}`, hp([s * 0.083, -0.055, 0.559]),
      [0.018 * H, 0.009 * H, 0.007 * H], INK, head, 8,
    );
    b.sweep(
      bezier(
        hp([s * 0.018, -0.133, 0.536]),
        hp([s * 0.104, -0.14, 0.478]),
        hp([s * 0.151, -0.112, 0.38]),
      ),
      0.003,
      { name: `Smile${s}`, color: "#44777a", bone: head, sides: 5 },
    );
    cloudLock(
      `CheekCloud${s}`, hp([s * 0.238, -0.077, 0.18]),
      s, 0.39, head, false,
    );
    const cheek = faceSurface.around(hp([0, 0.035, 0.08])).at(s * 51, -19);
    b.stick(new THREE.SphereGeometry(1, 8, 5), IVORY, cheek, {
      name: `CheekPearl${s}`,
      scale: [0.022, 0.007, 0.034],
      embed: 0.4,
      flow: [0, 1, 0],
      bone: head,
    });
  }
  b.decal(skull, FOREHEAD, {
    name: "ForeheadDiadem",
    at: hp([0, 0.19, 0.275]),
    dir: [0, 0.25, 1],
    size: [0.12 * H, 0.155 * H],
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

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];
    const origin = hp([s * 0.205, 0.115, -0.035]);
    const outline = [
      [0, 0], [0.11 * H, -0.015 * H],
      [0.285 * H, 0.21 * H], [0.275 * H, 0.295 * H],
      [0.12 * H, 0.255 * H], [-0.018 * H, 0.11 * H],
    ];
    b.extrude(outline, {
      name: `EarRim${i}`, at: origin,
      x: [s, 0, 0], y: [0, 1, -0.12],
      thickness: 0.055 * H, smoothing: 1, color: GOLD, bone: ear,
    });
    b.extrude(
      outline.map(([x, y]) => [x * 0.91 + 0.009, y * 0.88 + 0.012]),
      {
        name: `EarJade${i}`, at: origin,
        x: [s, 0, 0], y: [0, 1, -0.12],
        thickness: 0.059 * H, smoothing: 1, color: JADE, bone: ear,
      },
    );
    b.extrude(
      [
        [0.045, 0.064], [0.115, 0.052], [0.242, 0.233],
        [0.132, 0.205], [0.038, 0.118],
      ].map(([x, y]) => [x * H, y * H]),
      {
        name: `EarInner${i}`,
        at: origin.clone().add(new THREE.Vector3(0, 0, 0.034 * H)),
        x: [s, 0, 0], y: [0, 1, -0.12],
        thickness: 0.008, smoothing: 1, color: EAR_INNER, bone: ear,
      },
    );
    b.sweep(
      [hp([s * 0.25, 0.205, -0.015]), hp([s * 0.43, 0.36, -0.037])],
      [0.006, 0.002],
      { color: TIP, bone: ear, sides: 5, name: `EarVein${i}` },
    );
  }
  whiskers.forEach((chain, i) => {
    b.sweep(chain, [0.013, 0.010, 0.006, 0.001], {
      name: `FloatingCloudWhisker${i}`,
      color: TIP,
      sides: 6,
      bands: [[0.075, GOLD], [1, TIP]],
      caps: "flat",
    });
  });
  for (const s of [-1, 0, 1]) {
    b.sweep(
      catmull([
        hp([s * 0.043, -0.165, 0.33]),
        hp([s * 0.053, -0.23, 0.28]),
        hp([s * 0.060, -0.28 + Math.abs(s) * 0.02, 0.19]),
        hp([s * 0.060, -0.25, 0.12]),
      ]),
      [0.031, 0.035, 0.022, 0],
      { name: `CloudBeard${s + 1}`, color: MANE, bone: jaw, sides: 6 },
    );
  }

  const body = b.sweep(
    spine,
    (t) => [
      0.305 + Math.sin(Math.PI * t) * 0.065,
      0.325 + Math.sin(Math.PI * t) * 0.075,
    ],
    {
      name: "JadeScaledTorso", color: BODY_PAINT,
      sides: 10, smooth: false, caps: "round",
    },
  );
  const neckTube = b.sweep(
    neck,
    (t) => [0.25 - t * 0.095, 0.24 - t * 0.075],
    {
      name: "RisingDragonNeck", color: NECK_PAINT,
      sides: 10, smooth: false, caps: "round",
    },
  );

  // Seat the ceremonial emblem on the neck itself, not on an intersecting bib.
  const throatSurface = b.surface(neckTube);
  const sealHit = throatSurface.ray([0, 1.56, 1.50], [0, 0, -1])!;
  b.decal(neckTube, CHEST_SEAL, {
    name: "AuspiciousChestSeal",
    at: sealHit,
    dir: [0, 0, 1],
    size: [0.15, 0.205],
    segments: 8,
    lift: 0.003,
    bone: neck.joints[0],
  });
  // Fine gold boundaries follow the porcelain throat exactly.
  for (const s of [1, -1]) {
    const trim = throatSurface.drape(
      catmull([
        [s * 0.09, 1.91, 1.13],
        [s * 0.13, 1.77, 0.98],
        [s * 0.16, 1.56, 0.86],
        [s * 0.15, 1.38, 0.72],
      ]),
      { lift: 0.003 },
    );
    b.sweep(trim, 0.0045, {
      name: `PorcelainThroatBorder${s}`,
      color: GOLD, bone: neck, sides: 5,
    });
  }

  const plateOuter = scaleGeometry(0.123, 0.155, 0.006);
  const plateInner = scaleGeometry(0.115, 0.146, 0.005);
  for (const s of [1, -1]) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 11; col++) {
        const t = 0.055 + col * 0.083 + (row % 2) * 0.032;
        const hit = body.at(t, s * (38 + row * 27));
        b.stick(plateOuter, GOLD, hit, {
          name: `ScaleRim_${s}_${row}_${col}`,
          flow: [0, -1, -0.20],
          embed: 0.3,
        });
        b.stick(plateInner, SCALE_FACE, hit.moved([0, 0.0045, 0]), {
          name: `ScaleFace_${s}_${row}_${col}`,
          flow: [0, -1, -0.20],
          embed: 0.1,
        });
        if ((col + row) % 3 === 0) {
          b.stick(
            new THREE.SphereGeometry(1, 6, 4),
            "#ade6c6",
            hit.moved([0, 0.010, 0]),
            {
              name: `ScaleGlint_${s}_${row}_${col}`,
              scale: [0.004, 0.002, 0.022],
              flow: [0, -1, -0.20],
              embed: 0.25,
            },
          );
        }
      }
    }
  }
  b.along(body, 8, (at) => {
    b.stick(new THREE.ConeGeometry(0.036, 0.084, 4), GOLD, at, {
      name: `DorsalCrown${Math.round(at.t * 100)}`,
      scale: [0.75, 1, 1.2],
      embed: 0.35,
      flow: [0, 0, -1],
    });
  }, { from: 0.05, to: 0.87 });

  const collar = throatSurface.loop(neck.at(0.24), { lift: 0.008 });
  b.sweep(collar, 0.011, {
    name: "CloudCourtNeckRing", color: GOLD, sides: 6,
  });
  b.along(collar, 10, (at) => {
    b.stick(new THREE.IcosahedronGeometry(0.017, 0), "#b6ebcc", at, {
      name: `CollarJade${Math.round(at.t * 100)}`, embed: 0.4,
    });
  });

  // Large cloud masses overlap down the nape; no repeated exposed spiral hoops.
  for (const s of [1, -1]) {
    const locks = [
      { y: 2.125, z: 0.86, size: 0.74, bone: head },
      { y: 1.94, z: 0.67, size: 1.00, bone: neck.joints[2] },
      { y: 1.715, z: 0.445, size: 1.10, bone: neck.joints[1] },
      { y: 1.515, z: 0.215, size: 0.82, bone: neck.joints[0] },
    ];
    locks.forEach((lock, i) => {
      cloudLock(
        `Mane_${s}_${i}`,
        [s * (0.175 + i * 0.021), lock.y, lock.z],
        s, lock.size, lock.bone, i === 1 || i === 2,
        i % 2 === 0 ? 0.02 : -0.015,
      );
    });
    b.sweep(
      catmull([
        hp([s * 0.10, 0.22, -0.055]),
        [s * 0.12, 2.13, 0.65],
        [s * 0.16, 1.89, 0.35],
        [s * 0.23, 1.58, 0.02],
        [s * 0.27, 1.45, -0.21],
      ]),
      [0.070, 0.10, 0.095, 0.06, 0],
      {
        name: `ManeCentralRibbon${s}`,
        color: IVORY, bone: [head, neck, spine], sides: 7,
      },
    );

    const knot = [s * 0.37, 1.43, 0.20];
    const drop = [s * 0.425, 1.19, 0.16];
    b.sweep(
      catmull([
        [s * 0.27, 1.52, 0.27],
        knot,
        [s * 0.43, 1.31, 0.18],
        drop,
      ]),
      0.010,
      { name: `CoralCeremonialCord${s}`, color: SILK, bone: spine.tip!, sides: 6 },
    );
    torus(`SilkKnot${s}`, knot, 0.028, 0.010, [s, 0, 0], SILK, spine.tip!);
    b.extrude(
      [
        [0, 0.01], [0.052, -0.015], [0.065, -0.12],
        [0.032, -0.165], [-0.006, -0.105],
      ],
      {
        name: `CoralSilkRibbon${s}`,
        at: knot, x: [0, 0, -1], y: [0, 1, 0],
        thickness: 0.009, smoothing: 1, color: SILK, bone: spine.tip!,
      },
    );
    torus(
      `JadePendantRim${s}`, drop, 0.039, 0.009,
      [s, 0, 0], GOLD, spine.tip!,
    );
    b.part(new THREE.OctahedronGeometry(0.031, 0), "#a7ebcc", {
      name: `JadePendant${s}`,
      at: drop, scale: [0.38, 1.1, 0.85], bone: spine.tip!,
    });
    b.sweep(
      [drop, [s * 0.425, 1.10, 0.16]],
      [0.017, 0.009],
      { name: `SilkPendantTassel${s}`, color: SILK, bone: spine.tip!, sides: 6 },
    );
    bead(`TasselGoldTip${s}`, [s * 0.425, 1.10, 0.16], 0.012, GOLD, spine.tip!);
  }

  // Four cloven hooves, with clear soles, coronets and separate knee armor.
  for (const info of legs) {
    const chain = info.chain;
    const bone = chain.tip!;
    const x = info.foot[0];
    const z = info.foot[2];
    const legTube = b.sweep(
      chain,
      info.front ? [0.135, 0.095, 0.067, 0.058] : [0.17, 0.115, 0.065, 0.056],
      {
        name: `Leg${info.suffix}`,
        color: JADE, sides: 8, smooth: false,
        bands: [[0.47, JADE], [0.78, PALE_JADE], [1, IVORY]],
      },
    );
    const upperHit = b.surface(body).nearest(chain.joints[0].at);
    b.stick(new THREE.SphereGeometry(1, 10, 6), PALE_JADE, upperHit, {
      name: `HaunchArmor${info.suffix}`,
      scale: info.front ? [0.14, 0.035, 0.20] : [0.17, 0.045, 0.23],
      embed: 0.35, bone: chain.joints[0], flow: [0, -1, 0],
    });
    for (const t of [0.53, 0.68]) {
      const hit = legTube.at(t, info.side * 90);
      b.stick(scaleGeometry(0.087, 0.12, 0.009), GOLD, hit, {
        name: `ShinShieldRim${info.suffix}_${t}`,
        flow: [0, -1, 0], embed: 0.35,
      });
      b.stick(
        scaleGeometry(0.077, 0.108, 0.005), PALE_JADE,
        hit.moved([0, 0.006, 0]),
        {
          name: `ShinShield${info.suffix}_${t}`,
          flow: [0, -1, 0], embed: 0.15,
        },
      );
    }
    const knee = chain.joints[1].at;
    ellipsoid(
      `GildedKnee${info.suffix}`, knee,
      [0.10, 0.105, 0.095], GOLD, chain.joints[1], 10,
    );
    ellipsoid(
      `KneeJadeInset${info.suffix}`,
      knee.clone().add(new THREE.Vector3(info.side * 0.066, 0.004, 0.018)),
      [0.043, 0.062, 0.055], DEEP_JADE, chain.joints[1], 8,
    );
    b.part(new THREE.CylinderGeometry(0.085, 0.093, 0.065, 8), GOLD, {
      name: `FetlockCuff${info.suffix}`, at: [x, 0.385, z - 0.016], bone,
    });
    torus(
      `CuffUpperLip${info.suffix}`, [x, 0.419, z - 0.016],
      0.083, 0.011, [0, 1, 0], IVORY, bone,
    );
    for (const toe of [-1, 1]) {
      const tx = x + toe * 0.057;
      b.part(new THREE.BoxGeometry(0.108, 0.030, 0.282), "#1d3546", {
        name: `HoofSole${info.suffix}_${toe}`,
        at: [tx, 0.155, z + 0.025], bone,
      });
      b.extrude(
        [
          [-0.115, 0], [0.145, 0], [0.133, 0.095],
          [0.065, 0.185], [-0.073, 0.185], [-0.115, 0.10],
        ],
        {
          name: `ClovenToe${info.suffix}_${toe}`,
          at: [tx, 0.16, z + 0.02],
          x: [0, 0, 1], y: [0, 1, 0],
          thickness: 0.105, bevel: 0.007, color: HOOF, bone,
        },
      );
      const armor = b.extrude(
        [
          [-0.044, 0.018], [0.044, 0.018], [0.043, 0.106],
          [0.024, 0.153], [-0.029, 0.153], [-0.044, 0.088],
        ],
        {
          name: `GildedHoofFace${info.suffix}_${toe}`,
          at: [tx, 0.16, z + 0.151],
          x: [1, 0, 0], y: [0, 1, -0.22],
          thickness: 0.012, bevel: 0.003, color: GOLD, bone,
        },
      );
      const runeHit = b.surface(armor).ray(
        [tx, 0.245, z + 0.35],
        [0, 0, -1],
      )!;
      b.decal(armor, HOOF_RUNE, {
        name: `HoofRune${info.suffix}_${toe}`,
        at: runeHit,
        dir: [0, 0, 1],
        size: [0.057, 0.080],
        lift: 0.002,
        segments: 3,
        bone,
      });
    }
    b.extrude(
      [
        [-0.09, 0.053], [0.10, 0.053], [0.09, 0.096],
        [0.038, 0.164], [-0.06, 0.164],
      ],
      {
        name: `HoofOuterGoldArmor${info.suffix}`,
        at: [x + info.side * 0.113, 0.16, z + 0.02],
        x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.009, bevel: 0.002, color: GOLD, bone,
      },
    );
    b.spike([x, 0.40, z - 0.07], [x, 0.38, z - 0.19], null, 0.034, {
      name: `Dewclaw${info.suffix}`, color: GOLD, bone, sides: 5,
    });
    cloudLock(
      `AnkleCloud${info.suffix}`,
      [x + info.side * 0.035, 0.48, z - 0.005],
      info.side, 0.34, chain.joints[2], false,
    );
  }

  // Paired, branching coral antlers; all ornaments ride their named pivots.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = antlers[i];
    const points = [
      ap([s * 0.15, 0.22, 0]),
      ap([s * 0.25, 0.44, -0.085]),
      ap([s * 0.38, 0.66, -0.19]),
      ap([s * 0.54, 0.89, -0.30]),
      ap([s * 0.63, 1.04, -0.22]),
    ];
    const main = catmull(points);
    b.sweep(main, [0.065, 0.056, 0.041, 0.026, 0.003], {
      name: `AntlerBeam${i}`, color: CORAL, bone,
      sides: 6, smooth: false,
      bands: [[0.09, GOLD], [0.80, CORAL], [1, TIP]],
      caps: "flat",
    });
    const branches = [
      [points[1], ap([s * 0.22, 0.60, 0.055]), ap([s * 0.30, 0.80, 0.12])],
      [points[2], ap([s * 0.57, 0.73, -0.10]), ap([s * 0.72, 0.92, -0.02])],
      [points[3], ap([s * 0.47, 1.025, -0.37]), ap([s * 0.51, 1.17, -0.39])],
    ];
    branches.forEach((branch, j) => {
      b.sweep(catmull(branch), [0.037 - j * 0.004, 0.024, 0.002], {
        name: `AntlerTine${i}_${j}`, color: CORAL, bone,
        sides: 6, smooth: false,
        bands: [[0.66, CORAL], [1, TIP]], caps: "flat",
      });
    });
    for (const t of [0.08, 0.24, 0.39]) {
      torus(
        `AntlerEngravedBand${i}_${t}`, main.at(t),
        0.063 - t * 0.04, 0.005, main.tangentAt(t), GOLD, bone,
      );
    }
    const start = ap([s * 0.56, 0.75, -0.09]);
    const end = start.clone().add(new THREE.Vector3(0, -0.17, 0));
    b.sweep([start, end], 0.005, {
      name: `AntlerPendantChain${i}`, color: GOLD, bone, sides: 5,
    });
    bead(`AntlerPendantGold${i}`, end, 0.029, GOLD, bone);
    glow(
      b.part(new THREE.OctahedronGeometry(0.032, 0), "#a0ebcc", {
        name: `AntlerPendantJade${i}`,
        at: end.clone().add(new THREE.Vector3(0, -0.032, 0)),
        scale: [0.75, 1.35, 0.75], bone,
      }),
      0.35,
    );
  }

  const tailTube = b.sweep(
    tail,
    [0.15, 0.125, 0.095, 0.064, 0.045, 0.035],
    {
      name: "ExtendedJadeTail", color: JADE,
      sides: 8, sectors: [[135, 225, IVORY]], caps: "flat",
    },
  );
  b.along(tailTube, 7, (at) => {
    b.stick(new THREE.ConeGeometry(0.027, 0.067, 4), GOLD, at, {
      name: `TailCrest${Math.round(at.t * 100)}`,
      embed: 0.35, flow: [0, 0, -1],
    });
  }, { from: 0.08, to: 0.85 });
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const t = 0.12 + k * 0.17;
      const hit = tailTube.at(t, s * 82);
      b.stick(scaleGeometry(0.105, 0.17, 0.008), GOLD, hit, {
        name: `TailScaleRim${s}_${k}`,
        flow: tail.at(t).tangent, embed: 0.35,
      });
      b.stick(
        scaleGeometry(0.096, 0.158, 0.005),
        PALE_JADE, hit.moved([0, 0.006, 0]),
        {
          name: `TailScale${s}_${k}`,
          flow: tail.at(t).tangent, embed: 0.1,
        },
      );
    }
  }

  // A cloud brush, not a hand: broad overlapping roots and tapered wind tips.
  const tailEnd = tail.at(1).at;
  const tailLocks = [
    { x: -0.39, y: 0.31, z: -0.43, r: 0.073 },
    { x: -0.22, y: 0.51, z: -0.42, r: 0.085 },
    { x: 0.02, y: 0.64, z: -0.45, r: 0.096 },
    { x: 0.25, y: 0.48, z: -0.48, r: 0.086 },
    { x: 0.45, y: 0.27, z: -0.49, r: 0.073 },
  ];
  tailLocks.forEach((lock, i) => {
    const p = (x: number, y: number, z: number) =>
      tailEnd.clone().add(new THREE.Vector3(x, y, z));
    const strand = b.sweep(
      catmull([
        p((i - 2) * 0.017, 0, 0.028),
        p(lock.x * 0.28, lock.y * 0.30, lock.z * 0.40),
        p(lock.x * 0.68, lock.y * 0.71, lock.z * 0.84),
        p(lock.x, lock.y, lock.z),
        p(lock.x + 0.026, lock.y + 0.066, lock.z + 0.065),
        p(lock.x - 0.008, lock.y + 0.055, lock.z + 0.115),
      ]),
      [0.048, lock.r, lock.r, lock.r * 0.63, lock.r * 0.30, 0.001],
      {
        name: `TailCloudLock${i}`, color: MANE, bone: tailFan,
        sides: 7, smooth: false, caps: "flat",
        bands: [[0.87, MANE], [1, TIP]],
      },
    );
    b.sweep(
      strand.line(i < 2 ? 90 : 270, 0.001).slice(0.26, 0.84),
      [0.0038, 0.0017],
      {
        name: `TailCloudFiligree${i}`,
        color: GOLD, bone: tailFan, sides: 5,
      },
    );
  });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        tailEnd,
        tailEnd.clone().add(new THREE.Vector3(s * 0.11, 0.012, -0.17)),
        tailEnd.clone().add(new THREE.Vector3(s * 0.30, 0.08, -0.40)),
        tailEnd.clone().add(new THREE.Vector3(s * 0.34, 0.19, -0.46)),
        tailEnd.clone().add(new THREE.Vector3(s * 0.29, 0.23, -0.40)),
      ]),
      [0.045, 0.063, 0.051, 0.029, 0],
      {
        name: `TailLowerStreamer${s}`,
        color: IVORY, bone: tailFan, sides: 6,
      },
    );
  }
  torus(
    "TailBrushBinding", tailEnd, 0.067, 0.013,
    tail.at(1).tangent, GOLD, tailFan,
  );

  // Low, close-fitting shrine floor. Nothing competes with the face.
  const baseZ = -0.55;
  b.part(new THREE.CylinderGeometry(1, 1, 0.09, 16), STONE, {
    name: "SixteenSidedShrineFoundation",
    at: [0, 0.045, baseZ], scale: [1.08, 1, 1.98],
    bone: root, flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.055, 16), GOLD, {
    name: "FoundationGoldReveal",
    at: [0, 0.095, baseZ], scale: [1.055, 1, 1.945],
    bone: root, flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.055, 16), STONE_TOP, {
    name: "CeladonSealStone",
    at: [0, 0.1225, baseZ], scale: [1.035, 1, 1.925],
    bone: root, flat: true,
  });
  b.part(new THREE.PlaneGeometry(2.02, 3.74), "#ffffff", {
    name: "EngravedCelestialFloor",
    at: [0, 0.1515, baseZ], rotation: [-90, 0, 0],
    texture: FLOOR_SEAL, bone: root,
  });
  const rimPoints: number[][] = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    rimPoints.push([
      Math.sin(a) * 1.02,
      0.155,
      baseZ + Math.cos(a) * 1.905,
    ]);
  }
  b.sweep(catmull(rimPoints, { closed: true }), 0.009, {
    name: "FineGoldFloorRim", color: GOLD, bone: root, sides: 5,
  });

  [
    { at: [0.70, 0.235, -1.38], side: 1, size: 0.46 },
    { at: [-0.74, 0.230, -1.03], side: -1, size: 0.40 },
    { at: [-0.37, 0.210, -2.08], side: -1, size: 0.31 },
  ].forEach((c, i) => {
    cloudLock(`ShrineMist${i}`, c.at, c.side, c.size, root, false);
  });

  for (const s of [1, -1]) {
    const cx = s * 0.72;
    const cz = 0.63;
    for (let i = 0; i < 5; i++) {
      const angle = ((i - 2) * Math.PI) / 7;
      const dx = Math.sin(angle);
      const dz = Math.cos(angle);
      b.extrude(
        [
          [-0.035, 0], [-0.05, 0.10], [0, 0.23],
          [0.05, 0.10], [0.035, 0],
        ],
        {
          name: `LotusInlay${s}_${i}`,
          at: [cx, 0.157, cz], x: [dz, 0, -dx], y: [dx, 0, dz],
          thickness: 0.006, smoothing: 1,
          color: i % 2 === 0 ? GOLD : PALE_JADE, bone: root,
        },
      );
    }
    bead(`LotusHeart${s}`, [cx, 0.171, cz + 0.07], 0.034, GOLD, root);
  }
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
    name: "TitlePlaqueBacking", at: [0, 0.079, 1.414], bone: root,
  });
  b.part(new THREE.PlaneGeometry(0.55, 0.098), "#ffffff", {
    name: "QilinTitlePlaque",
    at: [0, 0.079, 1.429], texture: NAMEPLATE, bone: root,
  });
  for (const s of [1, -1]) {
    bead(
      `PlaqueJadeStud${s}`,
      [s * 0.267, 0.079, 1.431],
      0.009,
      "#a9dec5",
      root,
    );
  }
  return b.root;
}
```
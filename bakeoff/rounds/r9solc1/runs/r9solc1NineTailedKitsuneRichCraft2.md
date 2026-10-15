```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  paint,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type {
  Fill,
  Joint,
  PointInput,
  DirectionInput,
  OutlinePoint,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Tsukikage, the Nine-Flame Kitsune",
  description:
    "An ivory shrine guardian with nine curling, crimson-ringed tails, sculptural jade spirit fire, expressive anime eyes, and ceremonial gold ornaments.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction revisions:
   * 1. Curl and plump the nine tails; replace spear tips and thorn-like fur.
   * 2. Enlarge the face, shorten its muzzle, and broaden the fox ears.
   * 3. Replace flat flame plates with volumetric, curling spirit fire.
   * 4. Give the crimson a quiet lacquer-like finish, and expose flank markings.
   * 5. Strengthen the chest ruff and remove the distracting straight back trim.
   * The detached sparks are intentional spirit embers.
   */

  const b = createBuilder({
    name: "Tsukikage",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(90417);

  const C = {
    ink: "#251d36",
    wine: "#621d39",
    red: "#c9344c",
    ivory: "#fff0d3",
    white: "#fffbed",
    gold: "#e9bc65",
    goldLight: "#ffe7a3",
    teal: "#148eaa",
    cyan: "#34d9dc",
    mint: "#a8fff0",
    fireCore: "#effff0",
    stoneLight: "#424967",
    dark: "#191d35",
  };

  const COAT = paint((p, n) => {
    const warmth = 0.66 + n.y * 0.21 + noise(p, 0.12, 11) * 0.13;
    const col = mix("#c8d0e7", "#fff1d5", warmth);
    return mix(col, "#ffffff", Math.max(0, noise(p, 0.013, 17) - 0.57) * 0.13);
  });
  const PALE = paint((p, n) =>
    mix("#d0d7e6", "#fffbed", 0.73 + n.y * 0.15 + noise(p, 0.09, 4) * 0.12),
  );
  const VERMILION = paint((p, n) =>
    mix(
      "#a52646",
      "#ed5867",
      0.43 + Math.max(0, n.y) * 0.30 + noise(p, 0.18, 9) * 0.14,
    ),
  );
  const GOLD = paint((p, n) =>
    mix(
      "#a66c38",
      "#ffe5a0",
      0.49 + 0.3 * Math.max(0, n.y) + 0.2 * noise(p, 0.035, 5),
    ),
  );
  const STONE = paint((p, n) =>
    mix(
      n.y > 0.5 ? "#303957" : "#1c223c",
      n.y > 0.5 ? "#4b5672" : "#343a55",
      noise(p, 0.25, 31) * 0.8,
    ),
  );

  // ---------------------------------------------------------------------------
  // Drawings: jade eyes, fox-fire seals, embroidered trim and shrine calligraphy.
  // ---------------------------------------------------------------------------

  const EYE = svg(
    `<svg viewBox="0 0 160 140">
      <defs>
        <clipPath id="eye">
          <path d="M12 72 Q51 29 98 47 Q126 52 148 39
                   Q137 92 91 105 Q44 112 12 72Z"/>
        </clipPath>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#145578"/>
          <stop offset=".53" stop-color="#26bfc9"/>
          <stop offset="1" stop-color="#befff0"/>
        </linearGradient>
      </defs>
      <path d="M7 69 Q50 23 99 42 Q131 46 155 29
               Q141 100 93 110 Q41 118 7 69Z" fill="#76253f"/>
      <path d="M12 72 Q51 29 98 47 Q126 52 148 39
               Q137 92 91 105 Q44 112 12 72Z" fill="#fff9e8"/>
      <g clip-path="url(#eye)">
        <ellipse cx="84" cy="74" rx="30" ry="40" fill="url(#iris)"/>
        <path d="M84 40 Q72 73 84 104 Q96 73 84 40Z" fill="#192940"/>
        <path d="M58 94 Q84 112 109 91" fill="none"
              stroke="#e7fff0" stroke-width="5"/>
        <ellipse cx="70" cy="57" rx="10" ry="13" fill="#ffffff"/>
        <circle cx="99" cy="84" r="5" fill="#ffffff"/>
        <circle cx="103" cy="72" r="2.8" fill="#ffffff"/>
      </g>
      <path d="M10 71 Q52 26 99 44 Q128 49 153 33"
            fill="none" stroke="#251d36" stroke-width="7"
            stroke-linecap="round"/>
      <path d="M17 101 Q49 124 75 119" fill="none"
            stroke="#d14050" stroke-width="5" stroke-linecap="round"/>
      <path d="M34 27 Q72 10 113 25" fill="none"
            stroke="#bf3047" stroke-width="8" stroke-linecap="round"/>
      <path d="M42 20 Q71 10 90 15" fill="none"
            stroke="#ffe5ac" stroke-width="3"/>
      <path d="M23 111 l-6 10 M34 116 l-5 10" stroke="#ed8c87"
            stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  const FOREHEAD = svg(
    `<svg viewBox="0 0 100 150">
      <path d="M50 6 L74 45 L61 79 L50 105 L39 79 L26 45Z"
            fill="#bd304a"/>
      <path d="M50 21 L61 46 L50 73 L39 46Z" fill="#ffbd94"/>
      <path d="M50 29 L55 46 L50 59 L45 46Z" fill="#fff1ca"/>
      <path d="M17 83 Q50 123 83 83 Q73 130 50 137
               Q27 130 17 83Z" fill="#e9bc65"/>
      <path d="M50 111 L57 126 L50 142 L43 126Z" fill="#fff2b2"/>
      <circle cx="17" cy="66" r="5" fill="#bd304a"/>
      <circle cx="83" cy="66" r="5" fill="#bd304a"/>
    </svg>`,
    { size: 256 },
  );

  const FLANK = svg(
    `<svg viewBox="0 0 180 180">
      <path d="M34 146 Q19 100 49 56 Q77 20 133 32
               Q94 38 80 62 Q132 45 153 88
               Q165 119 137 141 Q114 158 86 144
               Q115 144 126 122 Q143 91 109 83
               Q84 77 70 100 Q55 126 77 153
               Q48 144 48 115 Q37 130 34 146Z"
            fill="#c3344b"/>
      <path d="M91 104 Q116 89 125 110 Q128 127 109 129"
            fill="none" stroke="#fff1d3" stroke-width="7"
            stroke-linecap="round"/>
      <path d="M55 53 L68 32 L79 42 L65 65Z" fill="#e7b75e"/>
      <circle cx="147" cy="48" r="7" fill="#c3344b"/>
      <circle cx="157" cy="63" r="4" fill="#c3344b"/>
    </svg>`,
    { size: 384 },
  );

  const TAIL_SIGIL = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 5 L65 43 L40 81 L15 43Z" fill="#a52b47"/>
      <path d="M40 15 L56 43 L40 68 L24 43Z" fill="#f7d784"/>
      <path d="M40 26 L48 43 L40 58 L32 43Z" fill="#42cbd0"/>
      <path d="M40 80 L40 123 M24 98 L40 113 L56 98"
            fill="none" stroke="#c2384e" stroke-width="6"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 125 L48 140 L40 155 L32 140Z" fill="#e5b75f"/>
    </svg>`,
    { size: 256 },
  );

  const FABRIC = svg(
    `<svg viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#a92c47"/>
      <path d="M0 7 H256 M0 57 H256" stroke="#f3d38b" stroke-width="4"/>
      <path d="M0 32 L16 17 L32 32 L48 17 L64 32 L80 17 L96 32
               L112 17 L128 32 L144 17 L160 32 L176 17 L192 32
               L208 17 L224 32 L240 17 L256 32"
            stroke="#e45b69" stroke-width="3" fill="none"/>
      <path d="M0 32 L16 47 L32 32 L48 47 L64 32 L80 47 L96 32
               L112 47 L128 32 L144 47 L160 32 L176 47 L192 32
               L208 47 L224 32 L240 47 L256 32"
            stroke="#f5cf86" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const PENDANT = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#24455c"
              stroke="#f6d488" stroke-width="5"/>
      <circle cx="50" cy="50" r="37" fill="none"
              stroke="#5fc9c7" stroke-width="3"/>
      <path d="M50 15 L67 44 L50 76 L33 44Z"
            fill="#e7fbdc" stroke="#e5b75f" stroke-width="3"/>
      <path d="M50 27 L57 44 L50 59 L43 44Z" fill="#26bcc6"/>
      <path d="M16 56 Q25 76 41 80 M84 56 Q75 76 59 80"
            fill="none" stroke="#e5b75f" stroke-width="4"/>
      <circle cx="50" cy="87" r="3" fill="#e5b75f"/>
    </svg>`,
    { size: 256 },
  );

  let circleTicks = "";
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const x = 256 + Math.sin(angle) * 213;
    const y = 256 + Math.cos(angle) * 213;
    circleTicks += `<path d="M${x - 4} ${y} l4 -8 l4 8 l-4 8Z"
      fill="${i % 3 === 0 ? "#edc779" : "#54aeb8"}"/>`;
  }

  const MAGIC_CIRCLE = svg(
    `<svg viewBox="0 0 512 512">
      <g fill="none" stroke="#4b9cae">
        <circle cx="256" cy="256" r="246" stroke-width="3"/>
        <circle cx="256" cy="256" r="233" stroke-width="2"/>
        <circle cx="256" cy="256" r="191" stroke-width="3"/>
        <circle cx="256" cy="256" r="170" stroke-width="2"/>
        <path d="M256 86 L403 341 L109 341Z" stroke-width="3"/>
        <path d="M256 426 L109 171 L403 171Z" stroke-width="3"/>
      </g>
      ${circleTicks}
      <path d="M256 195 L283 240 L256 294 L229 240Z"
            fill="none" stroke="#d4b86e" stroke-width="4"/>
    </svg>`,
    { size: 768 },
  );

  const OFUDA = svg(
    `<svg viewBox="0 0 80 220">
      <path d="M4 4 H76 V213 L40 204 L4 213Z"
            fill="#fff0ca" stroke="#d9b56e" stroke-width="5"/>
      <path d="M15 25 H65 M20 33 H60" stroke="#c2384e" stroke-width="4"/>
      <g fill="none" stroke="#ac2842" stroke-width="6"
         stroke-linecap="square" stroke-linejoin="miter">
        <path d="M40 47 V166 M24 59 H57 L25 85 H56
                 M20 103 H61 M27 93 V128 H55 V93
                 M21 145 L40 128 L60 145 M23 163 L40 148 L58 169"/>
      </g>
      <path d="M40 179 L49 190 L40 201 L31 190Z" fill="#c2384e"/>
    </svg>`,
    { size: 384 },
  );

  const PLAQUE = svg(
    `<svg viewBox="0 0 600 150">
      <rect x="3" y="3" width="594" height="144" rx="12"
            fill="#352437" stroke="#e7bc6c" stroke-width="6"/>
      <path d="M23 25 H142 M458 25 H577 M23 125 H142 M458 125 H577"
            stroke="#b65d54" stroke-width="3"/>
      <text x="300" y="69" font-family="serif" font-size="53"
            text-anchor="middle" fill="#fff0c6">九 尾</text>
      <text x="300" y="112" font-family="serif" font-size="24"
            letter-spacing="5" text-anchor="middle"
            fill="#e6bb70">NINE-FLAME GUARDIAN</text>
      <path d="M34 65 L47 80 L34 95 L21 80Z
               M566 65 L579 80 L566 95 L553 80Z" fill="#48b8bd"/>
    </svg>`,
    { size: 768 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton. Tail chains are independent, and every toe remains separated.
  // ---------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.85, -0.53],
      [0, 0.91, -0.15],
      [0, 0.96, 0.28],
    ],
    {
      parent: root,
      names: ["hips", "spine1", "chest"],
      role: "spine",
    },
  );
  const hips = spine.joints[0];
  const chest = spine.tip!;

  const neck = b.chain(
    "neck",
    [
      [0, 0.96, 0.28],
      [0, 1.15, 0.48],
      [0, 1.37, 0.73],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.37, 0.73],
    dir: [0, 0, 1],
    role: "head",
  });

  const H = 1.12;
  const face = b.region({ at: head, scale: H, bone: head });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: face.p([0, -0.095, 0.12]),
    dir: [0, -0.035, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: face.p([0, -0.183, 0.105]),
    dir: [0, -0.035, 1],
    role: "jaw",
  });

  const earBones = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: face.p([s * 0.17, 0.205, -0.03]),
      dir: [s * 0.18, 1, -0.12],
      role: "hinge",
    }),
  );

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [true, false].map((front) => {
      const tag = `${front ? "F" : "H"}${side}`;
      const x = s * (front ? 0.235 : 0.285);
      const z = front ? 0.49 : -0.53;
      const points = front
        ? [
            [x, 0.91, 0.30],
            [x, 0.56, 0.40],
            [x, 0.255, 0.47],
            [x, 0.185, z],
          ]
        : [
            [x, 0.84, -0.48],
            [x, 0.59, -0.25],
            [x, 0.34, -0.64],
            [x, 0.185, z],
          ];

      const chain = b.chain(`leg${tag}`, points, {
        parent: front ? chest : hips,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `paw${tag}`]
          : [`hip${tag}`, `knee${tag}`, `hock${tag}`, `paw${tag}`],
        role: "leg",
        contact: [x, 0.12, z + 0.04],
      });

      const toes = [-1, 0, 1].map((k, i) =>
        b.chain(
          `toe${tag}${i + 1}`,
          [
            [x + k * 0.058, 0.173, z + 0.055],
            [x + k * 0.073, 0.17, z + 0.165 - Math.abs(k) * 0.015],
          ],
          {
            parent: chain.tip!,
            names: [`toe${tag}${i + 1}`],
            role: "digit",
          },
        ),
      );
      return { s, front, tag, x, z, chain, toes };
    });
  });

  const tails = Array.from({ length: 9 }, (_, i) => {
    const a = ((i - 4) * 20 * Math.PI) / 180;
    const sway = 0.105;
    const point = (r: number, angle: number, z: number) => [
      r * Math.sin(angle),
      0.91 + r * Math.cos(angle),
      z,
    ];
    const points = [
      point(0.12, a * 0.42, -0.61),
      point(0.43, a * 0.86 - 0.045, -0.96),
      point(0.90, a - sway, -1.21),
      point(1.36, a + sway * 0.55, -1.46 + Math.sin(a) * 0.09),
      point(1.66, a + sway, -1.47 + Math.sin(a) * 0.12),
      point(1.77, a + sway * 0.28, -1.25 + Math.sin(a) * 0.15),
      point(1.75, a - sway * 0.40, -1.075 + Math.sin(a) * 0.16),
    ];
    const chain = b.chain(`tail${i + 1}`, catmull(points), {
      parent: hips,
      count: 5,
      names: (j: number) => `tail${i + 1}_${j + 1}`,
      role: "tail",
    });
    return { i, a, chain };
  });

  // ---------------------------------------------------------------------------
  // Primitive helpers.
  // ---------------------------------------------------------------------------

  const ball = (
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint = root,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at,
      scale: size,
      bone,
      flat: true,
      name,
    });

  const box = (
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint = root,
    rotation: number[] = [0, 0, 0],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
    });

  const disc = (
    at: PointInput,
    radius: number,
    depth: number,
    color: Fill,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      bone,
      dir,
    });

  const drawing = (
    texture: THREE.Texture,
    at: PointInput,
    width: number,
    height: number,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), C.white, {
      at,
      bone,
      texture,
      axis: "z",
      dir,
      up: [0, 1, 0],
    });

  const ellipse = (
    center: number[],
    rx: number,
    rz: number,
    count: number,
  ) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i * Math.PI * 2) / count;
      return [
        center[0] + rx * Math.sin(a),
        center[1],
        center[2] + rz * Math.cos(a),
      ];
    });

  const tuftOutline: OutlinePoint[] = [
    [-0.045, 0.025],
    [0.045, 0.025],
    [0.078, -0.065],
    [0.038, -0.055],
    [0.012, -0.195, "sharp"],
    [-0.054, -0.10],
  ];

  const hangingTuft = (
    at: PointInput,
    width: number,
    length: number,
    color: Fill,
    bone: Joint,
    lean = 0,
    depth = 0.045,
  ) =>
    b.extrude(
      tuftOutline.map(
        ([x, y, sharp]): OutlinePoint =>
          sharp
            ? [x * width, y * length, sharp]
            : [x * width, y * length],
      ),
      {
        at,
        x: [1, 0, 0],
        y: [lean, 1, 0],
        thickness: depth * width,
        bevel: 0.008,
        color,
        bone,
      },
    );

  const tassel = (at: number[], bone: Joint, scale = 1) => {
    disc(at, 0.022 * scale, 0.028 * scale, GOLD, bone, [0, 1, 0], 8);
    for (let k = -1; k <= 1; k++) {
      b.sweep(
        [
          [at[0] + k * 0.012 * scale, at[1] - 0.01 * scale, at[2]],
          [
            at[0] + k * 0.021 * scale,
            at[1] - 0.105 * scale,
            at[2] + 0.012 * scale,
          ],
        ],
        [0.009 * scale, 0.005 * scale],
        { bone, color: k === 0 ? C.gold : VERMILION, sides: 5 },
      );
    }
  };

  // A sculptural S-shaped flame, readable from the side as well as the front.
  const spiritFire = (
    at: THREE.Vector3,
    bone: Joint,
    scale: number,
    lean: number,
    embers: boolean,
  ) => {
    const p = (x: number, y: number, z: number) =>
      at.clone().add(new THREE.Vector3(
        (x + lean * y) * scale,
        y * scale,
        z * scale,
      ));

    const outerPath = catmull([
      p(0, 0.014, 0),
      p(-0.028, 0.085, 0),
      p(-0.022, 0.157, -0.008),
      p(0.027, 0.245, 0.003),
      p(0.044, 0.322, 0.009),
      p(0.025, 0.406, 0),
    ]);
    glow(
      b.sweep(
        outerPath,
        [0.025 * scale, 0.083 * scale, 0.064 * scale, 0.045 * scale, 0.023 * scale, 0],
        {
          color: C.teal,
          bone,
          sides: 7,
          smooth: false,
          caps: { start: "round", end: "point" },
          name: "spiritFireOuter",
        },
      ),
      1.05,
    );

    // The luminous center is a real volume; dark teal remains as an outer rim.
    glow(
      b.sweep(
        catmull([
          p(0.003, 0.016, 0.026),
          p(-0.018, 0.083, 0.033),
          p(-0.004, 0.151, 0.033),
          p(0.030, 0.231, 0.024),
          p(0.040, 0.322, 0.011),
        ]),
        [0.014 * scale, 0.057 * scale, 0.044 * scale, 0.024 * scale, 0],
        {
          color: C.cyan,
          bone,
          sides: 7,
          smooth: false,
          caps: { start: "round", end: "point" },
          name: "spiritFireJade",
        },
      ),
      1.2,
    );

    for (const side of [1, -1]) {
      glow(
        b.sweep(
          catmull([
            p(0.005, 0.020, side * 0.050),
            p(0.007, 0.075, side * 0.071),
            p(-0.003, 0.13, side * 0.069),
            p(0.012, 0.203, side * 0.042),
          ]),
          (t) => {
            const r = Math.sin(Math.PI * t) * 0.031 * scale;
            return [r, r * 0.62];
          },
          {
            color: side > 0 ? C.fireCore : C.mint,
            bone,
            sides: 6,
            smooth: false,
            caps: "point",
            name: "spiritFireHeart",
          },
        ),
        side > 0 ? 1.6 : 1.1,
      );
    }

    glow(
      b.sweep(
        bezier(
          p(-0.042, 0.04, 0),
          p(-0.154, 0.115, 0.005),
          p(-0.117, 0.225, -0.003),
          p(-0.07, 0.29, 0),
        ),
        [0.026 * scale, 0],
        {
          color: C.mint,
          bone,
          sides: 5,
          caps: "point",
          name: "spiritFireWisp",
        },
      ),
      1.1,
    );

    if (embers) {
      for (let j = 0; j < 2; j++) {
        glow(
          b.part(new THREE.OctahedronGeometry((j ? 0.017 : 0.022) * scale), C.mint, {
            at: p(j ? 0.10 : -0.11, j ? 0.44 : 0.32, 0.012),
            bone,
            scale: [0.7, 1.6, 0.65],
            rotation: [0, 20, j ? -23 : 28],
            name: "spiritEmber",
          }),
          1.25,
        );
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Body and four planted legs.
  // ---------------------------------------------------------------------------

  const body = b.loft(
    [
      { at: [0, 0.85, -0.59], w: 0.32, h: 0.35 },
      { at: hips, w: 0.45, h: 0.44 },
      { at: spine.joints[1], w: 0.43, h: 0.43 },
      { at: chest, w: 0.49, h: 0.49 },
      { at: [0, 0.98, 0.39], w: 0.35, h: 0.36 },
    ],
    { color: COAT, bone: spine, sides: 10, smooth: false },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.215 - t * 0.047, 0.195 - t * 0.038],
    { color: COAT, sides: 10, smooth: false },
  );

  for (const leg of legs) {
    const { chain, front, x, z, s, toes } = leg;
    const legPaint = paint((p, n) => {
      if (p.y < 0.35) return VERMILION;
      if (p.y < 0.372) return GOLD;
      return COAT.at(p, n);
    });

    b.sweep(
      chain,
      front ? [0.104, 0.084, 0.059, 0.055] : [0.145, 0.117, 0.06, 0.055],
      { color: legPaint, sides: 8, smooth: false },
    );

    if (!front) {
      const haunch = ball(
        [x * 0.88, 0.79, -0.46],
        [0.17, 0.22, 0.195],
        COAT,
        chain.joints[0],
        `haunch${leg.tag}`,
      );
      const hit = b.surface(haunch).around([x * 0.88, 0.79, -0.46]).at(s * 90, 10);
      if (hit) {
        b.decal(haunch, FLANK, {
          at: hit,
          dir: [s, 0, 0],
          size: [0.235, 0.255],
          mirror: s < 0,
          segments: 9,
          lift: 0.0025,
          bone: chain.joints[0],
          name: `haunchFlame${leg.tag}`,
        });
      }
    }

    const paw = chain.tip!;
    ball(
      [x, 0.185, z + 0.025],
      [0.112, 0.065, 0.145],
      PALE,
      paw,
      `pawVolume${leg.tag}`,
    );

    for (const toe of toes) {
      b.sweep(toe, [0.039, 0.034], {
        color: PALE,
        sides: 6,
        smooth: false,
      });
      const end = toe.at(1).at;
      b.spike(
        toe.at(1),
        [end.x, end.y - 0.018, end.z + 0.043],
        null,
        0.016,
        { color: GOLD, bone: toe.joints[0], sides: 5 },
      );
    }

    const cuffAt = chain.at(front ? 0.77 : 0.84);
    const cuff = b.ring(cuffAt, {
      count: 10,
      radius: front ? 0.063 : 0.064,
    });
    b.sweep(catmull(cuff.items, { closed: true }), 0.009, {
      color: GOLD,
      bone: cuffAt.bone,
      sides: 6,
    });

    const charmAt = [x, 0.405, front ? 0.49 : -0.57];
    disc(charmAt, 0.028, 0.012, GOLD, chain.joints[2]);
    ball(
      [x, charmAt[1], charmAt[2] + 0.011],
      [0.012, 0.02, 0.009],
      C.cyan,
      chain.joints[2],
    );

    if (front) {
      for (let k = 0; k < 2; k++) {
        hangingTuft(
          [x + s * (0.045 + k * 0.035), 0.88 - k * 0.06, 0.37],
          0.7,
          0.83,
          k === 0 ? COAT : PALE,
          chain.joints[0],
          -s * 0.35,
        );
      }
    }
  }

  // Larger fox-fire heraldry on the bare flank, not hidden beneath a joint.
  for (const s of [1, -1]) {
    const hit = b.surface(body).ray([s * 0.8, 0.965, -0.11], [-s, 0, 0]);
    if (hit) {
      b.decal(body, FLANK, {
        at: hit,
        dir: [s, 0, 0],
        size: [0.31, 0.29],
        mirror: s < 0,
        segments: 10,
        bone: spine.joints[1],
        lift: 0.0022,
        name: s > 0 ? "flankFlameL" : "flankFlameR",
      });
    }
  }

  // A substantial ruff, with overlapping, broad fur locks.
  ball(
    [0, 1.075, 0.505],
    [0.235, 0.225, 0.205],
    PALE,
    neck.joints[0],
    "chestRuffCore",
  );
  for (let i = -3; i <= 3; i++) {
    const t = Math.abs(i) / 3;
    hangingTuft(
      [i * 0.065, 1.20 - t * 0.075, 0.697 - t * 0.073],
      1.12 - t * 0.13,
      1.52 - t * 0.28,
      i % 2 === 0 ? PALE : COAT,
      neck.joints[0],
      -i * 0.19,
      0.075,
    );
  }

  // ---------------------------------------------------------------------------
  // Face: a larger head, tapered short muzzle and independent lower jaw.
  // ---------------------------------------------------------------------------

  const skull = ball(
    face.p([0, 0.015, 0]),
    [H * 0.30, H * 0.265, H * 0.265],
    COAT,
    head,
    "skull",
  );

  b.loft(
    [
      { at: face.p([0, -0.095, 0.115]), w: 0.31 * H, h: 0.15 * H },
      { at: face.p([0, -0.105, 0.23]), w: 0.23 * H, h: 0.116 * H },
      { at: face.p([0, -0.11, 0.338]), w: 0.111 * H, h: 0.074 * H },
    ],
    {
      color: PALE,
      bone: upperJaw,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "upperMuzzle",
    },
  );
  b.loft(
    [
      { at: face.p([0, -0.187, 0.105]), w: 0.25 * H, h: 0.086 * H },
      { at: face.p([0, -0.193, 0.225]), w: 0.18 * H, h: 0.066 * H },
      { at: face.p([0, -0.186, 0.31]), w: 0.10 * H, h: 0.055 * H },
    ],
    {
      color: PALE,
      bone: jaw,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "lowerMuzzle",
    },
  );

  box(
    face.p([0, -0.154, 0.245]),
    [0.145 * H, 0.012 * H, 0.137 * H],
    C.wine,
    jaw,
    [3, 0, 0],
  );
  ball(
    face.p([0, -0.150, 0.267]),
    [0.038 * H, 0.006 * H, 0.034 * H],
    "#e68390",
    jaw,
  );

  ball(
    face.p([0, -0.091, 0.345]),
    [0.068 * H, 0.037 * H, 0.038 * H],
    C.ink,
    upperJaw,
    "foxNose",
  );
  ball(
    face.p([-0.017, -0.075, 0.373]),
    [0.019 * H, 0.006 * H, 0.005 * H],
    "#a78697",
    upperJaw,
  );
  b.rod(
    face.p([0, -0.123, 0.361]),
    face.p([0, -0.146, 0.357]),
    0.0055 * H,
    { color: C.wine, bone: upperJaw, sides: 5 },
  );

  for (const s of [1, -1]) {
    b.sweep(
      [
        face.p([0, -0.146, 0.357]),
        face.p([s * 0.052, -0.153, 0.333]),
        face.p([s * 0.091, -0.140, 0.258]),
      ],
      0.0055 * H,
      { color: C.wine, bone: upperJaw, sides: 5 },
    );
    b.spike(
      face.p([s * 0.074, -0.153, 0.270]),
      [s * 0.03, -1, 0.08],
      0.026 * H,
      0.010 * H,
      { color: C.white, bone: upperJaw, sides: 5 },
    );

    b.decal(skull, EYE, {
      at: face.p([s * 0.153, 0.068, 0.235]),
      dir: [s * 0.31, 0.025, 1],
      size: [0.236 * H, 0.207 * H],
      mirror: s > 0,
      segments: 12,
      bone: head,
      lift: 0.0022,
      name: s > 0 ? "eyeL" : "eyeR",
    });

    for (let k = 0; k < 3; k++) {
      const cheek: OutlinePoint[] = [
        [-0.025 * H, 0.018 * H],
        [0.065 * H, 0.036 * H],
        [(0.169 - k * 0.009) * H, -0.027 * H, "sharp"],
        [0.10 * H, -0.047 * H],
        [0.13 * H, -0.094 * H, "sharp"],
        [0.025 * H, -0.066 * H],
      ];
      b.extrude(cheek, {
        at: face.p([
          s * (0.217 - k * 0.013),
          -0.012 - k * 0.047,
          0.125 + k * 0.012,
        ]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.057 * H,
        bevel: 0.008,
        color: k === 1 ? PALE : COAT,
        bone: head,
      });
    }

    b.sweep(
      [
        face.p([s * 0.235, -0.035, 0.185]),
        face.p([s * 0.295, -0.067, 0.178]),
        face.p([s * 0.337, -0.079, 0.165]),
      ],
      [0.014 * H, 0],
      { color: VERMILION, bone: head, sides: 5, caps: "point" },
    );
  }

  b.decal(skull, FOREHEAD, {
    at: face.p([0, 0.175, 0.205]),
    dir: [0, 0.23, 1],
    size: [0.115 * H, 0.185 * H],
    segments: 10,
    bone: head,
    lift: 0.0025,
  });

  // Shorter, broader ears make the silhouette unmistakably fox-like.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = earBones[i];
    const at = face.p([s * 0.17, 0.205, -0.03]);

    const earOutline: OutlinePoint[] = [
      [-0.105 * H, 0],
      [0.145 * H, 0.016 * H],
      [0.104 * H, 0.350 * H, "sharp"],
      [0.010 * H, 0.255 * H],
    ];
    b.extrude(earOutline, {
      at,
      x: [s, 0, 0],
      y: [0, 1, -0.12],
      thickness: 0.095 * H,
      bevel: 0.014,
      color: COAT,
      bone,
    });
    b.extrude(
      [
        [-0.064 * H, 0.041 * H],
        [0.112 * H, 0.051 * H],
        [0.093 * H, 0.294 * H, "sharp"],
        [0.019 * H, 0.220 * H],
      ],
      {
        at: [at.x, at.y, at.z + 0.052 * H],
        x: [s, 0, 0],
        y: [0, 1, -0.12],
        thickness: 0.018 * H,
        bevel: 0.004,
        color: VERMILION,
        bone,
      },
    );
    b.extrude(
      [
        [-0.015 * H, 0.066 * H],
        [0.078 * H, 0.081 * H],
        [0.078 * H, 0.235 * H, "sharp"],
        [0.021 * H, 0.167 * H],
      ],
      {
        at: [at.x, at.y, at.z + 0.065 * H],
        x: [s, 0, 0],
        y: [0, 1, -0.12],
        thickness: 0.012 * H,
        color: "#f39b95",
        bone,
      },
    );
    hangingTuft(
      [at.x + s * 0.027 * H, at.y + 0.145 * H, at.z + 0.082 * H],
      0.67 * H,
      0.62 * H,
      PALE,
      bone,
      -s * 0.35,
    );

    b.rod(
      [at.x + s * 0.005 * H, at.y + 0.145 * H, at.z + 0.069 * H],
      [at.x + s * 0.112 * H, at.y + 0.160 * H, at.z + 0.064 * H],
      0.011 * H,
      { color: GOLD, bone, sides: 6 },
    );
    disc(
      [at.x + s * 0.108 * H, at.y + 0.13 * H, at.z + 0.071 * H],
      0.022 * H,
      0.016 * H,
      GOLD,
      bone,
    );
    tassel(
      [at.x + s * 0.108 * H, at.y + 0.095 * H, at.z + 0.074 * H],
      bone,
      0.64 * H,
    );
  }

  // ---------------------------------------------------------------------------
  // Ceremonial collar: rope, tied loops, backing ribbon, medallion and bell.
  // ---------------------------------------------------------------------------

  const collarLoop = b.surface(neckTube).loop(neck.at(0.45), { lift: 0.012 });
  b.sweep(collarLoop, 0.029, { color: VERMILION, sides: 8 });

  const collarGold = b.surface(neckTube).loop(neck.at(0.45), { lift: 0.041 });
  b.sweep(collarGold, 0.0075, { color: GOLD, sides: 5 });
  b.along(collarGold, 10, (at) => {
    b.stick(new THREE.OctahedronGeometry(0.015), GOLD, at, { embed: 0.15 });
  });

  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 1.095, 0.744],
        [s * 0.101, 1.13, 0.747],
        [s * 0.13, 1.074, 0.763],
        [0, 1.074, 0.774],
      ]),
      0.015,
      { color: VERMILION, bone: neck.joints[0], sides: 6 },
    );
    b.sweep(
      [
        [s * 0.028, 1.069, 0.774],
        [s * 0.091, 0.986, 0.791],
      ],
      0.011,
      { color: VERMILION, bone: neck.joints[0], sides: 6 },
    );
    tassel([s * 0.095, 0.981, 0.791], neck.joints[0], 0.8);
  }

  const ribbon = box(
    [0, 1.038, 0.776],
    [0.15, 0.095, 0.035],
    C.red,
    neck.joints[0],
  );
  b.decal(ribbon, FABRIC, {
    at: [0, 1.038, 0.797],
    dir: [0, 0, 1],
    size: [0.14, 0.062],
    bone: neck.joints[0],
    segments: 4,
  });
  disc([0, 1.008, 0.823], 0.077, 0.026, GOLD, neck.joints[0]);
  drawing(PENDANT, [0, 1.008, 0.838], 0.135, 0.135, neck.joints[0]);
  disc([0, 0.923, 0.828], 0.023, 0.027, GOLD, neck.joints[0]);
  b.rod(
    [-0.014, 0.913, 0.843],
    [0.014, 0.913, 0.843],
    0.0035,
    { color: C.wine, bone: neck.joints[0], sides: 5 },
  );

  // ---------------------------------------------------------------------------
  // Nine plush, forward-curling tails.
  // ---------------------------------------------------------------------------

  const radiusKeys = [
    [0, 0.077],
    [0.20, 0.102],
    [0.40, 0.128],
    [0.60, 0.155],
    [0.74, 0.166],
    [0.85, 0.137],
    [0.94, 0.078],
    [1, 0.018],
  ];
  const tailRadius = (t: number): number => {
    for (let i = 1; i < radiusKeys.length; i++) {
      if (t <= radiusKeys[i][0]) {
        const [t0, r0] = radiusKeys[i - 1];
        const [t1, r1] = radiusKeys[i];
        let f = (t - t0) / (t1 - t0);
        f = f * f * (3 - 2 * f);
        return r0 + (r1 - r0) * f;
      }
    }
    return radiusKeys[radiusKeys.length - 1][1];
  };

  for (const tail of tails) {
    const tube = b.sweep(tail.chain, tailRadius, {
      color: COAT,
      bands: [
        [0.745, COAT],
        [0.905, VERMILION],
        [1, PALE],
      ],
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "round" },
      name: `tailVolume${tail.i + 1}`,
    });

    // Guard hairs follow the tail's flow instead of standing out like spikes.
    for (const t of [0.43, 0.56, 0.68]) {
      for (const side of [-1, 1]) {
        const on = tube.at(t, side * 90);
        const tangent = tail.chain.at(t).tangent;
        const ctrl = on.at.clone()
          .addScaledVector(on.n, 0.055)
          .addScaledVector(tangent, 0.065);
        const tip = on.at.clone()
          .addScaledVector(on.n, 0.041)
          .addScaledVector(tangent, 0.155);
        b.sweep(
          bezier(on, ctrl, tip),
          (u) => [0.037 * (1 - u), 0.017 * (1 - u)],
          {
            color: side > 0 ? PALE : COAT,
            bone: on.bone!,
            sides: 5,
            smooth: false,
            caps: { start: "flat", end: "point" },
            name: "tailGuardFur",
          },
        );
      }
    }

    for (const t of [0.752, 0.895]) {
      const circle = b.ring(tail.chain.at(t), {
        count: 12,
        radius: tailRadius(t) + 0.007,
      });
      b.sweep(polyline(circle.items, { closed: true }), 0.008, {
        color: GOLD,
        sides: 5,
      });
    }

    const jeweled = b.ring(tail.chain.at(0.755), {
      count: 3,
      radius: tailRadius(0.755) + 0.014,
    });
    for (const at of jeweled.items) {
      b.stick(
        new THREE.OctahedronGeometry(0.022),
        C.goldLight,
        at,
        { embed: 0.18, scale: [0.8, 1.1, 0.8] },
      );
    }

    const center = tail.chain.at(0.59).at;
    const sealHit = b.surface(tube).ray(
      [center.x, center.y, center.z + 0.5],
      [0, 0, -1],
    );
    if (sealHit) {
      b.decal(tube, TAIL_SIGIL, {
        at: sealHit,
        dir: [0, 0, 1],
        size: [0.118, 0.228],
        segments: 8,
        bone: sealHit.bone!,
        lift: 0.002,
        roll: -(tail.a * 180) / Math.PI,
        name: `tailSeal${tail.i + 1}`,
      });
    }

    const end = tail.chain.at(1);
    spiritFire(
      end.at.clone().add(new THREE.Vector3(0, -0.009, 0)),
      end.bone!,
      0.82 + 0.10 * Math.cos((tail.i - 4) * 0.45),
      Math.sin(tail.a) * 0.24,
      true,
    );
  }

  // ---------------------------------------------------------------------------
  // A low moon-stone shrine stage, with two votive braziers.
  // ---------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(1, 1.035, 0.12, 12), STONE, {
    at: [0, 0.06, -0.25],
    scale: [1.92, 1, 1.55],
    bone: root,
    name: "moonstoneDais",
  });
  b.sweep(
    polyline(ellipse([0, 0.119, -0.25], 1.875, 1.51, 12), { closed: true }),
    0.012,
    { color: GOLD, bone: root, sides: 5 },
  );
  b.sweep(
    polyline(ellipse([0, 0.025, -0.25], 1.94, 1.566, 12), { closed: true }),
    0.009,
    { color: C.stoneLight, bone: root, sides: 5 },
  );

  glow(
    b.part(new THREE.PlaneGeometry(1.95, 1.95), C.white, {
      at: [0, 0.123, -0.035],
      bone: root,
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: MAGIC_CIRCLE,
      name: "wardingCircle",
    }),
    0.48,
  );

  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    b.part(new THREE.OctahedronGeometry(0.026), i % 3 === 0 ? GOLD : C.stoneLight, {
      at: [1.78 * Math.sin(a), 0.135, -0.25 + 1.41 * Math.cos(a)],
      scale: [0.7, 0.24, 1.5],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: root,
    });
  }

  for (const s of [1, -1]) {
    const x = s * 1.27;
    const z = 0.11;

    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.16, 0.038],
        [0.115, 0.071],
        [0.10, 0.16],
        [0.135, 0.19],
        [0.135, 0.22],
        [0, 0.22],
      ],
      {
        at: [x, 0.12, z],
        segments: 6,
        spin: 30,
        color: STONE,
        bone: root,
      },
    );
    disc([x, 0.332, z], 0.129, 0.025, GOLD, root, [0, 1, 0], 6);
    disc([x, 0.351, z], 0.102, 0.02, C.dark, root, [0, 1, 0], 8);

    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      b.extrude(
        [
          [-0.035, 0],
          [0.035, 0],
          [0.045, 0.075],
          [0, 0.135, "sharp"],
          [-0.045, 0.075],
        ],
        {
          at: [x + 0.085 * Math.sin(a), 0.34, z + 0.085 * Math.cos(a)],
          x: [Math.cos(a), 0, -Math.sin(a)],
          y: [Math.sin(a) * 0.6, 1, Math.cos(a) * 0.6],
          thickness: 0.018,
          color: k % 2 === 0 ? GOLD : C.stoneLight,
          bone: root,
        },
      );
    }

    spiritFire(new THREE.Vector3(x, 0.365, z), root, 0.84, -s * 0.16, false);
    drawing(OFUDA, [x, 0.225, z + 0.132], 0.064, 0.17, root);
    disc([x, 0.302, z + 0.139], 0.012, 0.009, GOLD, root);
  }

  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.60 + random() * 0.80);
    const x = Math.sin(a) * (1.34 + random() * 0.18);
    const z = -0.25 + Math.cos(a) * (1.14 + random() * 0.11);
    const r = 0.045 + random() * 0.038;
    b.part(new THREE.DodecahedronGeometry(r, 0), STONE, {
      at: [x, 0.12 + r * 0.42, z],
      bone: root,
      scale: [1.2, 0.55, 0.95],
      rotation: [12, random() * 120, 17],
      flat: true,
    });
    if (i % 2 === 0) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.013), C.cyan, {
          at: [x, 0.135 + r, z],
          bone: root,
          scale: [0.7, 1.8, 0.7],
        }),
        0.9,
      );
    }
  }

  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.205), C.white, {
      at: [s * 0.58, 0.132, 0.64],
      bone: root,
      axis: "z",
      dir: [0, 1, 0],
      up: [s * 0.4, 0, -1],
      texture: OFUDA,
      name: s > 0 ? "prayerSlipL" : "prayerSlipR",
    });
  }

  box([0, 0.17, 1.054], [0.67, 0.115, 0.14], C.dark, root, [-18, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.62, 0.155), C.white, {
    at: [0, 0.216, 1.127],
    bone: root,
    dir: [0, 0.38, 1],
    up: [0, 1, 0],
    axis: "z",
    texture: PLAQUE,
    name: "guardianCartouche",
  });
  for (const s of [1, -1]) {
    ball(
      [s * 0.288, 0.229, 1.131],
      [0.012, 0.012, 0.008],
      GOLD,
      root,
    );
  }

  return b.root;
}
```
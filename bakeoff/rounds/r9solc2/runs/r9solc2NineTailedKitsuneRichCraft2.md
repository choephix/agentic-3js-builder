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
    "An ivory nine-tailed fox guardian with sweeping ceremonial tails, jade spirit flames, luminous anime eyes, and a moonstone shrine.",
};

export default function build(): THREE.Object3D {
  /*
   * 1. Replace the upright, plank-like ears with broad, outward-swept fox ears.
   *    Lengthen the tapered muzzle slightly and give the eyes a brighter,
   *    more assured expression.
   * 2. Build the chest ruff as a substantial tapered volume with flowing side
   *    locks, rather than a row of thin, beard-like plates.
   * 3. Tighten the enormous tail fan, soften its forward hooks, narrow the
   *    crimson bands, and seat its fittings directly on the actual tail skin.
   *    The nine tails remain individually readable.
   * 4. Warm the ivory, enrich the lacquer crimson, and repeat the jade-and-gold
   *    motif through the face, collar, tails and setting.
   * 5. Retain the dimensional spirit fire and its intentionally detached
   *    embers. Keep the low shrine stage and the clear front view.
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
    const warmth = 0.73 + n.y * 0.15 + noise(p, 0.14, 11) * 0.10;
    const col = mix("#d6c9d5", "#fff1d5", warmth);
    return mix(col, "#ffffff", Math.max(0, noise(p, 0.017, 17) - 0.57) * 0.10);
  });
  const PALE = paint((p, n) =>
    mix("#dad2df", "#fffbed", 0.79 + n.y * 0.11 + noise(p, 0.09, 4) * 0.08),
  );
  const VERMILION = paint((p, n) =>
    mix(
      "#9e2945",
      "#eb5263",
      0.48 + Math.max(0, n.y) * 0.24 + noise(p, 0.18, 9) * 0.10,
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
  // Ten reusable drawings.
  // ---------------------------------------------------------------------------

  const EYE = svg(
    `<svg viewBox="0 0 160 140">
      <defs>
        <clipPath id="eye">
          <path d="M12 73 Q43 39 83 44 Q120 46 147 39
                   Q136 92 91 102 Q44 109 12 73Z"/>
        </clipPath>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#17577b"/>
          <stop offset=".50" stop-color="#27c6cf"/>
          <stop offset="1" stop-color="#befff0"/>
        </linearGradient>
      </defs>
      <path d="M7 71 Q42 32 84 38 Q122 43 156 29
               Q141 99 93 108 Q41 116 7 71Z" fill="#76253f"/>
      <path d="M12 73 Q43 39 83 44 Q120 46 147 39
               Q136 92 91 102 Q44 109 12 73Z" fill="#fff9e8"/>
      <g clip-path="url(#eye)">
        <ellipse cx="81" cy="71" rx="29" ry="39" fill="url(#iris)"/>
        <path d="M81 38 Q71 70 81 102 Q92 70 81 38Z" fill="#192940"/>
        <path d="M56 91 Q81 108 106 89" fill="none"
              stroke="#e7fff0" stroke-width="5"/>
        <ellipse cx="68" cy="54" rx="10" ry="12" fill="#ffffff"/>
        <circle cx="96" cy="82" r="5" fill="#ffffff"/>
        <circle cx="101" cy="69" r="2.8" fill="#ffffff"/>
      </g>
      <path d="M10 72 Q43 34 84 40 Q121 45 153 33"
            fill="none" stroke="#251d36" stroke-width="6"
            stroke-linecap="round"/>
      <path d="M137 43 L154 24 L149 43" fill="#251d36"/>
      <path d="M18 100 Q46 118 70 114" fill="none"
            stroke="#d14050" stroke-width="4" stroke-linecap="round"/>
      <path d="M35 23 Q73 15 112 22" fill="none"
            stroke="#bf3047" stroke-width="7" stroke-linecap="round"/>
      <path d="M43 18 Q71 13 91 17" fill="none"
            stroke="#ffe5ac" stroke-width="3"/>
      <path d="M24 108 l-5 9 M35 112 l-4 9" stroke="#ed8c87"
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
  // Skeleton first.
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
    at: face.p([0, -0.176, 0.105]),
    dir: [0, -0.035, 1],
    role: "jaw",
  });

  const earBones = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: face.p([s * 0.17, 0.205, -0.03]),
      dir: [s * 0.36, 1, -0.14],
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
    const sway = 0.075;
    const point = (r: number, angle: number, z: number) => [
      r * Math.sin(angle),
      0.91 + r * Math.cos(angle),
      z,
    ];
    const points = [
      point(0.12, a * 0.42, -0.61),
      point(0.40, a * 0.86 - 0.025, -0.91),
      point(0.80, a - sway, -1.13),
      point(1.20, a + sway * 0.55, -1.34 + Math.sin(a) * 0.07),
      point(1.49, a + sway, -1.36 + Math.sin(a) * 0.10),
      point(1.60, a + sway * 0.28, -1.20 + Math.sin(a) * 0.12),
      point(1.59, a - sway * 0.40, -1.045 + Math.sin(a) * 0.13),
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
  // Reusable primitive assemblies.
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

  const furLock = (
    points: PointInput[],
    width: number,
    depth: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) =>
    b.sweep(
      catmull(points),
      (t) => {
        const fullness = Math.pow(1 - t, 0.62);
        return [width * fullness, depth * fullness];
      },
      {
        color,
        bone,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        name,
      },
    );

  // Sculptural fire with a dark outer body and three luminous inner volumes.
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

    glow(
      b.sweep(
        catmull([
          p(0, 0.014, 0),
          p(-0.028, 0.085, 0),
          p(-0.022, 0.157, -0.008),
          p(0.027, 0.245, 0.003),
          p(0.044, 0.322, 0.009),
          p(0.025, 0.406, 0),
        ]),
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
      front ? [0.110, 0.088, 0.062, 0.058] : [0.145, 0.117, 0.064, 0.058],
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
      [0.115, 0.065, 0.145],
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
      radius: front ? 0.067 : 0.068,
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
      furLock(
        [
          [x + s * 0.027, 0.93, 0.33],
          [x + s * 0.078, 0.85, 0.33],
          [x + s * 0.091, 0.74, 0.30],
        ],
        0.061,
        0.038,
        PALE,
        chain.joints[0],
        `shoulderFur${leg.tag}`,
      );
    }
  }

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

  // The ruff has a real side silhouette and a broad pointed bib.
  b.loft(
    [
      { at: [0, 1.255, 0.54], w: 0.30, h: 0.22 },
      { at: [0, 1.15, 0.55], w: 0.44, h: 0.32 },
      { at: [0, 1.025, 0.555], w: 0.405, h: 0.285 },
      { at: [0, 0.905, 0.555], w: 0.235, h: 0.18 },
      { at: [0, 0.835, 0.56], w: 0.045, h: 0.055 },
    ],
    {
      color: PALE,
      bone: neck.joints[0],
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "chestRuffVolume",
    },
  );

  for (const s of [1, -1]) {
    for (let j = 0; j < 3; j++) {
      furLock(
        [
          [s * (0.13 + j * 0.009), 1.235 - j * 0.067, 0.50],
          [s * (0.235 + j * 0.010), 1.15 - j * 0.067, 0.44],
          [s * (0.28 - j * 0.012), 1.055 - j * 0.071, 0.36],
        ],
        0.067 - j * 0.005,
        0.055,
        j === 1 ? COAT : PALE,
        neck.joints[0],
        `ruffSide${s > 0 ? "L" : "R"}${j}`,
      );
    }
  }

  for (let i = -2; i <= 2; i++) {
    const t = Math.abs(i) / 2;
    furLock(
      [
        [i * 0.060, 1.18 - t * 0.025, 0.68 - t * 0.035],
        [i * 0.067, 1.04 - t * 0.025, 0.705 - t * 0.03],
        [i * 0.055, 0.858 + t * 0.053, 0.62],
      ],
      0.055,
      0.035,
      i % 2 === 0 ? PALE : COAT,
      neck.joints[0],
      "ruffFrontLock",
    );
  }

  // ---------------------------------------------------------------------------
  // Face: tapered muzzle, almond eyes, cheek fans and independent lower jaw.
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
      { at: face.p([0, -0.102, 0.255]), w: 0.218 * H, h: 0.116 * H },
      { at: face.p([0, -0.105, 0.376]), w: 0.101 * H, h: 0.071 * H },
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
      { at: face.p([0, -0.179, 0.105]), w: 0.25 * H, h: 0.086 * H },
      { at: face.p([0, -0.183, 0.245]), w: 0.17 * H, h: 0.066 * H },
      { at: face.p([0, -0.176, 0.345]), w: 0.09 * H, h: 0.052 * H },
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
    face.p([0, -0.148, 0.265]),
    [0.14 * H, 0.012 * H, 0.148 * H],
    C.wine,
    jaw,
    [3, 0, 0],
  );
  ball(
    face.p([0, -0.144, 0.285]),
    [0.034 * H, 0.006 * H, 0.034 * H],
    "#e68390",
    jaw,
  );

  ball(
    face.p([0, -0.086, 0.383]),
    [0.060 * H, 0.033 * H, 0.034 * H],
    C.ink,
    upperJaw,
    "foxNose",
  );
  ball(
    face.p([-0.015, -0.071, 0.408]),
    [0.017 * H, 0.005 * H, 0.005 * H],
    "#a78697",
    upperJaw,
  );
  b.rod(
    face.p([0, -0.113, 0.399]),
    face.p([0, -0.140, 0.392]),
    0.005 * H,
    { color: C.wine, bone: upperJaw, sides: 5 },
  );

  for (const s of [1, -1]) {
    b.sweep(
      [
        face.p([0, -0.140, 0.392]),
        face.p([s * 0.046, -0.146, 0.357]),
        face.p([s * 0.092, -0.131, 0.265]),
      ],
      0.005 * H,
      { color: C.wine, bone: upperJaw, sides: 5 },
    );
    b.spike(
      face.p([s * 0.071, -0.148, 0.285]),
      [s * 0.03, -1, 0.08],
      0.023 * H,
      0.009 * H,
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

    // Two broad silhouette locks, plus a short lower cheek lock.
    for (let k = 0; k < 3; k++) {
      const cheek: OutlinePoint[] = [
        [-0.025 * H, 0.025 * H],
        [0.061 * H, 0.038 * H],
        [(0.158 - k * 0.012) * H, -0.034 * H, "sharp"],
        [0.080 * H, -0.073 * H],
        [0.020 * H, -0.065 * H],
      ];
      b.extrude(cheek, {
        at: face.p([
          s * (0.218 - k * 0.010),
          -0.008 - k * 0.047,
          0.127 + k * 0.009,
        ]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.081 * H,
        bevel: 0.012,
        color: k === 1 ? PALE : COAT,
        bone: head,
      });
    }

    b.sweep(
      [
        face.p([s * 0.235, -0.035, 0.194]),
        face.p([s * 0.289, -0.064, 0.189]),
        face.p([s * 0.329, -0.078, 0.176]),
      ],
      [0.013 * H, 0],
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

  // Broad triangular ears, with explicit front-facing inner layers.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = earBones[i];
    const at = face.p([s * 0.17, 0.205, -0.03]);

    b.extrude(
      [
        [-0.110 * H, -0.016 * H],
        [0.146 * H, 0.012 * H],
        [0.174 * H, 0.296 * H, "sharp"],
      ],
      {
        at,
        x: [s, 0, 0],
        y: [0, 1, -0.14],
        thickness: 0.105 * H,
        bevel: 0.015,
        color: COAT,
        bone,
      },
    );
    b.extrude(
      [
        [-0.057 * H, 0.032 * H],
        [0.115 * H, 0.050 * H],
        [0.142 * H, 0.245 * H, "sharp"],
      ],
      {
        at: [at.x, at.y, at.z + 0.058 * H],
        x: [s, 0, 0],
        y: [0, 1, -0.14],
        thickness: 0.018 * H,
        bevel: 0.004,
        color: VERMILION,
        bone,
      },
    );
    b.extrude(
      [
        [-0.012 * H, 0.063 * H],
        [0.090 * H, 0.072 * H],
        [0.119 * H, 0.198 * H, "sharp"],
      ],
      {
        at: [at.x, at.y, at.z + 0.070 * H],
        x: [s, 0, 0],
        y: [0, 1, -0.14],
        thickness: 0.012 * H,
        color: "#f39b95",
        bone,
      },
    );
    hangingTuft(
      [at.x + s * 0.025 * H, at.y + 0.119 * H, at.z + 0.080 * H],
      0.57 * H,
      0.42 * H,
      PALE,
      bone,
      -s * 0.40,
      0.07,
    );

    b.rod(
      [at.x + s * 0.048 * H, at.y + 0.112 * H, at.z + 0.068 * H],
      [at.x + s * 0.127 * H, at.y + 0.120 * H, at.z + 0.064 * H],
      0.009 * H,
      { color: GOLD, bone, sides: 6 },
    );
    disc(
      [at.x + s * 0.130 * H, at.y + 0.097 * H, at.z + 0.073 * H],
      0.020 * H,
      0.016 * H,
      GOLD,
      bone,
    );
    ball(
      [at.x + s * 0.130 * H, at.y + 0.097 * H, at.z + 0.084 * H],
      [0.009 * H, 0.012 * H, 0.007 * H],
      C.cyan,
      bone,
    );
    tassel(
      [at.x + s * 0.130 * H, at.y + 0.068 * H, at.z + 0.075 * H],
      bone,
      0.54 * H,
    );
  }

  // ---------------------------------------------------------------------------
  // Ceremonial collar, bow, embroidered ribbon and medallion.
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
        [0, 1.095, 0.754],
        [s * 0.101, 1.13, 0.757],
        [s * 0.13, 1.074, 0.773],
        [0, 1.074, 0.784],
      ]),
      0.015,
      { color: VERMILION, bone: neck.joints[0], sides: 6 },
    );
    b.sweep(
      [
        [s * 0.028, 1.069, 0.784],
        [s * 0.091, 0.986, 0.801],
      ],
      0.011,
      { color: VERMILION, bone: neck.joints[0], sides: 6 },
    );
    tassel([s * 0.095, 0.981, 0.801], neck.joints[0], 0.8);
  }

  const ribbon = box(
    [0, 1.038, 0.786],
    [0.15, 0.095, 0.035],
    C.red,
    neck.joints[0],
  );
  b.decal(ribbon, FABRIC, {
    at: [0, 1.038, 0.807],
    dir: [0, 0, 1],
    size: [0.14, 0.062],
    bone: neck.joints[0],
    segments: 4,
  });
  disc([0, 1.008, 0.833], 0.077, 0.026, GOLD, neck.joints[0]);
  drawing(PENDANT, [0, 1.008, 0.848], 0.135, 0.135, neck.joints[0]);
  disc([0, 0.923, 0.838], 0.023, 0.027, GOLD, neck.joints[0]);
  b.rod(
    [-0.014, 0.913, 0.853],
    [0.014, 0.913, 0.853],
    0.0035,
    { color: C.wine, bone: neck.joints[0], sides: 5 },
  );

  // ---------------------------------------------------------------------------
  // Nine individually rigged tails. Trim follows the skin, not an ideal circle.
  // ---------------------------------------------------------------------------

  const radiusKeys = [
    [0, 0.077],
    [0.20, 0.099],
    [0.40, 0.120],
    [0.60, 0.144],
    [0.74, 0.153],
    [0.85, 0.131],
    [0.94, 0.074],
    [1, 0.021],
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
        [0.785, COAT],
        [0.905, VERMILION],
        [1, PALE],
      ],
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "round" },
      name: `tailVolume${tail.i + 1}`,
    });

    for (const t of [0.46, 0.63]) {
      for (const side of [-1, 1]) {
        const on = tube.at(t, side * 90);
        const tangent = tail.chain.at(t).tangent;
        const ctrl = on.at.clone()
          .addScaledVector(on.n, 0.039)
          .addScaledVector(tangent, 0.055);
        const tip = on.at.clone()
          .addScaledVector(on.n, 0.027)
          .addScaledVector(tangent, 0.132);
        b.sweep(
          bezier(on, ctrl, tip),
          (u) => [0.034 * (1 - u), 0.016 * (1 - u)],
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

    for (const t of [0.787, 0.901]) {
      const skinRing = Array.from({ length: 20 }, (_, i) =>
        tube.at(t, i * 18, 0.0035),
      );
      b.sweep(polyline(skinRing, { closed: true }), 0.0065, {
        color: GOLD,
        sides: 5,
        name: "tailGoldEdging",
      });
    }

    for (const angle of [0, 120, 240]) {
      b.stick(
        new THREE.OctahedronGeometry(0.018),
        C.goldLight,
        tube.at(0.790, angle, 0.004),
        { embed: 0.25, scale: [0.8, 1.1, 0.8] },
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
        size: [0.108, 0.213],
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
      0.80 + 0.08 * Math.cos((tail.i - 4) * 0.45),
      Math.sin(tail.a) * 0.21,
      true,
    );
  }

  // ---------------------------------------------------------------------------
  // A restrained moonstone shrine stage and a pair of jade-fire votives.
  // ---------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(1, 1.035, 0.12, 12), STONE, {
    at: [0, 0.06, -0.23],
    scale: [1.78, 1, 1.43],
    bone: root,
    name: "moonstoneDais",
  });
  b.sweep(
    polyline(ellipse([0, 0.119, -0.23], 1.738, 1.393, 12), { closed: true }),
    0.012,
    { color: GOLD, bone: root, sides: 5 },
  );
  b.sweep(
    polyline(ellipse([0, 0.025, -0.23], 1.80, 1.45, 12), { closed: true }),
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
      at: [1.64 * Math.sin(a), 0.135, -0.23 + 1.30 * Math.cos(a)],
      scale: [0.7, 0.24, 1.5],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: root,
    });
  }

  for (const s of [1, -1]) {
    const x = s * 1.20;
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
    const x = Math.sin(a) * (1.27 + random() * 0.14);
    const z = -0.23 + Math.cos(a) * (1.03 + random() * 0.10);
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

  box([0, 0.17, 1.015], [0.67, 0.115, 0.14], C.dark, root, [-18, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.62, 0.155), C.white, {
    at: [0, 0.216, 1.088],
    bone: root,
    dir: [0, 0.38, 1],
    up: [0, 1, 0],
    axis: "z",
    texture: PLAQUE,
    name: "guardianCartouche",
  });
  for (const s of [1, -1]) {
    ball(
      [s * 0.288, 0.229, 1.092],
      [0.012, 0.012, 0.008],
      GOLD,
      root,
    );
  }

  return b.root;
}
```
```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  paint,
  svg,
  rng,
} from "agentic-3js-builder";
import type { Joint, Fill } from "agentic-3js-builder";
import { cel, animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aurelia • Phoenix of the First Dawn",
  description:
    "An anime-fantasy phoenix with fully spread, layered flame wings, gilded feather tracery, a radiant crown, and five long fire-plume streamers. Articulated wings, feather fans, jaw, legs, toes and tail are built in a neutral flight-ready standing pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Aurelia", paintSize: 2048 });
  const random = rng(73129);

  const C = {
    ink: "#301629",
    burgundy: "#651d37",
    crimson: "#b6273c",
    coral: "#ed493d",
    orange: "#ff812d",
    honey: "#ffc35e",
    cream: "#fff0ba",
    gold: "#eeb65b",
    charcoal: "#392b3b",
  };

  const RUBY = cel("#bf2b40", "#72233c");
  const RED = cel("#ed493d", "#aa293c");
  const ORANGE = cel("#ff922f", "#e0532f");
  const GOLD = cel("#ffd16a", "#d58a43");
  const PALE = cel("#fff0b6", "#f6b75e");
  const DARK = cel("#50263c", "#291b31");
  const LEG = cel("#d99a54", "#96503c");
  const TALON = cel("#42303f", "#251c30");

  // All the drawings are shared. Large shapes remain geometry; the drawings
  // supply the delicate gilded linework characteristic of elemental fantasy art.
  const eyeDrawing = animeEye({
    iris: "#ffb736",
    irisLight: "#fff1a2",
    irisDark: "#d94931",
    ink: C.ink,
    blush: false,
    brow: false,
    size: 384,
  });

  const featherDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 320">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 304 C42 242 60 173 49 76 C45 43 49 23 52 12"
          stroke="#8d3336" stroke-width="8"/>
        <path d="M50 304 C42 242 60 173 49 76 C45 43 49 23 52 12"
          stroke="#ffe8a0" stroke-width="3.5"/>
        <path d="M49 260 Q16 237 23 203 Q34 224 49 228
          M51 212 Q83 185 77 152 Q65 179 52 181
          M50 161 Q24 142 29 114 Q39 133 50 134
          M50 112 Q69 93 65 65" stroke="#ffc85e" stroke-width="4"/>
        <path d="M34 278 L39 269 M66 241 L61 231 M33 187 L38 180
          M67 132 L62 124" stroke="#fff2bc" stroke-width="3"/>
      </g>
      <path d="M50 51 L58 66 L50 83 L42 66 Z" fill="#fff0b6"/>
    </svg>`,
    { size: 512 },
  );

  const flameDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 320">
      <path d="M48 309 C19 269 21 235 34 203 C13 215 19 172 40 132
        C30 151 39 64 61 9 C56 82 83 114 66 154
        C88 139 83 197 65 220 C86 224 70 286 48 309Z"
        fill="#ffb742"/>
      <path d="M48 293 C34 259 50 228 45 206 C39 178 58 155 54 127
        C71 171 49 195 61 217 C67 242 51 259 48 293Z"
        fill="#fff0a6"/>
      <path d="M49 301 Q43 270 50 244" fill="none"
        stroke="#fff6d0" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const covertDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M49 169 Q38 108 52 15" stroke="#8f3235" stroke-width="8"/>
        <path d="M49 169 Q38 108 52 15" stroke="#ffe397" stroke-width="3.5"/>
        <path d="M47 134 Q22 111 25 82 M47 103 Q75 82 72 55
          M48 76 Q34 63 37 43" stroke="#ffd272" stroke-width="4"/>
      </g>
      <path d="M52 21 L61 39 L51 56 L42 39Z" fill="#fff1ba"/>
    </svg>`,
    { size: 256 },
  );

  const chestDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200">
      <path d="M80 9 C92 55 128 66 121 109 C119 130 104 144 100 155
        C126 146 137 131 139 114 C157 162 119 190 80 194
        C35 187 6 162 22 117 C25 138 42 151 55 151
        C24 111 55 75 66 56 C62 82 70 88 75 89
        C91 63 77 37 80 9Z"
        fill="#fff1b2" stroke="#b66b3c" stroke-width="5"
        stroke-linejoin="round"/>
      <path d="M80 97 C96 123 104 139 96 156 Q89 172 79 177
        Q60 163 65 147 Q67 129 80 97Z" fill="#ff9d34"/>
      <path d="M80 117 Q91 146 79 160 Q72 146 80 117Z" fill="#fff9d2"/>
    </svg>`,
    { size: 384 },
  );

  const cheekDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
      <path d="M9 25 Q53 49 150 16 Q122 50 73 54 L93 68
        Q40 64 9 25Z" fill="#ffcf71" stroke="#9b3a39"
        stroke-width="4" stroke-linejoin="round"/>
      <path d="M28 34 Q80 51 131 29" fill="none"
        stroke="#fff1ba" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const crownDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">
      <path d="M50 8 L70 71 L60 106 L50 190 L40 106 L30 71Z"
        fill="none" stroke="#ffe7a3" stroke-width="5"/>
      <path d="M50 43 L59 76 L50 102 L41 76Z" fill="#fff8cf"/>
      <path d="M50 111 L50 165" stroke="#ffcf65" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  type V = [number, number, number];
  const v = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);

  // -------------------------------------------------------------------------
  // Skeleton. The feather fans have their own roots, allowing a rigger to fan,
  // fold and overlap the primaries without deforming their hard quills.
  // -------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.88, -0.13],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "body",
    [
      [0, 0.88, -0.13],
      [0, 1.12, -0.035],
      [0, 1.37, 0.09],
    ],
    {
      parent: hips,
      names: ["spine", "chest", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.37, 0.09],
      [0, 1.53, 0.20],
      [0, 1.69, 0.32],
    ],
    {
      parent: spine.tip!,
      names: ["neckBase", "neckMid", "neckTop"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.69, 0.32],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.602, 0.405],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const crest = b.joint("crest", {
    parent: head,
    at: [0, 1.84, 0.24],
    dir: [0, 1, -0.2],
    role: "fan",
  });

  const sideRigs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      [
        [s * 0.19, 1.30, 0.015],
        [s * 0.64, 1.53, -0.035],
        [s * 1.12, 1.72, -0.065],
        [s * 1.65, 1.91, -0.12],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );

    const primaryTips: V[] = [
      [1.42, 0.71, -0.13],
      [1.66, 0.78, -0.16],
      [1.89, 0.96, -0.19],
      [2.09, 1.20, -0.19],
      [2.25, 1.47, -0.20],
      [2.32, 1.73, -0.20],
      [2.27, 1.99, -0.20],
      [2.12, 2.22, -0.20],
    ];

    const primaries = primaryTips.map((p, i) => {
      const t = i / (primaryTips.length - 1);
      const root: V = [s * (1.04 + 0.59 * t), 1.67 + 0.22 * t, -0.085];
      const tip: V = [s * p[0], p[1], p[2]];
      const bone = b.joint(`primary${side}${i + 1}`, {
        parent: i < 3 ? wing.joints[2] : wing.tip!,
        at: root,
        aim: tip,
        role: "digit",
      });
      return { root, tip, bone, i };
    });

    const secondaries = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      const root: V = [s * (0.33 + 0.71 * t), 1.385 + 0.30 * t, -0.035];
      const tip: V = [s * (0.48 + 0.83 * t), 0.82 - 0.105 * Math.sin(t * Math.PI), -0.13];
      const bone = b.joint(`secondary${side}${i + 1}`, {
        parent: t < 0.5 ? wing.joints[0] : wing.joints[1],
        at: root,
        aim: tip,
        role: "fan",
      });
      return { root, tip, bone, i };
    });

    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.145, 0.89, -0.12],
        [s * 0.205, 0.59, 0.015],
        [s * 0.215, 0.31, -0.055],
        [s * 0.225, 0.085, 0.055],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.225, 0, 0.15],
      },
    );

    const toes = [-1, 0, 1].map((f) => {
      const base: V = [s * 0.225 + f * 0.023, 0.08, 0.06];
      const knuckle: V = [s * 0.225 + f * 0.075, 0.051, 0.21];
      const tip: V = [s * 0.225 + f * 0.112, 0.032, f === 0 ? 0.355 : 0.303];
      const chain = b.chain(`toe${side}${f + 2}`, [base, knuckle, tip], {
        parent: leg.tip!,
        names: [`toe${side}${f + 2}Base`, `toe${side}${f + 2}Tip`],
        role: "digit",
      });
      return { chain, tip };
    });

    const rearToe = b.chain(
      `rearToe${side}`,
      [
        [s * 0.225, 0.077, 0.03],
        [s * 0.27, 0.043, -0.11],
        [s * 0.285, 0.029, -0.205],
      ],
      { parent: leg.tip!, count: 2, role: "digit" },
    );

    return { s, side, wing, primaries, secondaries, leg, toes, rearToe };
  });

  const tails = [-2, -1, 0, 1, 2].map((i) => {
    const a = Math.abs(i);
    const points: V[] = [
      [i * 0.065, 0.91, -0.30],
      [i * 0.13, 0.74, -0.65],
      [i * 0.24, 0.43 + a * 0.025, -1.02],
      [i * 0.34, 0.30 + a * 0.08, -1.40 + a * 0.12],
      [i * 0.40, 0.53 + a * 0.11, -1.97 + a * 0.21],
    ];
    const chain = b.chain(`tail${i + 3}`, catmull(points), {
      parent: hips,
      count: 5,
      up: [0, 1, 0],
      role: "tail",
    });
    return { i, a, points, chain };
  });

  // -------------------------------------------------------------------------
  // Reusable primitives and flame-shaped feathers.
  // -------------------------------------------------------------------------
  function ellipsoid(
    at: V,
    size: V,
    color: Fill,
    bone: Joint,
    name: string,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale: size,
      bone,
      name,
      flat: true,
    });
  }

  function feather(
    root: V,
    tip: V,
    width: number,
    bone: Joint,
    name: string,
    opts: {
      small?: boolean;
      pale?: boolean;
      fire?: boolean;
      crest?: boolean;
      face?: V;
    } = {},
  ) {
    const start = v(root);
    const axis = v(tip).sub(start);
    const length = axis.length();
    axis.normalize();

    const face = v(opts.face ?? [0, 0, 1]);
    const across = new THREE.Vector3().crossVectors(axis, face).normalize();
    const normal = new THREE.Vector3().crossVectors(across, axis).normalize();
    const thickness = opts.small ? 0.015 : 0.024;

    const silhouette = [
      [-width * 0.14, 0],
      [-width * 0.43, length * 0.18],
      [-width * 0.50, length * 0.42],
      [-width * 0.34, length * 0.65],
      [-width * 0.19, length * 0.81],
      [width * 0.075, length],
      [width * 0.27, length * 0.76],
      [width * 0.46, length * 0.65],
      [width * 0.33, length * 0.57],
      [width * 0.50, length * 0.43],
      [width * 0.40, length * 0.19],
      [width * 0.14, 0],
    ];

    const featherPaint = paint((_p, _n, uv) => {
      const t = uv[1] / length;
      if (opts.pale) return t > 0.70 ? PALE : GOLD;
      if (t > 0.85) return PALE;
      if (t > 0.68) return GOLD;
      return opts.small ? RED : RUBY;
    });

    const blade = b.extrude(silhouette, {
      at: start,
      x: across,
      y: axis,
      thickness,
      bevel: thickness * 0.22,
      color: featherPaint,
      bone,
      name: `${name}_silhouette`,
    });

    const inlayOutline = [
      [-width * 0.085, length * 0.065],
      [-width * 0.29, length * 0.25],
      [-width * 0.30, length * 0.47],
      [-width * 0.13, length * 0.69],
      [width * 0.065, length * 0.94],
      [width * 0.17, length * 0.66],
      [width * 0.28, length * 0.50],
      [width * 0.23, length * 0.29],
      [width * 0.085, length * 0.065],
    ];

    b.extrude(inlayOutline, {
      at: start.clone().addScaledVector(normal, thickness * 0.51),
      x: across,
      y: axis,
      thickness: 0.006,
      color: opts.pale ? PALE : ORANGE,
      bone,
      name: `${name}_flameInlay`,
    });

    const drawing = opts.crest
      ? crownDrawing
      : opts.fire
        ? flameDrawing
        : opts.small
          ? covertDrawing
          : featherDrawing;

    const facePart = b.part(
      new THREE.PlaneGeometry(width * 0.60, length * 0.74),
      "#ffffff",
      {
        at: start
          .clone()
          .addScaledVector(axis, length * 0.48)
          .addScaledVector(normal, thickness * 0.51 + 0.005),
        quat: blade.quat,
        bone,
        texture: drawing,
        name: `${name}_gildedDrawing`,
      },
    );

    if (opts.fire || opts.crest) glow(facePart, 0.65);

    if (!opts.small) {
      b.sweep(
        [
          start.clone().addScaledVector(normal, thickness * 0.65),
          start.clone().addScaledVector(axis, length * 0.36).addScaledVector(normal, thickness * 0.73),
          start.clone().addScaledVector(axis, length * 0.73).addScaledVector(normal, thickness * 0.67),
        ],
        [0.009, 0.005, 0],
        {
          color: opts.pale ? PALE : GOLD,
          sides: 5,
          caps: "flat",
          bone,
          name: `${name}_quill`,
        },
      );
    }

    return blade;
  }

  // -------------------------------------------------------------------------
  // Main mass: a compact bird's trunk and an elegant rising neck.
  // -------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.79, -0.18], w: 0.29, h: 0.28 },
      { at: [0, 0.96, -0.11], w: 0.48, h: 0.43 },
      { at: [0, 1.18, 0.015], w: 0.53, h: 0.45 },
      { at: [0, 1.37, 0.10], w: 0.35, h: 0.32 },
    ],
    {
      bone: spine,
      color: RUBY,
      sides: 10,
      caps: "round",
      name: "body_rubyPlumage",
    },
  );

  b.sweep(
    neck,
    (t) => [0.145 - t * 0.015, 0.14 - t * 0.015],
    {
      color: RED,
      sides: 10,
      name: "neck_risingFlame",
      sectors: [[130, 230, GOLD]],
    },
  );

  const skull = ellipsoid(
    [0, 1.70, 0.335],
    [0.222, 0.225, 0.222],
    RED,
    head,
    "head_facetedSkull",
    16,
  );

  // Face is kept clean: two forward-readable eyes, a raptor's hooked upper
  // beak, and a separate lower mandible.
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around([0, 1.70, 0.335]).at(s * 35, 10);
    const eye = b.stick(
      new THREE.SphereGeometry(1, 12, 8),
      C.ink,
      hit,
      {
        scale: [0.075, 0.028, 0.096],
        embed: 0.18,
        bone: head,
        name: `eye${s > 0 ? "L" : "R"}_socket`,
      },
    );

    b.decal(eye, eyeDrawing, {
      at: eye.at,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.122, 0.164],
      segments: 8,
      lift: 0.002,
      mirror: s > 0,
      bone: head,
      name: `eye${s > 0 ? "L" : "R"}_iris`,
    });

    b.sweep(
      [
        [s * 0.060, 1.803, 0.521],
        [s * 0.126, 1.824, 0.493],
        [s * 0.202, 1.805, 0.432],
      ],
      [0.015, 0.022, 0.005],
      { color: GOLD, sides: 5, bone: head, name: "gilded_brow" },
    );

    const cheek = ellipsoid(
      [s * 0.166, 1.622, 0.405],
      [0.104, 0.070, 0.082],
      RUBY,
      head,
      "cheek_mask",
    );

    b.decal(cheek, cheekDrawing, {
      at: [s * 0.19, 1.635, 0.45],
      dir: [s * 0.45, 0.05, 1],
      size: [0.15, 0.072],
      mirror: s < 0,
      bone: head,
      segments: 6,
      lift: 0.002,
    });

    for (let i = 0; i < 3; i++) {
      feather(
        [s * (0.14 + i * 0.015), 1.655 - i * 0.035, 0.385 - i * 0.012],
        [s * (0.29 + i * 0.028), 1.72 - i * 0.083, 0.23 - i * 0.025],
        0.082,
        head,
        `cheekFeather${s}_${i}`,
        { small: true, pale: i === 0 },
      );
    }
  }

  b.extrude(
    [
      [0, 0.045],
      [0.085, 0.068],
      [0.196, 0.021],
      [0.230, -0.050],
      [0.181, -0.019],
      [0.095, -0.032],
      [0, -0.020],
    ],
    {
      at: [0, 1.637, 0.423],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.113,
      bevel: 0.018,
      color: GOLD,
      bone: head,
      name: "beak_hookedUpper",
    },
  );

  b.extrude(
    [
      [0, 0.007],
      [0.095, 0.011],
      [0.181, 0.023],
      [0.155, -0.013],
      [0.079, -0.028],
      [0, -0.021],
    ],
    {
      at: [0, 1.594, 0.426],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.080,
      bevel: 0.009,
      color: ORANGE,
      bone: jaw,
      name: "beak_lowerMandible",
    },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.056, 1.668, 0.497],
      [0.006, 0.010, 0.017],
      C.burgundy,
      head,
      "nostril",
      6,
    );
  }

  // A forehead lance and five tall crown plumes. The crown grows behind,
  // rather than in front of, the eyes.
  feather(
    [0, 1.772, 0.527],
    [0, 1.938, 0.401],
    0.084,
    head,
    "forehead_lance",
    { small: true, pale: true, crest: true },
  );

  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      [i * 0.060, 1.825 - a * 0.012, 0.255 - a * 0.021],
      [i * 0.105, 2.305 - a * 0.115, 0.12 - a * 0.095],
      0.137 - a * 0.012,
      crest,
      `crown_plume${i + 3}`,
      { crest: true, pale: i === 0 },
    );
  }

  // -------------------------------------------------------------------------
  // Wings. The membrane-like solid base prevents gaps at the arm. Feather
  // blades remain broad, angular primitives, ordered back-to-front.
  // -------------------------------------------------------------------------
  for (const rig of sideRigs) {
    const { s, side, wing } = rig;

    b.sweep(wing, [0.115, 0.112, 0.074, 0.035], {
      color: RUBY,
      sides: 8,
      name: `wing${side}_arm`,
    });

    b.membrane(
      wing,
      [
        [s * 0.22, 1.09, -0.035],
        [s * 0.66, 1.14, -0.08],
        [s * 1.13, 1.39, -0.12],
        [s * 1.65, 1.90, -0.12],
      ],
      {
        bone: wing,
        color: RUBY,
        thickness: 0.038,
        rows: 3,
        cols: 12,
        name: `wing${side}_webOfPlumage`,
      },
    );

    // Outermost first: the overlap reads like real flight feathers.
    for (const f of [...rig.primaries].reverse()) {
      feather(
        f.root,
        f.tip,
        0.245 - f.i * 0.009,
        f.bone,
        `primary${side}${f.i + 1}`,
        { fire: f.i >= 6 },
      );
    }

    for (const f of [...rig.secondaries].reverse()) {
      feather(
        f.root,
        f.tip,
        0.187,
        f.bone,
        `secondary${side}${f.i + 1}`,
      );
    }

    // The ochre coverts form a second, smaller scalloped wing silhouette.
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = 0.28 + t * 1.30;
      const y = 1.38 + t * 0.51;
      feather(
        [s * x, y, 0.035 - t * 0.11],
        [
          s * (x + 0.17 + t * 0.08),
          y - 0.32 + t * 0.17,
          0.035 - t * 0.11,
        ],
        0.16 - t * 0.025,
        wing.jointAt(t),
        `covert${side}${i + 1}`,
        { small: true, pale: i > 5 },
      );
    }

    // A gilded leading edge and a short line of lanceolate shoulder feathers.
    b.sweep(
      [
        [s * 0.20, 1.363, 0.064],
        [s * 0.64, 1.599, 0.025],
        [s * 1.12, 1.770, -0.02],
        [s * 1.65, 1.926, -0.09],
      ],
      [0.029, 0.025, 0.017, 0.004],
      {
        bone: wing,
        color: GOLD,
        sides: 5,
        name: `wing${side}_gildedLeadingEdge`,
      },
    );

    for (let i = 0; i < 4; i++) {
      feather(
        [s * (0.23 + i * 0.11), 1.385 + i * 0.055, 0.091],
        [s * (0.37 + i * 0.125), 1.22 + i * 0.063, 0.107],
        0.108,
        wing.joints[0],
        `shoulder${side}_lance${i}`,
        { small: true, pale: true },
      );
    }

    // Tiny solid tongues at the wing tips carry the brightest flame colour.
    const tipRoot: V = [s * 1.95, 2.03, -0.20];
    glow(
      b.sweep(
        bezier(
          tipRoot,
          [s * 2.13, 2.19, -0.20],
          [s * 2.16, 2.31, -0.23],
        ),
        [0.022, 0.014, 0],
        {
          bone: rig.primaries[7].bone,
          color: "#ffe5a0",
          sides: 5,
          caps: "flat",
          name: `wing${side}_livingFlameTip`,
        },
      ),
      0.8,
    );
  }

  // -------------------------------------------------------------------------
  // Breast. Overlapping downward-pointing feathers, not a smooth breastplate.
  // The bright chest medallion is a natural, ember-like heart feather.
  // -------------------------------------------------------------------------
  const chestSurface = b.surface(body);
  for (let row = 0; row < 3; row++) {
    const count = row === 0 ? 5 : row === 1 ? 5 : 3;
    for (let j = 0; j < count; j++) {
      const u = j - (count - 1) / 2;
      const x = u * (row === 2 ? 0.09 : 0.076);
      const y = 1.35 - row * 0.125;
      const hit = chestSurface.nearest([x, y, 0.42]);
      const start = hit.at.clone().addScaledVector(hit.n, 0.007);
      feather(
        [start.x, start.y, start.z],
        [start.x * 0.84, start.y - 0.205, start.z + 0.022],
        row === 2 ? 0.115 : 0.125,
        hit.bone ?? spine.joints[1],
        `breast_row${row}_feather${j}`,
        { small: true, pale: row === 0 },
      );
    }
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      feather(
        [s * (0.17 + i * 0.014), 1.08 - i * 0.10, 0.06 - i * 0.045],
        [s * (0.32 + i * 0.012), 0.89 - i * 0.10, -0.055 - i * 0.05],
        0.138,
        spine.joints[0],
        `flank${s}_${i}`,
        { small: true },
      );
    }
  }

  const heart = b.part(
    new THREE.OctahedronGeometry(0.103, 0),
    "#ffc667",
    {
      at: [0, 1.253, 0.300],
      scale: [0.77, 1.19, 0.32],
      bone: spine.joints[1],
      name: "heart_amberCrystal",
    },
  );
  glow(heart, 0.45);

  glow(
    b.part(new THREE.PlaneGeometry(0.108, 0.136), "#ffffff", {
      at: [0, 1.255, 0.337],
      bone: spine.joints[1],
      texture: chestDrawing,
      name: "heart_pyroEmblem",
    }),
    0.75,
  );

  // Neck mantle, behind the jaw and below the cheek feathers.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      feather(
        [s * (0.075 + i * 0.024), 1.52 - i * 0.06, 0.245 - i * 0.016],
        [s * (0.13 + i * 0.047), 1.32 - i * 0.065, 0.27 - i * 0.02],
        0.104,
        neck.joints[0],
        `mantle${s}_${i}`,
        { small: true, pale: true },
      );
    }
  }

  // -------------------------------------------------------------------------
  // Legs and feet. Four individually rigged, widely separated digits per foot.
  // The tarsal scales are restrained blocky bands rather than smooth cylinders.
  // -------------------------------------------------------------------------
  for (const rig of sideRigs) {
    const { s, side, leg } = rig;

    b.sweep(leg, [0.079, 0.061, 0.038, 0.038], {
      color: LEG,
      sides: 6,
      name: `leg${side}_scaledCore`,
    });

    b.sweep(leg, [0.105, 0.073], {
      from: 0,
      to: 0.43,
      color: RUBY,
      sides: 8,
      name: `leg${side}_featheredThigh`,
    });

    for (let i = 0; i < 3; i++) {
      feather(
        [s * (0.17 + (i - 1) * 0.04), 0.78, 0.028],
        [s * (0.19 + (i - 1) * 0.055), 0.51 + Math.abs(i - 1) * 0.045, 0.075],
        0.084,
        leg.joints[0],
        `thigh${side}_feather${i}`,
        { small: true },
      );
    }

    for (let i = 0; i < 5; i++) {
      const t = 0.60 + i * 0.075;
      const p = leg.at(t);
      b.part(new THREE.BoxGeometry(0.068 - i * 0.004, 0.024, 0.024), GOLD, {
        at: p.at.clone().add(new THREE.Vector3(0, 0, 0.030)),
        bone: p.bone!,
        rotation: [-12, 0, 0],
        name: `tarsus${side}_scale${i}`,
      });
    }

    ellipsoid(
      [s * 0.225, 0.075, 0.075],
      [0.071, 0.045, 0.070],
      LEG,
      leg.tip!,
      `foot${side}_palm`,
      8,
    );

    for (const { chain, tip } of rig.toes) {
      b.sweep(chain, [0.028, 0.022, 0.015], {
        color: LEG,
        sides: 6,
        name: `${chain.joints[0].name}_skin`,
      });

      const root = v(tip);
      b.sweep(
        bezier(
          root,
          root.clone().add(new THREE.Vector3(0, 0.019, 0.045)),
          root.clone().add(new THREE.Vector3(0, -0.019, 0.080)),
        ),
        [0.018, 0.013, 0],
        {
          color: TALON,
          bone: chain.joints[1],
          sides: 5,
          caps: "flat",
          name: `${chain.joints[0].name}_talon`,
        },
      );

      const jointPoint = chain.at(0.48);
      b.part(new THREE.BoxGeometry(0.043, 0.012, 0.032), GOLD, {
        at: jointPoint.at.clone().add(new THREE.Vector3(0, 0.020, 0)),
        bone: jointPoint.bone!,
        name: `${chain.joints[0].name}_knuckleScale`,
      });
    }

    b.sweep(rig.rearToe, [0.026, 0.018, 0.012], {
      color: LEG,
      sides: 6,
      name: `rearToe${side}_skin`,
    });
    b.sweep(
      [
        [s * 0.285, 0.029, -0.205],
        [s * 0.290, 0.040, -0.240],
        [s * 0.292, 0.012, -0.269],
      ],
      [0.015, 0.011, 0],
      {
        bone: rig.rearToe.joints[1],
        color: TALON,
        sides: 5,
        caps: "flat",
        name: `rearToe${side}_talon`,
      },
    );
  }

  // -------------------------------------------------------------------------
  // Five long tail flames. Continuous skins follow five independent chains.
  // Their broad upper faces carry branching, feather-like flame pigmentation.
  // -------------------------------------------------------------------------
  for (const tail of tails) {
    const { i, a, chain } = tail;

    const tailPaint = paint((_p, _n, uv) => {
      const t = uv[0];
      const angle = ((uv[1] % 360) + 360) % 360;
      const distanceFromTop = Math.min(angle, 360 - angle);
      const wave = Math.sin(t * Math.PI * 17 + distanceFromTop * 0.035);
      if (t > 0.87) return PALE;
      if (distanceFromTop < 24 + 12 * wave) return GOLD;
      if (distanceFromTop < 67 + 15 * wave) return ORANGE;
      return RUBY;
    });

    const widths = (t: number) => {
      // A narrow root, a broad plume, and a final flame-shaped swelling.
      const base =
        0.037 +
        0.073 * Math.sin(Math.PI * Math.min(t / 0.93, 1)) +
        0.032 * Math.exp(-Math.pow((t - 0.77) / 0.13, 2));
      const taper = t > 0.83 ? (1 - t) / 0.17 : 1;
      return Math.max(0.001, base * taper * (1 - a * 0.10));
    };

    const plume = b.sweep(chain, (t) => [widths(t), 0.018 * (1 - t) + 0.003], {
      color: tailPaint,
      sides: 8,
      caps: "flat",
      name: `tail${i + 3}_flameRibbon`,
    });

    b.sweep(plume.line(0, 0.003).slice(0.04, 0.93), [0.008, 0.006, 0.001], {
      color: GOLD,
      bone: chain,
      sides: 5,
      name: `tail${i + 3}_gildedQuill`,
    });

    // The gold flicks are rooted in the ribbon and bend with its joints.
    for (let j = 0; j < 4; j++) {
      const t = 0.32 + j * 0.13;
      const hit = plume.at(t, j % 2 ? 46 : -46, 0.003);
      const p = hit.at;
      const end = chain.at(Math.min(t + 0.13, 0.98)).at;
      b.sweep(
        bezier(
          hit,
          [
            p.x + (j % 2 ? 1 : -1) * widths(t) * 0.55,
            p.y + 0.045,
            p.z - 0.065,
          ],
          [end.x, end.y + 0.027, end.z],
        ),
        [0.007, 0.005, 0],
        {
          bone: hit.bone!,
          color: PALE,
          sides: 5,
          caps: "flat",
          name: `tail${i + 3}_barb${j}`,
        },
      );
    }

    glow(
      b.sweep(plume.line(0, 0.005).slice(0.81, 1), [0.013, 0.009, 0], {
        bone: chain,
        color: "#fff0b4",
        sides: 5,
        caps: "flat",
        name: `tail${i + 3}_emberTip`,
      }),
      0.85,
    );
  }

  // Tail coverts conceal the five streamer roots while retaining separate tips.
  for (let i = -3; i <= 3; i++) {
    feather(
      [i * 0.045, 0.99, -0.22],
      [i * 0.105, 0.77 - Math.abs(i) * 0.015, -0.72 + Math.abs(i) * 0.045],
      0.135,
      hips,
      `rump_covert${i + 4}`,
      { small: true, face: [0, 1, -0.15] },
    );
  }

  // Back mantle: visible from behind as a small, orderly fan of dark-red
  // feathers, with warm gilding concentrated on the upper edges.
  for (let i = -2; i <= 2; i++) {
    feather(
      [i * 0.065, 1.36, -0.07],
      [i * 0.087, 1.02 - random() * 0.035, -0.325],
      0.13,
      spine.joints[1],
      `back_mantle${i + 3}`,
      { small: true, face: [0, 0.25, -1] },
    );
  }

  // A hairline dark lower-beak separation remains readable in the resting pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });

  return b.root;
}
```
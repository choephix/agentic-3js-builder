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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "ABYSS — Breach-class Kraken",
  description:
    "A towering, hero-styled kraken with eight spread, rigged tentacles, chunky ocean-blue carapace, coral armor, luminous eyes and deeply inset suction cups.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "AbyssKraken", paintSize: 2048 });
  const random = rng(31804);

  const C = {
    ink: "#102732",
    deepest: "#122e42",
    navy: "#173e57",
    blue: "#235d75",
    teal: "#237e8a",
    lightTeal: "#53b7b5",
    mint: "#92d7c9",
    pale: "#d1eee0",
    coral: "#ee7051",
    coralLight: "#ffac76",
    coralDark: "#973d3e",
    gold: "#f2bc71",
    cyan: "#71f6e9",
    white: "#e9fff3",
    purple: "#282b45",
    mouth: "#151d2f",
  };

  const skin = paint((p, n) => {
    const variation = noise(p, 0.31, 21);
    const base = mix(C.navy, C.teal, 0.28 + 0.44 * variation);
    return mix(base, C.lightTeal, Math.max(0, n.y) * 0.17);
  });

  const shell = paint((p, n) => {
    const base = mix(C.navy, C.blue, 0.33 + noise(p, 0.7, 14) * 0.4);
    return mix(base, "#498ba0", n.y > 0.45 ? 0.28 : 0);
  });

  const ventral = paint((p, n) => {
    const light = 0.42 + 0.25 * noise(p, 0.29, 8) + 0.18 * n.y;
    return mix("#388f95", C.mint, light);
  });

  const coralShell = paint((p, n) => {
    const base = mix(C.coralDark, C.coral, 0.76 + 0.12 * noise(p, 0.24, 6));
    return mix(base, C.coralLight, Math.max(0, n.y) * 0.33);
  });

  const horn = paint((p, n) =>
    mix("#42576c", "#bfd4d4", 0.28 + 0.34 * Math.max(0, n.z) + 0.15 * noise(p, 0.18, 7)),
  );

  // The eye is a graphic cephalopod slit, not a human eye.
  const eyeTexture = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris">
          <stop offset="0" stop-color="#e1ffcd"/>
          <stop offset=".58" stop-color="#87ffdc"/>
          <stop offset="1" stop-color="#2bbba8"/>
        </radialGradient>
      </defs>
      <path d="M5 52 Q24 5 81 9 Q137 10 155 48 Q135 89 80 93 Q25 90 5 52Z"
        fill="#0d2534" stroke="#163c48" stroke-width="4"/>
      <path d="M16 52 Q35 20 81 21 Q125 19 145 48 Q124 78 80 81 Q35 80 16 52Z"
        fill="url(#iris)"/>
      <g stroke="#249d95" stroke-width="3">
        <path d="M34 33L44 43 M48 25L54 40 M65 22L68 39 M87 22L86 39 M109 27L104 41 M126 34L116 44"/>
        <path d="M34 68L46 59 M53 77L58 62 M76 80L76 63 M99 77L96 62 M121 68L111 59"/>
      </g>
      <path d="M32 46 Q80 37 130 45 L128 55 Q79 65 34 57Z" fill="#102535"/>
      <path d="M36 28 Q58 18 77 24" fill="none" stroke="#effff3"
        stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="120" cy="62" rx="8" ry="4" fill="#eafff1"/>
    </svg>`,
    { size: 512 },
  );

  const cupTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#1d5366"/>
      <circle cx="50" cy="50" r="41" fill="#286e78"/>
      <circle cx="50" cy="50" r="32" fill="#143a50"/>
      <circle cx="50" cy="50" r="21" fill="#102a3e"/>
      <g fill="none" stroke="#57b5af" stroke-width="3">
        <path d="M50 9V23 M71 15L65 27 M87 31L75 37 M91 52H78
                 M82 75L72 67 M62 89L59 76 M36 88L40 75
                 M16 72L27 65 M9 47H22 M22 23L32 33"/>
      </g>
      <path d="M33 41Q48 30 65 40" stroke="#3f8e95" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 192 },
  );

  const crestTexture = svg(
    `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 7L112 37V96L64 151L16 96V37Z"
        fill="#163e51" stroke="#f8b877" stroke-width="5"/>
      <path d="M64 24L95 45V89L64 126L33 89V45Z"
        fill="none" stroke="#ef7455" stroke-width="4"/>
      <path d="M45 63Q46 43 64 42Q82 43 83 63L77 83H51Z" fill="#a7e7d6"/>
      <path d="M52 82Q31 101 43 112 M60 82L55 119 M68 82L73 119 M76 82Q97 101 85 112"
        fill="none" stroke="#a7e7d6" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 61H59 M69 61H76" stroke="#153d50" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const gillTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 16L100 8L114 31L31 42Z M14 51L107 40L114 62L25 77Z
               M21 86L108 73L105 95L38 117Z" fill="#102c40"/>
      <path d="M29 34L99 22 M27 67L101 54 M38 105L97 88"
        stroke="#58c8c2" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const stripeTexture = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 18L34 32L8 46 M40 18L66 32L40 46 M72 18L98 32L72 46"
        fill="none" stroke="#f6c491" stroke-width="9" stroke-linejoin="miter"/>
    </svg>`,
    { size: 192 },
  );

  const scarTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8L45 53L39 72L64 119 M68 16L70 48L88 83"
        fill="none" stroke="#102e42" stroke-width="8"/>
      <path d="M37 9L50 52L44 71L69 117 M73 17L75 47L93 81"
        fill="none" stroke="#7ab4bb" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  // Skeleton: the body is raised; all eight arms are separated and
  // extended into a neutral radial rigging pose.
  const hips = b.joint("hips", {
    at: [0, 2.63, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 2.63, 0],
      [0, 3.35, -0.05],
      [0, 4.35, -0.17],
    ],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 3.95, 0.13],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.94, 0.73],
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  const mantleChain = b.chain(
    "mantle",
    [
      [0, 4.15, -0.18],
      [0, 5.25, -0.38],
      [0, 6.32, -0.55],
      [0, 6.84, -0.67],
    ],
    { parent: head, names: ["mantle1", "mantle2", "mantleTip"], role: "spine" },
  );

  const arms = Array.from({ length: 8 }, (_, i) => {
    const angle = ((22.5 + i * 45) * Math.PI) / 180;
    const ux = Math.sin(angle);
    const uz = Math.cos(angle);
    const side = ux > 0 ? "L" : "R";
    const reach = 4.62 + (Math.abs(ux) > 0.8 ? 0.38 : 0);
    const curl = i % 2 === 0 ? 0.17 : -0.17;

    const at = (r: number, y: number, tangentOffset = 0) => [
      ux * r + uz * tangentOffset,
      y,
      uz * r - ux * tangentOffset,
    ];

    const points = [
      at(0.83, 2.68),
      at(1.48, 2.29),
      at(2.18, 1.57),
      at(2.86, 0.76),
      at(3.55, 0.30),
      at(reach - 0.37, 0.38, curl),
      at(reach + 0.08, 0.95 + (i % 2) * 0.23, curl * 1.4),
      at(reach - 0.03, 1.65 + (i % 2) * 0.27, curl * 1.9),
    ];

    const path = catmull(points);
    const chain = b.chain(`tentacle${i + 1}${side}`, path, {
      parent: hips,
      count: 7,
      role: "tentacle",
      names: (j) => `tentacle${i + 1}${side}_${j + 1}`,
    });

    return { i, angle, ux, uz, at, path, chain };
  });

  const leftFin = b.joint("finL", {
    parent: head,
    at: [1.05, 4.32, -0.17],
    dir: [1, 0.25, -0.2],
    role: "fan",
  });
  const rightFin = b.joint("finR", {
    parent: head,
    at: [-1.05, 4.32, -0.17],
    dir: [-1, 0.25, -0.2],
    role: "fan",
  });

  type Bone = typeof hips;
  type Fill = Parameters<typeof b.part>[1];

  function ellipsoid(
    name: string,
    at: number[],
    scale: number[],
    color: Fill,
    bone: Bone,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });
  }

  function frontPlate(
    name: string,
    outline: number[][],
    at: number[],
    thickness: number,
    color: Fill,
    bone: Bone,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: Math.min(thickness * 0.25, 0.045),
      detail: 0.65,
      color,
      bone,
      name,
    });
  }

  function bolt(at: number[], bone: Bone, radius = 0.045, direction = [0, 0, 1]) {
    return b.part(new THREE.CylinderGeometry(radius, radius, 0.026, 6), C.gold, {
      at,
      bone,
      dir: direction,
      name: "CarapaceAnchor",
    });
  }

  // One simple, massive base silhouette.
  const torso = b.sweep(
    spine,
    (t) => [1.09 + 0.18 * Math.sin(t * Math.PI), 0.92 + 0.1 * Math.sin(t * Math.PI)],
    {
      color: skin,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "MuscularArmCrown",
    },
  );

  const skull = ellipsoid(
    "BroadFacetedSkull",
    [0, 3.91, 0.12],
    [1.39, 1.29, 1.12],
    skin,
    head,
    16,
  );

  b.sweep(
    mantleChain,
    (t) => {
      const rx = [1.25, 1.36, 0.90, 0.06];
      const ry = [1.03, 1.10, 0.75, 0.055];
      const q = Math.min(2.99999, t * 3);
      const k = Math.floor(q);
      const f = q - k;
      return [
        rx[k] * (1 - f) + rx[k + 1] * f,
        ry[k] * (1 - f) + ry[k + 1] * f,
      ];
    },
    {
      color: shell,
      sides: 10,
      smooth: false,
      caps: { start: "flat", end: "round" },
      name: "ToweringMantle",
    },
  );

  // Richly shaped face, unobstructed by the crest and side fins.
  const eyeMounts: ReturnType<typeof ellipsoid>[] = [];
  for (const s of [1, -1]) {
    const orbit = ellipsoid(
      `RaisedEyeSocket${s > 0 ? "L" : "R"}`,
      [s * 0.76, 3.91, 1.015],
      [0.60, 0.39, 0.31],
      C.deepest,
      head,
      12,
    );

    ellipsoid(
      "CoralEyeSurround",
      [s * 0.77, 3.92, 1.14],
      [0.535, 0.314, 0.205],
      coralShell,
      head,
      12,
    );

    const lens = ellipsoid(
      "RecessedEye",
      [s * 0.765, 3.925, 1.27],
      [0.465, 0.257, 0.125],
      C.ink,
      head,
      16,
    );
    eyeMounts.push(orbit);

    const eye = b.decal(lens, eyeTexture, {
      at: [s * 0.765, 3.925, 1.395],
      dir: [0, 0, 1],
      size: [0.89, 0.50],
      segments: 12,
      lift: 0.004,
      mirror: s < 0,
      bone: head,
      name: "LuminousHorizontalPupil",
    });
    glow(eye, 0.72);

    const browOutline = [
      [0.19, 0.01],
      [0.37, 0.26],
      [0.97, 0.39],
      [1.31, 0.22],
      [1.35, 0.04],
      [0.92, 0.14],
      [0.47, 0.04],
    ].map(([x, y]) => [x * s, y]);

    frontPlate(
      "HeavyAngularBrow",
      browOutline,
      [0, 4.05, 1.14],
      0.27,
      shell,
      head,
    );

    b.rod(
      [s * 0.44, 4.17, 1.305],
      [s * 1.05, 4.32, 1.305],
      0.029,
      { bone: head, color: C.lightTeal, sides: 4, name: "BrowBevelHighlight" },
    );

    frontPlate(
      "CheekGuard",
      [
        [s * 0.43, 0.15],
        [s * 1.17, 0.30],
        [s * 1.37, 0.03],
        [s * 1.04, -0.41],
        [s * 0.63, -0.27],
      ],
      [0, 3.42, 0.98],
      0.23,
      shell,
      head,
    );

    frontPlate(
      "CheekCoralInset",
      [
        [s * 0.82, 0.16],
        [s * 1.13, 0.20],
        [s * 1.19, 0.04],
        [s * 0.98, -0.21],
        [s * 0.85, -0.15],
      ],
      [0, 3.42, 1.111],
      0.035,
      coralShell,
      head,
    );

    bolt([s * 1.11, 3.49, 1.145], head, 0.039);
    bolt([s * 0.76, 3.23, 1.145], head, 0.035);

    for (let j = 0; j < 3; j++) {
      glow(
        ellipsoid(
          "CheekPhotophore",
          [s * (1.18 - j * 0.12), 3.77 - j * 0.10, 1.20],
          [0.034, 0.028, 0.021],
          C.cyan,
          head,
          6,
        ),
        0.9,
      );
    }
  }

  // Bridge and separate hooked upper/lower beaks.
  frontPlate(
    "CentralNasalKeel",
    [
      [-0.22, 0.48],
      [0.22, 0.48],
      [0.28, 0.16],
      [0.17, -0.25],
      [0, -0.45],
      [-0.17, -0.25],
      [-0.28, 0.16],
    ],
    [0, 3.78, 1.11],
    0.30,
    shell,
    head,
  );

  ellipsoid(
    "MouthInterior",
    [0, 2.995, 1.025],
    [0.48, 0.39, 0.30],
    C.mouth,
    head,
  );

  b.extrude(
    [
      [-0.26, 0.25],
      [0.13, 0.39],
      [0.51, 0.23],
      [0.67, -0.05],
      [0.53, -0.38],
      [0.40, -0.16],
      [0.09, -0.02],
      [-0.25, -0.01],
    ],
    {
      at: [0, 3.14, 1.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.40, 0.60],
      bevel: 0.055,
      color: horn,
      bone: head,
      name: "UpperHookedBeak",
    },
  );

  b.extrude(
    [
      [-0.24, 0.02],
      [0.17, -0.19],
      [0.49, -0.09],
      [0.61, 0.10],
      [0.51, -0.30],
      [0.20, -0.42],
      [-0.21, -0.26],
    ],
    {
      at: [0, 2.92, 1.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.40,
      bevel: 0.04,
      color: C.purple,
      bone: jaw,
      name: "ArticulatedLowerBeak",
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), C.coralDark, {
      at: [s * 0.40, 2.99, 0.99],
      bone: jaw,
      dir: [s, 0, 0],
      name: "JawHinge",
    });
    bolt([s * 0.435, 2.99, 0.99], jaw, 0.064, [s, 0, 0]);
  }

  // Frontal crest: broad panels with clear dark seams and warm accents.
  const forehead = frontPlate(
    "ForeheadShield",
    [
      [-0.73, -0.45],
      [-0.88, 0.11],
      [-0.59, 0.67],
      [0, 1.02],
      [0.59, 0.67],
      [0.88, 0.11],
      [0.73, -0.45],
      [0.33, -0.62],
      [0, -0.40],
      [-0.33, -0.62],
    ],
    [0, 4.86, 0.89],
    0.20,
    shell,
    head,
  );

  frontPlate(
    "CoralCrestRacingStripe",
    [
      [-0.20, -0.42],
      [-0.30, 0.12],
      [-0.18, 0.74],
      [0, 0.94],
      [0.18, 0.74],
      [0.30, 0.12],
      [0.20, -0.42],
      [0, -0.26],
    ],
    [0, 4.86, 1.008],
    0.044,
    coralShell,
    head,
  );

  b.part(new THREE.PlaneGeometry(0.33, 0.42), "#ffffff", {
    at: [0, 4.86, 1.038],
    bone: head,
    texture: crestTexture,
    name: "KrakenHeraldry",
  });

  for (const s of [1, -1]) {
    bolt([s * 0.64, 4.62, 1.01], head, 0.044);
    bolt([s * 0.58, 5.24, 1.01], head, 0.039);

    b.decal(forehead, scarTexture, {
      at: [s * 0.50, 4.98, 1.01],
      dir: [0, 0, 1],
      size: [0.23, 0.42],
      segments: 3,
      bone: head,
      mirror: s < 0,
      name: "ShieldBattleScoring",
    });
  }

  // A line of overlapping rear mantle plates preserves the simple
  // squid silhouette, while giving it a strong armored hero treatment.
  for (let j = 0; j < 5; j++) {
    const t = 0.16 + j * 0.155;
    const center = mantleChain.at(t);
    const width = 1.03 * (1 - t) + 0.20;
    const y = center.at.y;
    const z = center.at.z;
    frontPlate(
      "RearMantleChevron",
      [
        [-width, -0.18],
        [-width * 1.05, 0.14],
        [0, 0.42],
        [width * 1.05, 0.14],
        [width, -0.18],
        [0, 0.02],
      ],
      [0, y, z - (1.0 - t * 0.7)],
      0.16,
      j % 2 ? C.navy : shell,
      center.bone!,
    );
  }

  b.sweep(
    bezier(
      [0, 5.57, 0.40],
      [0, 6.44, 0.15],
      [0, 6.98, -0.63],
    ),
    (t) => [0.16 * (1 - t) + 0.014, 0.12 * (1 - t) + 0.014],
    {
      color: coralShell,
      bone: mantleChain,
      sides: 5,
      smooth: false,
      caps: "round",
      name: "CrestLeadingEdge",
    },
  );

  // Paired mantle fins: wide, thick polygonal silhouettes rather than
  // thin hair-like decoration.
  for (const s of [1, -1]) {
    const finBone = s > 0 ? leftFin : rightFin;
    const fin = b.extrude(
      [
        [0, -0.30],
        [0.20, -0.64],
        [0.71, -0.55],
        [1.18, -0.12],
        [1.02, 0.28],
        [0.43, 1.17],
        [0.06, 0.77],
      ],
      {
        at: [s * 1.03, 4.34, -0.23],
        x: [s, 0, -0.24],
        y: [0, 1, 0],
        thickness: 0.19,
        bevel: 0.036,
        color: shell,
        bone: finBone,
        name: "BroadMantleFin",
      },
    );

    b.extrude(
      [
        [0.20, -0.40],
        [0.39, -0.44],
        [0.92, -0.10],
        [0.79, 0.19],
        [0.40, 0.86],
        [0.30, 0.47],
      ],
      {
        at: [s * 1.03, 4.34, -0.105],
        x: [s, 0, -0.24],
        y: [0, 1, 0],
        thickness: 0.047,
        bevel: 0.012,
        color: coralShell,
        bone: finBone,
        name: "FinCoralFlash",
      },
    );

    b.decal(fin, gillTexture, {
      at: [s * 1.57, 4.48, -0.12],
      dir: [0, 0, 1],
      size: [0.48, 0.71],
      segments: 4,
      mirror: s < 0,
      bone: finBone,
      name: "MantleGillSlits",
    });

    for (let j = 0; j < 3; j++) {
      b.sweep(
        [
          [s * (1.13 + j * 0.12), 4.22 + j * 0.17, -0.09],
          [s * (1.64 + j * 0.07), 4.19 + j * 0.20, -0.21],
        ],
        [0.035, 0.017],
        {
          bone: finBone,
          color: C.deepest,
          sides: 5,
          name: "FinStructuralRib",
        },
      );
    }
  }

  // Webbing between roots makes the eight arms read as a single animal.
  for (let i = 0; i < arms.length; i++) {
    const a = arms[i];
    const next = arms[(i + 1) % arms.length];

    b.membrane(a.chain.path.slice(0, 0.21), next.chain.path.slice(0, 0.21), {
      color: ventral,
      bone: hips,
      thickness: 0.075,
      scallop: 0.20,
      rows: 3,
      cols: 6,
      name: "InterbrachialWeb",
    });
  }

  // Arm radius profile is keyed identically for all eight chains.
  const radiusKeys = [0.56, 0.48, 0.36, 0.265, 0.205, 0.15, 0.095, 0.012];
  function armRadius(t: number): number {
    const q = Math.min(6.999999, Math.max(0, t) * 7);
    const j = Math.floor(q);
    const f = q - j;
    return radiusKeys[j] * (1 - f) + radiusKeys[j + 1] * f;
  }

  const armTubes = arms.map((arm) =>
    b.sweep(arm.chain, armRadius, {
      color: skin,
      sides: 10,
      smooth: false,
      caps: { start: "flat", end: "round" },
      sectors: [[-70, 70, ventral]],
      name: `TentacleSkin${arm.i + 1}`,
    }),
  );

  // The sucker lip has real depth and a dark recessed textured throat.
  // Its local normal is +Y so all components seat on the same surface frame.
  function sucker(
    hit: ReturnType<(typeof armTubes)[number]["at"]>,
    radius: number,
    index: number,
  ) {
    const pad = b.stick(
      new THREE.CylinderGeometry(radius * 0.90, radius * 0.72, radius * 0.55, 10),
      index % 4 === 0 ? coralShell : ventral,
      hit,
      {
        embed: 0.22,
        name: "SuckerPedestal",
      },
    );

    const rimAt = hit.at.clone().addScaledVector(hit.n, radius * 0.53);
    const torus = new THREE.TorusGeometry(radius * 0.73, radius * 0.22, 5, 12);
    torus.rotateX(Math.PI / 2);

    b.part(torus, index % 4 === 0 ? C.coralLight : C.pale, {
      at: rimAt,
      bone: hit.bone!,
      dir: hit.n,
      name: "ThickSuctionLip",
    });

    const wellAt = hit.at.clone().addScaledVector(hit.n, radius * 0.43);
    b.part(new THREE.CircleGeometry(radius * 0.69, 12), "#ffffff", {
      at: wellAt,
      dir: hit.n,
      axis: "z",
      texture: cupTexture,
      bone: hit.bone!,
      name: "RecessedSuctionWell",
    });

    return pad;
  }

  for (const arm of arms) {
    const tube = armTubes[arm.i];

    // Two clear rows, shrinking toward the curled tips.
    for (let j = 0; j < 10; j++) {
      const t = 0.13 + j * 0.077;
      const radius = armRadius(t) * (j < 2 ? 0.43 : 0.48);
      for (const side of [1, -1]) {
        const hit = tube.at(t, side * 34);
        sucker(hit, radius, j);
      }
    }

    // Small single terminal cups keep the end uncluttered.
    for (let j = 0; j < 2; j++) {
      const t = 0.91 + j * 0.042;
      sucker(tube.at(t, 0), armRadius(t) * 0.57, j + 1);
    }

    // Wide overlapping side guards leave the entire sucker bed readable.
    for (let j = 0; j < 4; j++) {
      const t = 0.10 + j * 0.115;
      const r = armRadius(t);
      for (const side of [1, -1]) {
        const hit = tube.at(t, side * 112);
        const panel = b.stick(
          new THREE.BoxGeometry(r * 1.28, 0.10 + r * 0.13, 0.43 - j * 0.035),
          j === 0 ? coralShell : shell,
          hit,
          {
            flow: hit.tangent,
            embed: 0.38,
            name: "TentacleLateralArmor",
          },
        );

        b.stick(
          new THREE.CylinderGeometry(0.037, 0.037, 0.022, 6),
          C.gold,
          frame(
            hit.at.clone().addScaledVector(hit.n, 0.12),
            hit.n,
            hit.tangent,
          ),
          {
            bone: hit.bone!,
            embed: 0.5,
            name: "ArmGuardFastener",
          },
        );

        if (j === 0) {
          const face = b.surface(panel).nearest(
            hit.at.clone().addScaledVector(hit.n, 0.45),
          );
          b.decal(panel, stripeTexture, {
            at: face,
            dir: hit.n,
            up: hit.tangent,
            size: [0.34, 0.18],
            segments: 2,
            lift: 0.003,
            bone: hit.bone!,
            name: "ArmGuardChevrons",
          });
        }
      }
    }

    // Photophores run down the outside flanks, between armor and cups.
    for (let j = 0; j < 6; j++) {
      const t = 0.37 + j * 0.092;
      for (const side of [1, -1]) {
        const hit = tube.at(t, side * 82);
        glow(
          b.stick(
            new THREE.SphereGeometry(1, 6, 4),
            C.cyan,
            hit,
            {
              scale: [
                0.038 * (1 - t) + 0.012,
                0.018,
                0.075 * (1 - t) + 0.018,
              ],
              flow: hit.tangent,
              embed: 0.46,
              name: "TentaclePhotophore",
            },
          ),
          1.15,
        );
      }
    }
  }

  // Intentional large-scale markings and pores, not noisy all-over detail.
  const bodySurface = b.surface([skull, torso]);
  const pores = bodySurface.scatter(25, {
    rng: random,
    minDist: 0.17,
    filter: (hit) =>
      hit.at.y > 3.25 &&
      hit.at.y < 4.65 &&
      hit.at.z < 0.56 &&
      Math.abs(hit.at.x) > 0.57,
  });

  for (const hit of pores) {
    b.stick(
      new THREE.CylinderGeometry(0.055, 0.065, 0.019, 6),
      C.deepest,
      hit,
      { embed: 0.5, name: "MantleSensoryPore" },
    );
    glow(
      b.stick(
        new THREE.CylinderGeometry(0.020, 0.023, 0.023, 6),
        C.lightTeal,
        hit,
        { embed: 0.05, name: "PoreLight" },
      ),
      0.5,
    );
  }

  // Two rows of chunky vent ridges on the rear of the head.
  for (const s of [1, -1]) {
    for (let j = 0; j < 4; j++) {
      b.sweep(
        bezier(
          [s * 0.36, 3.55 + j * 0.27, -0.91],
          [s * 0.73, 3.62 + j * 0.27, -1.10],
          [s * 1.02, 3.83 + j * 0.24, -0.73],
        ),
        [0.075, 0.045],
        {
          bone: head,
          color: j === 3 ? coralShell : C.blue,
          sides: 5,
          smooth: false,
          name: "RearGillRidge",
        },
      );
    }
  }

  // A visible underslung siphon is an important cephalopod identity cue.
  b.sweep(
    [
      [0, 2.81, 0.46],
      [0, 2.49, 1.02],
      [0, 2.47, 1.38],
    ],
    [0.29, 0.25, 0.23],
    {
      bone: hips,
      color: ventral,
      sides: 10,
      caps: { start: "round", end: "flat" },
      name: "MuscularSiphon",
    },
  );

  b.part(new THREE.TorusGeometry(0.215, 0.057, 5, 12), C.lightTeal, {
    at: [0, 2.47, 1.40],
    bone: hips,
    name: "SiphonLip",
  });
  b.part(new THREE.CircleGeometry(0.184, 12), C.deepest, {
    at: [0, 2.47, 1.405],
    bone: hips,
    name: "SiphonOpening",
  });

  // Exact grounding after the extended arms are complete. No environment
  // or pedestal: the kraken itself supplies its broad contact footprint.
  const root = b.root;
  const bounds = new THREE.Box3().setFromObject(root, true);
  root.position.y -= bounds.min.y;

  return root;
}
```
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostfang — Northern Gray Wolf",
  description:
    "An alert northern wolf with a powerful tapered silhouette, sculpted silver winter fur, watchful amber eyes, and a weathered frost-rune outcrop.",
};

/*
  1. Replace the raised, triangular fur plates with rooted, solid tapered locks.
     The mane should read as carved winter fur, not a row of dorsal armour fins.
  2. Remove the helmet-like forehead colour boundary and the pendant-shaped
     throat patch. Give the face a silver mask and the chest a coherent pale bib.
  3. Shorten the ears and muzzle, enlarge the readable amber eyes slightly,
     and narrow the mouth opening: alert and formidable rather than startled.
  4. Strengthen the shoulder-to-waist taper, soften the tubular limb transitions,
     and give the tail a less exaggerated, naturally descending silhouette.
  5. Replace the rectangular display-board effect with a bevelled, fractured
     outcrop. Keep the rune and frost details low, quiet, and secondary.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(8317);

  const C = {
    charcoal: "#30404e",
    deep: "#3a4c5d",
    dark: "#526a7b",
    slate: "#758c9c",
    gray: "#94a6b0",
    silver: "#bdcbd0",
    light: "#d5dfe0",
    cream: "#dce5e4",
    ivory: "#eee8d5",
    black: "#14222e",
    mouth: "#352c36",
    claw: "#34424e",
    snow: "#e5eff0",
    snowShade: "#b3cad6",
    ice: "#a1d3df",
  };

  const coat = paint((p, n) => {
    const grain = noise(
      new THREE.Vector3(p.x * 1.4, p.y * 0.35, p.z * 1.3),
      0.065,
      12,
    );
    return mix(
      C.slate,
      C.silver,
      0.23 + grain * 0.13 + Math.max(0, n.y) * 0.24,
    );
  });

  const paleFur = paint((p, n) =>
    mix(
      "#a9bdc8",
      C.cream,
      0.55 +
        noise(new THREE.Vector3(p.x * 2, p.y * 0.28, p.z), 0.07, 7) * 0.10 +
        Math.max(0, n.y) * 0.21,
    ),
  );

  const darkFur = paint((p, n) =>
    mix(
      C.charcoal,
      C.dark,
      0.35 + noise(p, 0.13, 42) * 0.12 + Math.max(0, n.y) * 0.25,
    ),
  );

  const manePaint = paint((p, n) =>
    mix(
      C.dark,
      C.silver,
      0.38 +
        noise(new THREE.Vector3(p.x * 2, p.y * 0.24, p.z * 2), 0.055, 23) *
          0.13 +
        Math.max(0, n.y) * 0.22,
    ),
  );

  const torsoPaint = paint((p, n) => {
    if (n.y > 0.50 && Math.abs(p.x) < 0.13 + 0.018 * Math.sin(p.z * 21)) {
      return darkFur;
    }
    if (n.y < -0.50) return paleFur;
    return coat;
  });

  const neckPaint = paint((p, n) => {
    const bibWidth = 0.24 - Math.max(0, 1.20 - p.y) * 0.25;
    if (
      n.z > 0.34 &&
      p.z > 0.49 &&
      p.y < 1.49 &&
      Math.abs(p.x) < bibWidth
    ) return paleFur;
    if (n.z < -0.40) return darkFur;
    return coat;
  });

  const headPaint = paint((p, n) => {
    const front = Math.max(0, Math.min(1, (p.z - 0.72) / 0.26));
    const crown = Math.max(0, Math.min(1, (p.y - 1.75) / 0.14));
    if (p.y < 1.57 && n.z > -0.15) return paleFur;
    return mix(
      C.slate,
      C.silver,
      0.16 + front * 0.38 + Math.max(0, n.y) * 0.13 - crown * 0.10,
    );
  });

  const stonePaint = paint((p, n) =>
    mix(
      "#293d4d",
      "#667d8b",
      0.21 + noise(p, 0.20, 17) * 0.28 + Math.max(0, n.y) * 0.21,
    ),
  );

  const snowPaint = paint((p, n) =>
    mix(
      C.snowShade,
      "#f0f4ef",
      Math.max(0, n.y) * 0.70 + noise(p, 0.18, 11) * 0.12,
    ),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 100">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9b501c"/>
          <stop offset=".5" stop-color="#eeb344"/>
          <stop offset="1" stop-color="#ffe7ac"/>
        </linearGradient>
      </defs>
      <path d="M6 47 Q47 15 84 22 Q122 22 155 44
               Q119 80 77 80 Q33 77 6 47Z" fill="#17232d"/>
      <path d="M17 48 Q51 28 86 29 Q118 28 143 45
               Q114 69 78 72 Q43 69 17 48Z" fill="url(#a)"/>
      <ellipse cx="80" cy="50" rx="12" ry="23" fill="#14212a"/>
      <path d="M25 55 Q43 68 63 68 M102 64 L117 56"
        fill="none" stroke="#ffe9b2" stroke-width="3"/>
      <ellipse cx="64" cy="39" rx="9" ry="5" fill="#fff8df"/>
      <circle cx="95" cy="59" r="3" fill="#fff2cf"/>
      <path d="M10 43 Q72 14 149 40" fill="none"
        stroke="#263642" stroke-width="7"/>
    </svg>`,
    { size: 384 },
  );

  const muzzleTexture = svg(
    `<svg viewBox="0 0 160 80">
      <path d="M13 49 Q76 65 149 37" fill="none" stroke="#667d89"
        stroke-width="3.5" stroke-linecap="round"/>
      <g fill="#4e6472">
        <ellipse cx="36" cy="25" rx="4" ry="3"/>
        <ellipse cx="62" cy="35" rx="3.5" ry="2.8"/>
        <ellipse cx="88" cy="24" rx="3.5" ry="2.6"/>
        <ellipse cx="106" cy="39" rx="3" ry="2.5"/>
        <ellipse cx="53" cy="13" rx="3" ry="2.5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg viewBox="0 0 128 80">
      <path d="M15 27 Q33 11 55 17 M74 17 Q98 12 113 27"
        stroke="#718793" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M18 39 Q32 22 46 36 Q40 47 24 48Z
               M82 36 Q98 23 111 39 L106 49 Q87 48 82 36Z"
        fill="#08131d"/>
      <path d="M64 36 L64 67" stroke="#0a1620" stroke-width="4"/>
      <g fill="#85949b">
        <circle cx="47" cy="23" r="2"/>
        <circle cx="58" cy="20" r="2"/>
        <circle cx="72" cy="21" r="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const scarTexture = svg(
    `<svg viewBox="0 0 100 130">
      <path d="M22 10 L36 51 L27 77 L48 119 L41 71 L47 47Z" fill="#506777"/>
      <path d="M30 13 L42 49 L35 74 L49 113 L43 71 L49 46Z" fill="#dae4e2"/>
      <path d="M56 19 L66 53 L61 72 L77 103 L71 66 L75 49Z" fill="#dae4e2"/>
    </svg>`,
    { size: 256 },
  );

  const furMarkTexture = svg(
    `<svg viewBox="0 0 180 160">
      <path d="M9 20 L56 48 L29 69 L87 117 L56 66 L78 51Z" fill="#647e90"/>
      <path d="M73 12 L112 39 L93 65 L150 136 L120 64 L133 42Z" fill="#718a99"/>
      <path d="M17 25 L54 43 M83 18 L113 36"
        stroke="#c0ced3" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M50 13 L50 145 M50 24 L20 47 L50 69 L80 47Z
        M23 94 L50 116 L77 94 M32 134 L50 146 L68 134"
        fill="none" stroke="#3a5768" stroke-width="13"/>
      <path d="M50 13 L50 145 M50 24 L20 47 L50 69 L80 47Z
        M23 94 L50 116 L77 94 M32 134 L50 146 L68 134"
        fill="none" stroke="#b1dfeb" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton, including the separated toes and independent lower jaw.
  const hips = b.joint("hips", {
    at: [0, 1.06, -0.55],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [[0, 1.06, -0.55], [0, 1.13, -0.15], [0, 1.22, 0.30]],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [[0, 1.22, 0.30], [0, 1.44, 0.46], [0, 1.62, 0.68]],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    at: [0, 1.62, 0.68],
    parent: neck.tip!,
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    at: [0, 1.49, 0.78],
    parent: head,
    dir: [0, 0, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.63],
      [0, 0.97, -0.94],
      [0.04, 0.79, -1.22],
      [0.10, 0.58, -1.46],
      [0.13, 0.48, -1.64],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  const H = b.region({ at: head.at, scale: 1, bone: head });
  const hp = (x: number, y: number, z: number) => H.p([x, y, z]);

  const ears = [-1, 1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp(s * 0.185, 0.18, -0.02),
      dir: [s * 0.24, 1, -0.06],
      role: "hinge",
    }),
  }));

  const legs = [-1, 1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [true, false].map((front) => {
      const suffix = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [s * 0.285, 1.20, 0.28],
            [s * 0.30, 0.72, 0.31],
            [s * 0.31, 0.29, 0.47],
            [s * 0.31, 0.205, 0.54],
          ]
        : [
            [s * 0.265, 1.05, -0.54],
            [s * 0.30, 0.70, -0.29],
            [s * 0.31, 0.40, -0.65],
            [s * 0.31, 0.205, -0.50],
          ];

      const chain = b.chain(`leg${suffix}`, points, {
        parent: front ? spine.tip! : hips,
        names: front
          ? [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`, `paw${suffix}`]
          : [`hip${suffix}`, `knee${suffix}`, `hock${suffix}`, `paw${suffix}`],
        role: "leg",
        contact: [points[3][0], 0.14, points[3][2] + 0.06],
      });

      const foot = points[3];
      const toes = Array.from({ length: 4 }, (_, i) => {
        const dx = (i - 1.5) * 0.061;
        const forward = 0.12 + (i === 1 || i === 2 ? 0.025 : 0);
        const start = [foot[0] + dx, 0.188, foot[2] + 0.035];
        const end = [foot[0] + dx * 1.07, 0.172, foot[2] + forward];
        const digit = b.chain(`toe${suffix}${i + 1}`, [start, end], {
          parent: chain.tip!,
          role: "digit",
          count: 1,
        });
        return { digit, start, end, i };
      });

      return { s, front, suffix, points, chain, foot, toes };
    });
  });

  // Fractured stone footprint with a bevelled edge instead of a vertical tray.
  const outline = [
    [-0.48, 0.98],
    [-0.65, 0.61],
    [-0.68, 0.12],
    [-0.59, -0.42],
    [-0.62, -0.88],
    [-0.43, -1.57],
    [-0.15, -1.78],
    [0.24, -1.75],
    [0.54, -1.51],
    [0.65, -0.90],
    [0.59, -0.44],
    [0.69, 0.16],
    [0.59, 0.66],
    [0.36, 1.05],
    [-0.12, 1.10],
  ];

  b.slab(
    outline.map(([x, z]) => [x * 0.965, 0.036, z * 0.985]),
    {
      thickness: 0.072,
      color: stonePaint,
      bone: hips,
      name: "outcropUnderside",
    },
  );

  b.slab(
    outline.map(([x, z]) => [x, 0.092, z]),
    {
      thickness: 0.065,
      color: stonePaint,
      bone: hips,
      name: "fracturedSlateShelf",
    },
  );

  b.slab(
    outline.map(([x, z], i) => [
      x * (i % 3 === 0 ? 0.94 : 0.975),
      0.136,
      z * 0.975,
    ]),
    {
      thickness: 0.027,
      color: snowPaint,
      bone: hips,
      name: "windPackedSnow",
    },
  );

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const c = outline[(i + 1) % outline.length];
    b.slab(
      [
        [a[0] * 0.965, 0.021, a[1] * 0.985],
        [c[0] * 0.965, 0.021, c[1] * 0.985],
        [c[0], 0.107, c[1]],
        [a[0], 0.107, a[1]],
      ],
      {
        thickness: 0.012,
        color: stonePaint,
        bone: hips,
        name: "bevelledRockEdge",
      },
    );
  }

  const torso = b.sweep(
    spine,
    (t) => [
      0.275 - 0.060 * Math.sin(t * Math.PI) + 0.090 * t,
      0.245 - 0.075 * Math.sin(t * Math.PI) + 0.145 * t,
    ],
    {
      color: torsoPaint,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "powerfulTorso",
    },
  );

  const neckMass = b.sweep(neck, [0.325, 0.295, 0.23], {
    color: neckPaint,
    sides: 10,
    smooth: false,
    caps: "round",
    name: "raisedNeck",
  });

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    at: hp(0, 0.025, 0.085),
    scale: [0.266, 0.235, 0.30],
    bone: head,
    flat: true,
    name: "angularSkull",
  });

  const upperMuzzle = b.loft(
    [
      { at: hp(0, -0.045, 0.21), w: 0.34, h: 0.205 },
      { at: hp(0, -0.069, 0.38), w: 0.29, h: 0.17 },
      { at: hp(0, -0.083, 0.535), w: 0.225, h: 0.145 },
    ],
    {
      color: paleFur,
      bone: head,
      section: { ngon: 6 },
      caps: "flat",
      smooth: false,
      name: "upperMuzzle",
    },
  );

  b.loft(
    [
      { at: hp(0, 0.014, 0.23), w: 0.225, h: 0.085 },
      { at: hp(0, -0.006, 0.38), w: 0.192, h: 0.072 },
      { at: hp(0, -0.034, 0.515), w: 0.166, h: 0.048 },
    ],
    {
      color: coat,
      bone: head,
      section: { ngon: 5 },
      caps: "flat",
      name: "grayNasalBridge",
    },
  );

  b.loft(
    [
      { at: hp(0, -0.145, 0.14), w: 0.28, h: 0.112 },
      { at: hp(0, -0.171, 0.34), w: 0.232, h: 0.079 },
      { at: hp(0, -0.171, 0.515), w: 0.178, h: 0.065 },
    ],
    {
      color: paleFur,
      bone: jaw,
      section: { ngon: 6 },
      caps: "flat",
      smooth: false,
      name: "lowerJaw",
    },
  );

  b.loft(
    [
      { at: hp(0, -0.137, 0.24), w: 0.24, h: 0.024 },
      { at: hp(0, -0.141, 0.39), w: 0.208, h: 0.020 },
      { at: hp(0, -0.140, 0.515), w: 0.16, h: 0.016 },
    ],
    {
      color: C.mouth,
      bone: jaw,
      section: "box",
      caps: "flat",
      name: "mouthInterior",
    },
  );

  const nose = b.part(new THREE.SphereGeometry(1, 10, 6), C.black, {
    at: hp(0, -0.073, 0.558),
    scale: [0.118, 0.074, 0.056],
    bone: head,
    flat: true,
    name: "blackNose",
  });

  b.decal(nose, noseTexture, {
    at: hp(0, -0.070, 0.615),
    dir: [0, 0.08, 1],
    size: [0.198, 0.115],
    bone: head,
    name: "noseNostrils",
  });

  for (const s of [-1, 1]) {
    b.spike(
      hp(s * 0.107, -0.116, 0.395),
      hp(s * 0.11, -0.154, 0.405),
      null,
      0.015,
      { color: C.ivory, bone: head, sides: 5, name: "upperCanine" },
    );

    b.decal(upperMuzzle, muzzleTexture, {
      at: hp(s * 0.145, -0.059, 0.385),
      dir: [s, 0.05, 0.24],
      size: [0.22, 0.102],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
  }

  const skullSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = skullSurface.nearest(hp(s * 0.162, 0.085, 0.318));
    const socket = b.stick(
      new THREE.SphereGeometry(1, 12, 8),
      C.deep,
      hit,
      {
        scale: [0.081, 0.014, 0.048],
        embed: 0.52,
        bone: head,
        name: s > 0 ? "eyeSocketL" : "eyeSocketR",
      },
    );

    b.decal(socket, eyeTexture, {
      at: hit.at.clone().addScaledVector(hit.n, 0.025),
      dir: hit.n,
      size: [0.15, 0.083],
      mirror: s > 0,
      bone: head,
      segments: 8,
      lift: 0.002,
      name: s > 0 ? "amberEyeL" : "amberEyeR",
    });

    b.sweep(
      [
        hp(s * 0.09, 0.128, 0.305),
        hp(s * 0.173, 0.143, 0.270),
        hp(s * 0.24, 0.108, 0.185),
      ],
      [0.025, 0.033, 0.006],
      {
        color: darkFur,
        bone: head,
        section: { ngon: 5 },
        caps: "flat",
        name: "fierceBrow",
      },
    );

    b.sweep(
      [
        hp(s * 0.102, 0.153, 0.277),
        hp(s * 0.174, 0.167, 0.23),
        hp(s * 0.225, 0.134, 0.168),
      ],
      [0.015, 0.018, 0.002],
      {
        color: paleFur,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "silverBrow",
      },
    );
  }

  // Shorter, wider-rooted ears, with genuinely seated inner faces.
  for (const { s, joint } of ears) {
    const at = hp(s * 0.178, 0.166, -0.025);
    const X = [s, 0, 0];
    const Y = [s * 0.19, 0.98, -0.06];

    b.extrude(
      [
        [-0.105, 0],
        [-0.098, 0.081],
        [-0.024, 0.225],
        [0.009, 0.252],
        [0.102, 0.082],
        [0.116, 0.005],
      ],
      {
        at,
        x: X,
        y: Y,
        thickness: [0.103, 0.025],
        color: darkFur,
        bone: joint,
        name: "pointedEarRim",
      },
    );

    b.extrude(
      [
        [-0.073, 0.025],
        [-0.060, 0.09],
        [-0.013, 0.189],
        [0.007, 0.213],
        [0.065, 0.084],
        [0.078, 0.027],
      ],
      {
        at: at.clone().add(new THREE.Vector3(0, 0, 0.049)),
        x: X,
        y: Y,
        thickness: 0.013,
        color: C.silver,
        bone: joint,
        name: "innerEarSilver",
      },
    );

    b.extrude(
      [
        [-0.046, 0.038],
        [-0.037, 0.09],
        [-0.006, 0.173],
        [0.039, 0.084],
        [0.051, 0.038],
      ],
      {
        at: at.clone().add(new THREE.Vector3(0, 0, 0.059)),
        x: X,
        y: Y,
        thickness: 0.009,
        color: "#677886",
        bone: joint,
        name: "earInnerShadow",
      },
    );

    for (let j = 0; j < 3; j++) {
      b.sweep(
        [
          hp(s * (0.135 + j * 0.032), 0.18, 0.048),
          hp(s * (0.14 + j * 0.033), 0.22, 0.067),
          hp(s * (0.146 + j * 0.033), 0.25 + j * 0.007, 0.058),
        ],
        [0.026, 0.019, 0],
        {
          color: paleFur,
          bone: joint,
          sides: 5,
          caps: "flat",
          name: "earBaseTuft",
        },
      );
    }
  }

  // A lock is a thick, curved, tapered volume, buried at its root.
  // The broad face follows the skin; it cannot become a free-standing plate.
  function furLock(
    on: ReturnType<ReturnType<typeof b.surface>["nearest"]>,
    length: number,
    width: number,
    fill: Parameters<typeof b.part>[1],
    flow: number[],
    name: string,
    lift = 0.14,
  ) {
    const n = on.n.clone().normalize();
    const direction = new THREE.Vector3(flow[0], flow[1], flow[2]).normalize();
    const tangent = direction.clone().addScaledVector(n, -direction.dot(n));
    if (tangent.lengthSq() < 0.001) {
      tangent.set(0, -1, -0.2);
      tangent.addScaledVector(n, -tangent.dot(n));
    }
    tangent.normalize();

    const root = on.at.clone().addScaledVector(n, -width * 0.20);
    const middle = on.at
      .clone()
      .addScaledVector(tangent, length * 0.43)
      .addScaledVector(n, width * 0.015 + length * lift * 0.30);
    const tip = on.at
      .clone()
      .addScaledVector(tangent, length)
      .addScaledVector(n, length * lift);

    return b.sweep(
      bezier(root, middle, tip),
      (t) => {
        const taper = Math.pow(1 - t, 0.72);
        const swell = 0.88 + 0.18 * Math.sin(t * Math.PI);
        return [width * 0.49 * taper * swell, width * 0.24 * taper];
      },
      {
        color: fill,
        bone: on.bone!,
        up: n,
        sides: 6,
        smooth: false,
        caps: "flat",
        name,
      },
    );
  }

  const cheeks = [];
  for (const s of [-1, 1]) {
    const cheek = b.loft(
      [
        { at: hp(s * 0.185, -0.045, 0.22), w: 0.11, h: 0.12 },
        { at: hp(s * 0.235, -0.06, 0.085), w: 0.16, h: 0.18 },
        { at: hp(s * 0.255, -0.12, -0.085), w: 0.025, h: 0.035 },
      ],
      {
        color: paleFur,
        bone: head,
        section: { ngon: 6 },
        caps: "flat",
        smooth: false,
        name: "sculptedCheekWedge",
      },
    );
    cheeks.push(cheek);

    const faceSurface = b.surface([skull, cheek]);
    const cheekRows = [
      [0.22, 0.018, 0.155, 0.20, 0.125],
      [0.26, -0.035, 0.11, 0.24, 0.14],
      [0.23, -0.10, 0.11, 0.21, 0.13],
    ];

    cheekRows.forEach(([x, y, z, l, w], i) => {
      furLock(
        faceSurface.nearest(hp(s * x, y, z)),
        l,
        w,
        i === 0 ? coat : paleFur,
        [s * 0.45, -0.25, -1],
        "sweptCheekRuff",
        0.20,
      );
    });

    b.sweep(
      [
        hp(s * 0.212, 0.005, 0.235),
        hp(s * 0.248, -0.027, 0.165),
        hp(s * 0.252, -0.052, 0.10),
      ],
      [0.010, 0.014, 0.001],
      {
        color: C.deep,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "eyeToCheekMark",
      },
    );
  }

  b.decal([skull, ...cheeks], scarTexture, {
    at: hp(-0.234, 0.025, 0.185),
    dir: [-1, 0.08, 0.40],
    size: [0.057, 0.105],
    bone: head,
    roll: -12,
    name: "oldCheekScar",
  });

  const ruffSurface = b.surface([neckMass, torso]);
  for (const s of [-1, 1]) {
    const rows = [
      { y: 1.51, z: 0.42, x: 0.25, length: 0.25, width: 0.19 },
      { y: 1.39, z: 0.34, x: 0.30, length: 0.29, width: 0.22 },
      { y: 1.26, z: 0.25, x: 0.34, length: 0.29, width: 0.23 },
      { y: 1.13, z: 0.16, x: 0.33, length: 0.24, width: 0.21 },
    ];
    rows.forEach((row, i) => {
      for (let layer = 0; layer < 2; layer++) {
        const hit = ruffSurface.nearest([
          s * row.x,
          row.y + layer * 0.02,
          row.z + layer * 0.16,
        ]);
        furLock(
          hit,
          row.length * (layer ? 0.84 : 1),
          row.width * (layer ? 0.85 : 1),
          layer && i > 1 ? coat : manePaint,
          [s * 0.10, -0.60, -0.90],
          "layeredShoulderMane",
          layer ? 0.11 : 0.18,
        );
      }
    });
  }

  // Overlapping pale neck scales of fur unify the chin and breast.
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * (row === 2 ? 0.061 : 0.067);
      const hit = ruffSurface.nearest([
        x,
        1.39 - row * 0.135 + Math.abs(x) * 0.18,
        0.88,
      ]);
      furLock(
        hit,
        (row === 2 ? 0.17 : 0.19) - Math.abs(x) * 0.10,
        row === 2 ? 0.115 : 0.12,
        paleFur,
        [x * 0.45, -1, -0.07],
        "integratedThroatBib",
        0.07,
      );
    }
  }

  // Low overlapping saddle fur, not isolated upright dorsal fins.
  const torsoSurface = b.surface(torso);
  for (let i = 0; i < 6; i++) {
    const z = 0.22 - i * 0.145;
    for (const s of [-1, 1]) {
      const hit = torsoSurface.nearest([s * 0.075, 1.70, z]);
      furLock(
        hit,
        0.20,
        0.18,
        i < 2 ? manePaint : darkFur,
        [s * 0.08, 0, -1],
        "overlappingSaddleFur",
        0.035,
      );
    }
  }

  for (const leg of legs) {
    const { chain, front, foot, toes, s, suffix } = leg;
    const legPaint = paint((p, n) => {
      const cuff = 0.32 + 0.023 * Math.sin(p.z * 53 + p.x * 29);
      if (p.y < cuff) return paleFur;
      if (n.z < -0.55 && p.y > 0.5) return darkFur;
      return coat;
    });

    const legTube = b.sweep(
      chain,
      front
        ? [0.166, 0.128, 0.087, 0.093]
        : [0.185, 0.151, 0.077, 0.085],
      {
        color: legPaint,
        sides: 10,
        smooth: false,
        caps: "round",
        name: `legMass${suffix}`,
      },
    );

    const haunch = !front
      ? b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
          at: [s * 0.265, 0.92, -0.46],
          scale: [0.198, 0.27, 0.225],
          bone: chain.joints[0],
          flat: true,
          name: `haunch${suffix}`,
        })
      : null;

    const paw = b.part(new THREE.SphereGeometry(1, 10, 7), paleFur, {
      at: [foot[0], 0.207, foot[2] + 0.014],
      scale: [0.143, 0.083, 0.145],
      bone: chain.tip!,
      flat: true,
      name: `broadPaw${suffix}`,
    });

    b.part(new THREE.SphereGeometry(1, 8, 5), C.deep, {
      at: [foot[0], 0.139, foot[2] + 0.025],
      scale: [0.115, 0.019, 0.12],
      bone: chain.tip!,
      flat: true,
      name: `pawSole${suffix}`,
    });

    for (const { digit, start, end, i } of toes) {
      b.sweep(digit, [0.039, 0.037], {
        color: paleFur,
        sides: 7,
        smooth: false,
        name: `toeMass${suffix}${i + 1}`,
      });

      b.sweep(
        bezier(
          [end[0], end[1] + 0.005, end[2] + 0.018],
          [end[0], end[1] + 0.003, end[2] + 0.055],
          [end[0], 0.136, end[2] + 0.068],
        ),
        [0.015, 0],
        {
          color: C.claw,
          bone: digit.joints[0],
          sides: 5,
          caps: "flat",
          name: `claw${suffix}${i + 1}`,
        },
      );

      b.sweep(
        [
          [start[0] - 0.014, start[1] + 0.033, start[2] + 0.01],
          [end[0] - 0.011, end[1] + 0.032, end[2] + 0.008],
        ],
        [0.0045, 0.001],
        {
          color: C.gray,
          bone: digit.joints[0],
          sides: 4,
          caps: "flat",
          name: "toeCrease",
        },
      );
    }

    const legSurface = b.surface(haunch ? [legTube, paw, haunch] : [legTube, paw]);
    for (let i = 0; i < 3; i++) {
      const hit = legSurface.nearest([
        s * (front ? 0.40 : 0.435),
        0.92 - i * 0.11,
        front ? 0.23 : -0.55,
      ]);
      furLock(
        hit,
        front ? 0.14 : 0.18,
        front ? 0.13 : 0.15,
        i === 2 ? coat : manePaint,
        [s * 0.05, -0.8, -0.6],
        `legFeathering${suffix}`,
        0.12,
      );
    }

    if (front) {
      for (const sideOffset of [-0.042, 0.042]) {
        const hit = legSurface.nearest([
          foot[0] + sideOffset,
          0.33,
          foot[2] + 0.03,
        ]);
        furLock(
          hit,
          0.079,
          0.073,
          paleFur,
          [0, -1, 0.05],
          "wristTuft",
          0.06,
        );
      }

      b.spike(
        [s * 0.246, 0.42, 0.43],
        [s * 0.227, 0.38, 0.46],
        null,
        0.016,
        {
          color: C.claw,
          bone: chain.joints[1],
          sides: 5,
          name: "dewClaw",
        },
      );
    }
  }

  for (const s of [-1, 1]) {
    b.decal(torso, furMarkTexture, {
      at: [s * 0.29, 1.12, -0.38],
      dir: [s, 0.08, 0],
      size: [0.30, 0.26],
      mirror: s < 0,
      name: "flankCoatMarkings",
    });
  }

  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = 0.12 + Math.sin(t * Math.PI) * 0.062;
      const fade = t > 0.68 ? 1 - (t - 0.68) / 0.34 : 1;
      return [Math.max(0.012, r * fade), Math.max(0.012, r * 0.95 * fade)];
    },
    {
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      sectors: [[-60, 60, darkFur], [130, 230, paleFur]],
      name: "bushyTail",
    },
  );

  const tailSurface = b.surface(tailTube);
  for (let i = 0; i < 6; i++) {
    const t = 0.13 + i * 0.135;
    const center = tail.at(t).at;
    for (const s of [-1, 1]) {
      furLock(
        tailSurface.nearest(
          center.clone().add(new THREE.Vector3(s * 0.3, 0.015, 0)),
        ),
        0.205 - t * 0.05,
        0.15 - t * 0.03,
        i > 3 ? darkFur : coat,
        [s * 0.07, -0.35, -1],
        "tailSideLocks",
        0.09,
      );
    }
    if (i < 4) {
      furLock(
        tailSurface.nearest(
          center.clone().add(new THREE.Vector3(0, -0.3, 0)),
        ),
        0.18,
        0.14,
        paleFur,
        [0, -0.3, -1],
        "tailUndersideLocks",
        0.07,
      );
    }
  }

  const runeStone = b.extrude(
    [
      [-0.14, 0],
      [-0.15, 0.18],
      [-0.09, 0.29],
      [0.015, 0.32],
      [0.12, 0.24],
      [0.14, 0],
    ],
    {
      at: [-0.43, 0.13, -1.13],
      x: [1, 0, 0],
      y: [-0.20, 1, -0.08],
      thickness: 0.16,
      color: stonePaint,
      bone: hips,
      name: "brokenFrostRuneStone",
    },
  );

  glow(
    b.decal(runeStone, runeTexture, {
      at: [-0.455, 0.295, -1.027],
      dir: [0, 0, 1],
      size: [0.105, 0.20],
      bone: hips,
      lift: 0.002,
      name: "faintFrostRune",
    }),
    0.4,
  );

  b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
    at: [-0.475, 0.422, -1.15],
    scale: [0.115, 0.031, 0.095],
    bone: hips,
    name: "snowOnRuneStone",
  });

  for (const [x, z, scale] of [
    [-0.51, -1.02, 0.075],
    [-0.33, -1.16, 0.065],
    [-0.49, -1.32, 0.08],
  ]) {
    b.part(new THREE.DodecahedronGeometry(scale, 0), stonePaint, {
      at: [x, 0.14, z],
      scale: [1, 0.65, 1.2],
      rotation: [0, random() * 180, 0],
      bone: hips,
      name: "runeStoneRubble",
    });
  }

  for (let i = 0; i < 4; i++) {
    const x = 0.46 + random() * 0.085;
    const z = -1.30 + random() * 0.20;
    const h = 0.06 + random() * 0.105;
    b.part(new THREE.ConeGeometry(0.026, h, 5), C.ice, {
      at: [x, 0.145 + h / 2, z],
      rotation: [random() * 14 - 7, random() * 80, random() * 14 - 7],
      bone: hips,
      name: "frostCrystal",
    });
  }

  for (const [x, z, w, d] of [
    [0.44, 0.77, 0.14, 0.16],
    [-0.52, 0.32, 0.12, 0.24],
    [0.46, -0.78, 0.14, 0.20],
    [-0.22, -1.60, 0.19, 0.13],
    [0.04, 0.97, 0.20, 0.09],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
      at: [x, 0.15, z],
      scale: [w, 0.026, d],
      bone: hips,
      name: "windDrift",
    });
  }

  for (const [x, z, angle] of [
    [-0.54, 0.65, -16],
    [0.57, 0.49, 24],
    [-0.32, -1.64, 5],
    [0.35, -1.59, -33],
    [-0.58, -0.63, 40],
    [0.55, -0.25, 13],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, 0.122, z],
      scale: [0.095, 0.038, 0.11],
      rotation: [0, angle, 0],
      bone: hips,
      name: "exposedSlateChip",
    });
  }

  return b.root;
}

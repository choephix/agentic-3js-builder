```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostfang — Northern Gray Wolf",
  description:
    "An alert, broad-shouldered gray wolf with sculpted silver cheek ruffs, compact pointed ears, watchful amber eyes and a layered charcoal winter mane, on a snowy slate outcrop.",
};

/*
  Art-direction changes:
  1. Replace the round cheek pads with integrated wedge-shaped ruffs; reduce
     protruding eye sockets and shorten the ears for a distinctly lupine face.
  2. Broaden the shoulders, tuck the belly, and integrate the throat colouring
     into the neck instead of hanging a separate pale mass off the chest.
  3. Replace thin, notched fur scraps with substantial overlapping tapered
     locks. A continuous dark saddle now supports the broken fur silhouette.
  4. Use larger, quieter colour regions and directional fur strokes rather
     than cloudy noise. Keep the amber gaze as the strongest colour accent.
  5. Shorten the empty foreground of the base and restrain the magical accents.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(8317);

  const C = {
    charcoal: "#283440",
    deep: "#354454",
    dark: "#4b5d6c",
    slate: "#687d8b",
    gray: "#8b9ca6",
    silver: "#b0bdc4",
    light: "#ccd3d2",
    cream: "#dcded3",
    ivory: "#eee9d7",
    black: "#14212b",
    mouth: "#302730",
    claw: "#36414b",
    snow: "#e1edf0",
    snowShade: "#abc5d2",
    ice: "#95cfde",
  };

  // Quiet directional grain; broad painted regions do the visual work.
  const coat = paint((p, n) => {
    const grain = noise(
      new THREE.Vector3(p.x * 1.4, p.y * 0.38, p.z * 1.3),
      0.065,
      12,
    );
    return mix(
      C.slate,
      C.silver,
      0.23 + grain * 0.19 + Math.max(0, n.y) * 0.29,
    );
  });

  const paleFur = paint((p, n) =>
    mix(
      C.silver,
      C.cream,
      0.53 +
        noise(new THREE.Vector3(p.x * 2, p.y * 0.28, p.z), 0.065, 7) * 0.12 +
        Math.max(0, n.y) * 0.18,
    ),
  );

  const darkFur = paint((p, n) =>
    mix(
      C.charcoal,
      C.dark,
      0.26 + noise(p, 0.13, 42) * 0.15 + Math.max(0, n.y) * 0.23,
    ),
  );

  const manePaint = paint((p, n, s) => {
    const streak = noise(
      new THREE.Vector3(p.x * 2, p.y * 0.24, p.z * 2),
      0.055,
      23,
    );
    const ridge = Math.abs(s[0]) < 0.012 ? 0.12 : 0;
    return mix(
      C.dark,
      C.silver,
      0.34 + streak * 0.17 + Math.max(0, n.y) * 0.25 + ridge,
    );
  });

  const torsoPaint = paint((p, n) => {
    const saddleEdge = 0.14 + 0.025 * Math.sin(p.z * 19);
    if (n.y > 0.4 && Math.abs(p.x) < saddleEdge) return darkFur;
    if (n.y < -0.45) return paleFur;
    return coat;
  });

  const neckPaint = paint((p, n) => {
    if (n.z > 0.55 && p.z > 0.49 && p.y < 1.51) return paleFur;
    if (n.z < -0.35 || (p.y > 1.45 && p.z < 0.39)) return darkFur;
    return coat;
  });

  const headPaint = paint((p, n) => {
    if (p.y < 1.585 && n.z > 0.05) return paleFur;
    if (p.y > 1.775 || (Math.abs(p.x) < 0.095 && p.z < 0.96)) {
      return darkFur;
    }
    return coat;
  });

  const stonePaint = paint((p, n) =>
    mix(
      "#293c4b",
      "#5d7481",
      0.20 + noise(p, 0.22, 17) * 0.32 + Math.max(0, n.y) * 0.22,
    ),
  );

  const snowPaint = paint((p, n) =>
    mix(
      C.snowShade,
      "#eef3ed",
      Math.max(0, n.y) * 0.66 + noise(p, 0.18, 11) * 0.17,
    ),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 100">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8d481b"/>
          <stop offset=".5" stop-color="#e5a334"/>
          <stop offset="1" stop-color="#ffe2a0"/>
        </linearGradient>
      </defs>
      <path d="M6 47 Q47 15 84 22 Q122 22 155 44
               Q119 80 77 80 Q33 77 6 47Z" fill="#17232d"/>
      <path d="M17 48 Q51 28 86 29 Q118 28 143 45
               Q114 69 78 72 Q43 69 17 48Z" fill="url(#a)"/>
      <ellipse cx="80" cy="50" rx="9" ry="23" fill="#12202b"/>
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
      <path d="M13 49 Q76 71 149 37" fill="none" stroke="#586a74"
        stroke-width="4" stroke-linecap="round"/>
      <g fill="#4e606b">
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
        stroke="#687f8b" stroke-width="4" stroke-linecap="round" fill="none"/>
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
      <path d="M22 10 L36 51 L27 77 L48 119 L41 71 L47 47Z" fill="#445867"/>
      <path d="M30 13 L42 49 L35 74 L49 113 L43 71 L49 46Z" fill="#d5ddd9"/>
      <path d="M56 19 L66 53 L61 72 L77 103 L71 66 L75 49Z" fill="#d5ddd9"/>
    </svg>`,
    { size: 256 },
  );

  const furMarkTexture = svg(
    `<svg viewBox="0 0 180 160">
      <path d="M9 20 L56 48 L29 69 L87 117 L56 66 L78 51Z" fill="#536978"/>
      <path d="M73 12 L112 39 L93 65 L150 136 L120 64 L133 42Z" fill="#5e7481"/>
      <path d="M17 25 L54 43 M83 18 L113 36"
        stroke="#b4c3ca" stroke-width="4" fill="none"/>
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
        fill="none" stroke="#a3dce7" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // All animation joints precede the creature geometry.
  const hips = b.joint("hips", {
    at: [0, 1.06, -0.55],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [[0, 1.06, -0.55], [0, 1.10, -0.15], [0, 1.22, 0.30]],
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
      [0, 0.99, -0.97],
      [0.04, 0.82, -1.30],
      [0.10, 0.62, -1.57],
      [0.13, 0.57, -1.78],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  const H = b.region({ at: head.at, scale: 1, bone: head });
  const hp = (x: number, y: number, z: number) => H.p([x, y, z]);

  const ears = [-1, 1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp(s * 0.19, 0.185, -0.015),
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
            [s * 0.29, 1.20, 0.28],
            [s * 0.30, 0.72, 0.30],
            [s * 0.31, 0.29, 0.49],
            [s * 0.31, 0.205, 0.56],
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

  // A smaller, unevenly edged stage, with no tall scenery behind the head.
  const groundOutline = [
    [-0.54, 0.075, 1.09],
    [-0.71, 0.075, 0.48],
    [-0.67, 0.075, -0.55],
    [-0.47, 0.075, -1.76],
    [0.11, 0.075, -1.94],
    [0.57, 0.075, -1.67],
    [0.70, 0.075, -0.72],
    [0.73, 0.075, 0.43],
    [0.48, 0.075, 1.12],
    [-0.10, 0.075, 1.20],
  ];

  b.slab(groundOutline, {
    thickness: 0.15,
    color: stonePaint,
    bone: hips,
    name: "slateOutcrop",
  });

  b.slab(
    groundOutline.map(([x, _y, z]) => [x * 0.975, 0.137, z * 0.985]),
    {
      thickness: 0.027,
      color: snowPaint,
      bone: hips,
      name: "windPackedSnow",
    },
  );

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.sin(a) * (0.59 + random() * 0.055);
    const z = Math.cos(a) * (1.24 + random() * 0.10) - 0.30;
    const size = 0.07 + random() * 0.06;
    b.part(new THREE.DodecahedronGeometry(size, 0), stonePaint, {
      at: [x, 0.075, z],
      scale: [1.2, 0.55, 1.4],
      rotation: [0, random() * 180, 0],
      bone: hips,
      name: "brokenSlate",
    });
  }

  const torso = b.sweep(
    spine,
    (t) => [
      0.285 - 0.055 * Math.sin(t * Math.PI) + 0.085 * t,
      0.28 - 0.055 * Math.sin(t * Math.PI) + 0.13 * t,
    ],
    {
      color: torsoPaint,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "powerfulTorso",
    },
  );

  const neckMass = b.sweep(neck, [0.34, 0.30, 0.235], {
    color: neckPaint,
    sides: 10,
    smooth: false,
    caps: "round",
    name: "raisedNeck",
  });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    at: hp(0, 0.025, 0.085),
    scale: [0.263, 0.245, 0.32],
    bone: head,
    flat: true,
    name: "angularSkull",
  });

  // A strong nasal wedge, not a narrow beak.
  const upperMuzzle = b.loft(
    [
      { at: hp(0, -0.045, 0.21), w: 0.335, h: 0.205 },
      { at: hp(0, -0.073, 0.41), w: 0.285, h: 0.165 },
      { at: hp(0, -0.092, 0.59), w: 0.22, h: 0.137 },
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
      { at: hp(0, 0.014, 0.24), w: 0.218, h: 0.088 },
      { at: hp(0, -0.008, 0.41), w: 0.19, h: 0.072 },
      { at: hp(0, -0.044, 0.565), w: 0.163, h: 0.048 },
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
      { at: hp(0, -0.155, 0.14), w: 0.28, h: 0.115 },
      { at: hp(0, -0.19, 0.36), w: 0.23, h: 0.077 },
      { at: hp(0, -0.187, 0.56), w: 0.175, h: 0.066 },
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
      { at: hp(0, -0.145, 0.24), w: 0.235, h: 0.031 },
      { at: hp(0, -0.15, 0.42), w: 0.205, h: 0.025 },
      { at: hp(0, -0.15, 0.56), w: 0.158, h: 0.02 },
    ],
    {
      color: C.mouth,
      bone: jaw,
      section: "box",
      caps: "flat",
      name: "mouthInterior",
    },
  );

  const nose = b.part(new THREE.SphereGeometry(1, 8, 6), C.black, {
    at: hp(0, -0.082, 0.614),
    scale: [0.116, 0.073, 0.061],
    bone: head,
    flat: true,
    name: "blackNose",
  });

  b.decal(nose, noseTexture, {
    at: hp(0, -0.077, 0.676),
    dir: [0, 0.08, 1],
    size: [0.196, 0.115],
    bone: head,
    name: "noseNostrils",
  });

  for (const s of [-1, 1]) {
    b.spike(
      hp(s * 0.106, -0.123, 0.425),
      hp(s * 0.108, -0.171, 0.434),
      null,
      0.016,
      { color: C.ivory, bone: head, sides: 5, name: "upperCanine" },
    );

    b.spike(
      hp(s * 0.10, -0.176, 0.335),
      [0, 1, 0],
      0.018,
      0.010,
      { color: C.ivory, bone: jaw, sides: 5, name: "lowerTooth" },
    );

    b.decal(upperMuzzle, muzzleTexture, {
      at: hp(s * 0.14, -0.068, 0.42),
      dir: [s, 0.05, 0.24],
      size: [0.245, 0.108],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
  }

  // Shallow, inset eyes: less black socket, more readable gaze.
  const skullSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = skullSurface.nearest(hp(s * 0.17, 0.093, 0.317));
    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 7),
      C.deep,
      hit,
      {
        scale: [0.078, 0.018, 0.049],
        embed: 0.58,
        bone: head,
        name: s > 0 ? "eyeSocketL" : "eyeSocketR",
      },
    );

    b.decal(socket, eyeTexture, {
      at: hit.at.clone().addScaledVector(hit.n, 0.025),
      dir: hit.n,
      size: [0.139, 0.080],
      mirror: s > 0,
      bone: head,
      segments: 7,
      lift: 0.002,
      name: s > 0 ? "amberEyeL" : "amberEyeR",
    });

    b.sweep(
      [
        hp(s * 0.095, 0.135, 0.311),
        hp(s * 0.178, 0.155, 0.272),
        hp(s * 0.245, 0.119, 0.184),
      ],
      [0.032, 0.041, 0.012],
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
        hp(s * 0.104, 0.161, 0.278),
        hp(s * 0.178, 0.18, 0.229),
        hp(s * 0.231, 0.143, 0.165),
      ],
      [0.016, 0.020, 0.003],
      {
        color: coat,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "browHighlight",
      },
    );
  }

  // Compact ears: broad roots, thick edges, and inset inner triangles.
  for (const { s, joint } of ears) {
    const at = hp(s * 0.18, 0.165, -0.025);
    const X = [s, 0, 0];
    const Y = [s * 0.19, 0.98, -0.06];

    b.extrude(
      [
        [-0.105, 0],
        [-0.10, 0.09],
        [-0.026, 0.265],
        [0.008, 0.295],
        [0.102, 0.09],
        [0.119, 0.01],
      ],
      {
        at,
        x: X,
        y: Y,
        thickness: [0.105, 0.03],
        color: darkFur,
        bone: joint,
        name: "pointedEarRim",
      },
    );

    b.extrude(
      [
        [-0.071, 0.035],
        [-0.061, 0.095],
        [-0.016, 0.222],
        [0.006, 0.246],
        [0.065, 0.092],
        [0.076, 0.037],
      ],
      {
        at: at.clone().add(new THREE.Vector3(0, 0, 0.052)),
        x: X,
        y: Y,
        thickness: 0.014,
        color: "#a7b0af",
        bone: joint,
        name: "innerEarSilver",
      },
    );

    b.extrude(
      [
        [-0.047, 0.044],
        [-0.040, 0.103],
        [-0.007, 0.195],
        [0.040, 0.096],
        [0.053, 0.044],
      ],
      {
        at: at.clone().add(new THREE.Vector3(0, 0, 0.062)),
        x: X,
        y: Y,
        thickness: 0.009,
        color: "#606976",
        bone: joint,
        name: "earInnerShadow",
      },
    );

    for (let j = 0; j < 3; j++) {
      b.extrude(
        [
          [-0.025, 0],
          [-0.019, 0.045],
          [0, 0.074 + j * 0.009],
          [0.018, 0.039],
          [0.026, 0],
        ],
        {
          at: hp(s * (0.135 + j * 0.032), 0.185, 0.058),
          x: [1, 0, 0],
          y: [s * 0.2, 1, 0.08],
          thickness: [0.03, 0.007],
          color: paleFur,
          bone: joint,
          name: "earBaseTuft",
        },
      );
    }
  }

  // Full-volume pointed locks. No perforated or paper-like notches.
  function furLock(
    on: ReturnType<ReturnType<typeof b.surface>["nearest"]>,
    length: number,
    width: number,
    fill: Parameters<typeof b.part>[1],
    flow: number[],
    name: string,
    lift = 0.30,
  ) {
    const n = on.n.clone().normalize();
    const direction = new THREE.Vector3(flow[0], flow[1], flow[2]).normalize();
    const tangent = direction.clone().addScaledVector(n, -direction.dot(n));
    if (tangent.lengthSq() < 0.001) tangent.set(0, -1, -0.2);
    tangent.normalize();
    const y = tangent.addScaledVector(n, lift).normalize();
    const x = y.clone().cross(n).normalize();

    return b.extrude(
      [
        [-width * 0.43, 0],
        [-width * 0.50, length * 0.23],
        [-width * 0.34, length * 0.58],
        [-width * 0.035, length],
        [width * 0.27, length * 0.62],
        [width * 0.48, length * 0.24],
        [width * 0.43, 0],
      ],
      {
        at: on.at.clone().addScaledVector(n, -width * 0.16),
        x,
        y,
        thickness: [width * 0.55, 0.006],
        color: fill,
        bone: on.bone!,
        name,
      },
    );
  }

  // Wedge-shaped cheek masses merge into the skull and sweep backward.
  for (const s of [-1, 1]) {
    const cheek = b.loft(
      [
        { at: hp(s * 0.185, -0.045, 0.24), w: 0.12, h: 0.13 },
        { at: hp(s * 0.245, -0.055, 0.09), w: 0.17, h: 0.21 },
        { at: hp(s * 0.27, -0.12, -0.10), w: 0.035, h: 0.045 },
      ],
      {
        color: paleFur,
        bone: head,
        section: { ngon: 5 },
        caps: "flat",
        smooth: false,
        name: "sculptedCheekWedge",
      },
    );

    const faceSurface = b.surface([skull, cheek]);
    const cheekRows = [
      [0.23, 0.018, 0.16, 0.23, 0.135],
      [0.28, -0.035, 0.10, 0.26, 0.155],
      [0.25, -0.105, 0.10, 0.235, 0.14],
    ];

    cheekRows.forEach(([x, y, z, l, w], i) => {
      furLock(
        faceSurface.nearest(hp(s * x, y, z)),
        l,
        w,
        i === 0 ? coat : paleFur,
        [s * 0.40, -0.38, -1],
        "angularCheekRuff",
        0.31,
      );
    });

    b.sweep(
      [
        hp(s * 0.212, 0.013, 0.245),
        hp(s * 0.25, -0.023, 0.175),
        hp(s * 0.26, -0.05, 0.095),
      ],
      [0.012, 0.018, 0.002],
      {
        color: C.deep,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "eyeToCheekMark",
      },
    );
  }

  b.decal(skull, scarTexture, {
    at: hp(-0.232, 0.037, 0.18),
    dir: [-1, 0.08, 0.40],
    size: [0.060, 0.105],
    bone: head,
    roll: -12,
    name: "oldCheekScar",
  });

  // A coherent shoulder mane with a few broad, deliberate layers.
  const ruffSurface = b.surface([neckMass, torso]);
  for (const s of [-1, 1]) {
    const rows = [
      { y: 1.52, z: 0.42, x: 0.25, length: 0.27, width: 0.18 },
      { y: 1.40, z: 0.36, x: 0.30, length: 0.31, width: 0.20 },
      { y: 1.27, z: 0.29, x: 0.34, length: 0.33, width: 0.22 },
      { y: 1.13, z: 0.20, x: 0.34, length: 0.27, width: 0.20 },
    ];

    rows.forEach((row, i) => {
      for (let layer = 0; layer < 2; layer++) {
        const hit = ruffSurface.nearest([
          s * row.x,
          row.y + layer * 0.025,
          row.z + layer * 0.17,
        ]);
        furLock(
          hit,
          row.length * (layer ? 0.83 : 1),
          row.width * (layer ? 0.86 : 1),
          layer && i > 1 ? coat : manePaint,
          [s * 0.17, -0.62, -0.85],
          "layeredShoulderMane",
          layer ? 0.19 : 0.30,
        );
      }
    });
  }

  // Pale throat locks are rooted directly on the neck, not on a separate ball.
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.067;
      const hit = ruffSurface.nearest([
        x,
        1.37 - row * 0.15 + Math.abs(x) * 0.20,
        0.85,
      ]);
      furLock(
        hit,
        (row ? 0.22 : 0.18) - Math.abs(x) * 0.15,
        row ? 0.12 : 0.108,
        paleFur,
        [x * 1.0, -1, -0.04],
        "layeredThroatBib",
        0.16,
      );
    }
  }

  // Continuous dark saddle under a restrained row of raised silver-edged locks.
  const torsoSurface = b.surface(torso);
  for (let i = 0; i < 6; i++) {
    const z = 0.23 - i * 0.145;
    for (const s of [-1, 1]) {
      const hit = torsoSurface.nearest([s * 0.088, 1.66, z]);
      furLock(
        hit,
        0.21,
        0.17,
        darkFur,
        [s * 0.17, 0, -1],
        "brokenDarkSaddle",
        0.10,
      );
    }
  }

  // Broad forelegs, articulated hocks, and four separated toes per paw.
  for (const leg of legs) {
    const { chain, points, front, foot, toes, s, suffix } = leg;
    const legPaint = paint((p, n) => {
      if (p.y < 0.35 + 0.025 * Math.sin(p.z * 53 + p.x * 29)) return paleFur;
      if (n.z < -0.55 && p.y > 0.5) return darkFur;
      return coat;
    });

    const legTube = b.sweep(
      chain,
      front
        ? [0.168, 0.126, 0.080, 0.091]
        : [0.185, 0.15, 0.074, 0.084],
      {
        color: legPaint,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `legMass${suffix}`,
      },
    );

    if (!front) {
      b.part(new THREE.SphereGeometry(1, 9, 7), coat, {
        at: [points[0][0], 0.92, -0.46],
        scale: [0.205, 0.28, 0.235],
        bone: chain.joints[0],
        flat: true,
        name: `haunch${suffix}`,
      });
    }

    const paw = b.part(new THREE.SphereGeometry(1, 8, 6), paleFur, {
      at: [foot[0], 0.215, foot[2] + 0.014],
      scale: [0.142, 0.09, 0.145],
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
      b.sweep(digit, [0.040, 0.039], {
        color: paleFur,
        sides: 7,
        smooth: false,
        name: `toeMass${suffix}${i + 1}`,
      });

      b.sweep(
        bezier(
          [end[0], end[1] + 0.005, end[2] + 0.018],
          [end[0], end[1] + 0.003, end[2] + 0.060],
          [end[0], 0.136, end[2] + 0.077],
        ),
        [0.017, 0],
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
          [start[0] - 0.014, start[1] + 0.036, start[2] + 0.01],
          [end[0] - 0.011, end[1] + 0.034, end[2] + 0.008],
        ],
        [0.006, 0.002],
        {
          color: C.gray,
          bone: digit.joints[0],
          sides: 4,
          caps: "flat",
          name: "toeCrease",
        },
      );
    }

    const legSurface = b.surface([legTube, paw]);
    for (let i = 0; i < 3; i++) {
      const y = front ? 0.91 - i * 0.11 : 0.91 - i * 0.10;
      const z = front ? 0.23 : -0.55;
      const hit = legSurface.nearest([s * (front ? 0.40 : 0.435), y, z]);
      furLock(
        hit,
        front ? 0.16 : 0.19,
        front ? 0.12 : 0.14,
        i === 2 ? coat : manePaint,
        [s * 0.08, -0.8, -0.6],
        `legFeathering${suffix}`,
        0.22,
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
          0.085,
          0.072,
          paleFur,
          [0, -1, 0.05],
          "wristTuft",
          0.13,
        );
      }

      b.spike(
        [s * 0.246, 0.42, 0.43],
        [s * 0.227, 0.38, 0.46],
        null,
        0.017,
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
      size: [0.32, 0.28],
      mirror: s < 0,
      name: "flankCoatMarkings",
    });
  }

  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = 0.13 + Math.sin(t * Math.PI) * 0.075;
      const fade = t > 0.72 ? 1 - (t - 0.72) / 0.30 : 1;
      return [Math.max(0.014, r * fade), Math.max(0.014, r * 0.95 * fade)];
    },
    {
      color: coat,
      sides: 8,
      smooth: false,
      caps: "round",
      sectors: [[-65, 65, darkFur], [125, 235, paleFur]],
      name: "bushyTail",
    },
  );

  const tailSurface = b.surface(tailTube);
  for (let i = 0; i < 6; i++) {
    const t = 0.13 + i * 0.14;
    const center = tail.at(t).at;
    for (const s of [-1, 1]) {
      furLock(
        tailSurface.nearest(
          center.clone().add(new THREE.Vector3(s * 0.3, 0.015, 0)),
        ),
        0.235 - t * 0.055,
        0.145 - t * 0.025,
        i > 3 ? darkFur : coat,
        [s * 0.09, -0.3, -1],
        "tailSideLocks",
        0.18,
      );
    }
    if (i < 4) {
      furLock(
        tailSurface.nearest(
          center.clone().add(new THREE.Vector3(0, -0.3, 0)),
        ),
        0.20,
        0.145,
        paleFur,
        [0, -0.25, -1],
        "tailUndersideLocks",
        0.13,
      );
    }
  }

  // Low environmental accents never compete with the amber eyes.
  const runeStone = b.extrude(
    [
      [-0.13, 0],
      [-0.15, 0.22],
      [-0.08, 0.35],
      [0.03, 0.39],
      [0.13, 0.29],
      [0.13, 0],
    ],
    {
      at: [-0.47, 0.13, -1.14],
      x: [1, 0, 0],
      y: [-0.12, 1, -0.08],
      thickness: 0.14,
      color: stonePaint,
      bone: hips,
      name: "brokenFrostRuneStone",
    },
  );

  glow(
    b.decal(runeStone, runeTexture, {
      at: [-0.48, 0.32, -1.049],
      dir: [0, 0, 1],
      size: [0.10, 0.21],
      bone: hips,
      lift: 0.002,
      name: "faintFrostRune",
    }),
    0.32,
  );

  b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
    at: [-0.49, 0.475, -1.15],
    scale: [0.135, 0.033, 0.09],
    bone: hips,
    name: "snowOnRuneStone",
  });

  for (let i = 0; i < 4; i++) {
    const x = 0.49 + random() * 0.10;
    const z = -1.38 + random() * 0.25;
    const h = 0.08 + random() * 0.12;
    b.part(new THREE.ConeGeometry(0.027, h, 5), C.ice, {
      at: [x, 0.145 + h / 2, z],
      rotation: [random() * 14 - 7, random() * 80, random() * 14 - 7],
      bone: hips,
      name: "frostCrystal",
    });
  }

  for (const [x, z, w, d] of [
    [0.49, 0.83, 0.14, 0.18],
    [-0.50, 0.38, 0.13, 0.27],
    [0.47, -0.79, 0.16, 0.21],
    [-0.29, -1.64, 0.21, 0.14],
    [0.04, 1.08, 0.21, 0.09],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
      at: [x, 0.15, z],
      scale: [w, 0.028, d],
      bone: hips,
      name: "windDrift",
    });
  }

  // Embedded dark chips interrupt the otherwise straight edge of the snow.
  for (const [x, z, angle] of [
    [-0.53, 0.72, -16],
    [0.57, 0.53, 24],
    [-0.39, -1.72, 5],
    [0.38, -1.77, -33],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, 0.122, z],
      scale: [0.105, 0.04, 0.12],
      rotation: [0, angle, 0],
      bone: hips,
      name: "exposedSlateChip",
    });
  }

  return b.root;
}
```
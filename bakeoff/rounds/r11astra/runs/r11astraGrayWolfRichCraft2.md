```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
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
  name: "Frostfang — Gray Wolf",
  description:
    "An alert northern gray wolf with a powerful, angular silhouette, layered silver mane, amber eyes and heavy paws, standing on a small snow-covered slate outcrop.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(8317);

  const C = {
    charcoal: "#242e3c",
    deep: "#303d4e",
    dark: "#415166",
    slate: "#596c80",
    gray: "#758798",
    silver: "#a2b1bc",
    light: "#c4ced1",
    cream: "#deded0",
    ivory: "#eee9d7",
    black: "#131e29",
    mouth: "#322632",
    gum: "#6d4c57",
    tongue: "#a5777d",
    claw: "#353c48",
    snow: "#e1edf0",
    snowShade: "#aac6d6",
    rock: "#34495d",
    ice: "#8ed4e3",
    rune: "#a6f4fb",
  };

  const coat = paint((p, n) => {
    const grain = noise(
      new THREE.Vector3(p.x * 1.5, p.y * 2, p.z * 0.42),
      0.09,
      12,
    );
    const top = Math.max(0, n.y);
    let color = mix(C.slate, C.silver, 0.25 + grain * 0.45 + top * 0.16);
    if (n.y < -0.35) color = mix(color, C.light, (-n.y - 0.35) * 0.6);
    return color;
  });

  const manePaint = paint((p, n, s) => {
    const stripe = noise(
      new THREE.Vector3(p.x * 2, p.y * 0.3, p.z * 2),
      0.047,
      23,
    );
    const ridge = Math.abs(s[0]) < 0.014 ? 0.09 : 0;
    return mix(
      C.dark,
      C.silver,
      0.26 + stripe * 0.32 + Math.max(0, n.y) * 0.22 + ridge,
    );
  });

  const paleFur = paint((p, n) => {
    const v = noise(new THREE.Vector3(p.x, p.y * 0.25, p.z), 0.06, 7);
    return mix(C.silver, C.cream, 0.42 + 0.25 * v + 0.2 * Math.max(0, n.y));
  });

  const darkFur = paint((p, n) =>
    mix(
      C.charcoal,
      C.slate,
      0.17 + noise(p, 0.1, 42) * 0.37 + Math.max(0, n.y) * 0.12,
    ),
  );

  const headPaint = paint((p, n) => {
    const cheek = p.y < 1.59 && Math.abs(p.x) > 0.095;
    if (cheek) return paleFur;
    const crown = p.y > 1.77 || (Math.abs(p.x) < 0.105 && p.z < 1.0);
    return crown ? darkFur : coat;
  });

  const stonePaint = paint((p, n) =>
    mix(
      "#26394b",
      "#597286",
      0.16 + noise(p, 0.19, 17) * 0.45 + Math.max(0, n.y) * 0.2,
    ),
  );

  const snowPaint = paint((p, n) =>
    mix(
      C.snowShade,
      "#eef3ed",
      Math.max(0, n.y) * 0.57 + noise(p, 0.16, 11) * 0.25,
    ),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 100">
      <defs>
        <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8d3c16"/>
          <stop offset=".46" stop-color="#e79827"/>
          <stop offset="1" stop-color="#ffe09a"/>
        </linearGradient>
      </defs>
      <path d="M7 49 Q40 10 84 20 Q125 21 154 43 Q123 81 77 83 Q32 82 7 49Z"
        fill="#111b27" stroke="#111b27" stroke-width="5"/>
      <path d="M18 49 Q51 24 85 27 Q120 27 143 44 Q115 73 77 75 Q43 73 18 49Z"
        fill="url(#amber)"/>
      <path d="M78 29 Q94 46 85 72 Q71 68 70 50 Q70 38 78 29Z" fill="#101923"/>
      <path d="M30 58 Q48 72 65 72 M100 67 L113 61 M116 57 L127 49"
        fill="none" stroke="#ffe9b2" stroke-width="3"/>
      <ellipse cx="64" cy="38" rx="10" ry="6" fill="#fff7d9"/>
      <circle cx="94" cy="59" r="3.3" fill="#fff5d6"/>
      <path d="M14 44 Q72 8 145 38" fill="none" stroke="#263443" stroke-width="8"/>
    </svg>`,
    { size: 384 },
  );

  const muzzleTexture = svg(
    `<svg viewBox="0 0 160 80">
      <path d="M13 49 Q76 71 149 37" fill="none" stroke="#536170" stroke-width="5" stroke-linecap="round"/>
      <g fill="#475565">
        <ellipse cx="36" cy="25" rx="5" ry="4"/>
        <ellipse cx="62" cy="35" rx="4.5" ry="3.5"/>
        <ellipse cx="88" cy="24" rx="4" ry="3.2"/>
        <ellipse cx="106" cy="39" rx="3.5" ry="3"/>
        <ellipse cx="53" cy="13" rx="3.3" ry="3"/>
      </g>
      <path d="M16 59 L36 65 M29 64 L42 69" stroke="#f0eddf" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg viewBox="0 0 128 80">
      <path d="M12 27 Q32 8 55 15 M74 15 Q99 9 116 27"
        stroke="#687d8b" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M18 39 Q32 22 46 36 Q40 47 24 48Z M82 36 Q98 23 111 39 L106 49 Q87 48 82 36Z"
        fill="#08131d"/>
      <path d="M64 36 L64 67" stroke="#0a1620" stroke-width="4" fill="none"/>
      <g fill="#85949b">
        <circle cx="47" cy="23" r="2"/><circle cx="57" cy="20" r="2"/>
        <circle cx="70" cy="20" r="2"/><circle cx="79" cy="24" r="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const scarTexture = svg(
    `<svg viewBox="0 0 100 130">
      <path d="M22 10 L36 51 L27 77 L48 119 L41 71 L47 47Z" fill="#344454"/>
      <path d="M30 13 L42 49 L35 74 L49 113 L43 71 L49 46Z" fill="#ccd4d4"/>
      <path d="M56 19 L66 53 L61 72 L77 103 L71 66 L75 49Z" fill="#d9dfd8"/>
    </svg>`,
    { size: 256 },
  );

  const furMarkTexture = svg(
    `<svg viewBox="0 0 180 160">
      <path d="M9 20 L56 48 L29 69 L87 117 L56 66 L78 51Z" fill="#344657"/>
      <path d="M73 12 L112 39 L93 65 L150 136 L120 64 L133 42Z" fill="#43586b"/>
      <path d="M17 25 L54 43 M83 18 L113 36" stroke="#bdcbd2" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M50 13 L50 145 M50 24 L20 47 L50 69 L80 47Z
        M23 94 L50 116 L77 94 M32 134 L50 146 L68 134"
        fill="none" stroke="#41647a" stroke-width="13" stroke-linejoin="miter"/>
      <path d="M50 13 L50 145 M50 24 L20 47 L50 69 L80 47Z
        M23 94 L50 116 L77 94 M32 134 L50 146 L68 134"
        fill="none" stroke="#a6f4fb" stroke-width="5" stroke-linejoin="miter"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton. The front is +Z; each paw and each toe has its own usable joint.
  const hips = b.joint("hips", {
    at: [0, 1.06, -0.55],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 1.06, -0.55],
      [0, 1.10, -0.15],
      [0, 1.22, 0.30],
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
      [0, 1.22, 0.30],
      [0, 1.44, 0.46],
      [0, 1.62, 0.68],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3"], role: "neck" },
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
      at: hp(s * 0.185, 0.185, -0.015),
      dir: [s * 0.16, 1, 0.02],
      role: "hinge",
    }),
  }));

  const legs = [-1, 1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [true, false].map((front) => {
      const suffix = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [s * 0.27, 1.20, 0.28],
            [s * 0.29, 0.72, 0.30],
            [s * 0.30, 0.29, 0.49],
            [s * 0.30, 0.205, 0.56],
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
        contact: [points[3][0], 0.12, points[3][2] + 0.06],
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

  // Small, faceted environment; the animal remains the dominant silhouette.
  const groundOutline = [
    [-0.61, 0.075, 1.25],
    [-0.73, 0.075, 0.55],
    [-0.68, 0.075, -0.55],
    [-0.47, 0.075, -1.76],
    [0.11, 0.075, -1.94],
    [0.57, 0.075, -1.67],
    [0.70, 0.075, -0.72],
    [0.74, 0.075, 0.55],
    [0.53, 0.075, 1.34],
    [-0.10, 0.075, 1.45],
  ];
  b.slab(groundOutline, {
    thickness: 0.15,
    color: stonePaint,
    bone: hips,
    name: "slateOutcrop",
  });

  b.slab(
    groundOutline.map(([x, _y, z]) => [x * 0.97, 0.137, z * 0.985]),
    {
      thickness: 0.027,
      color: snowPaint,
      bone: hips,
      name: "windPackedSnow",
    },
  );

  // A few broken dark slate edges emerge from the snow.
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const x = Math.sin(angle) * (0.59 + random() * 0.07);
    const z = Math.cos(angle) * (1.35 + random() * 0.2) - 0.15;
    const size = 0.07 + random() * 0.075;
    b.part(new THREE.DodecahedronGeometry(size, 0), stonePaint, {
      at: [x, 0.08, z],
      scale: [1.2, 0.55, 1.45],
      rotation: [0, random() * 180, 0],
      bone: hips,
      name: "brokenSlate",
    });
  }

  // Main masses: broad shoulders, tucked waist, raised neck and long lupine head.
  const torso = b.sweep(
    spine,
    (t) => {
      const width = 0.28 - 0.055 * Math.sin(t * Math.PI) + 0.06 * t;
      const depth = 0.30 - 0.045 * Math.sin(t * Math.PI) + 0.105 * t;
      return [width, depth];
    },
    {
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "powerfulTorso",
    },
  );

  const neckMass = b.sweep(neck, [0.32, 0.30, 0.235], {
    color: coat,
    sides: 9,
    smooth: false,
    caps: "round",
    name: "raisedNeck",
  });

  const chestBib = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    paleFur,
    {
      at: [0, 1.18, 0.52],
      scale: [0.255, 0.34, 0.19],
      bone: neck.joints[0],
      flat: true,
      name: "creamBreast",
    },
  );

  b.part(new THREE.SphereGeometry(1, 10, 6), paleFur, {
    at: [0, 0.94, -0.07],
    scale: [0.235, 0.22, 0.49],
    bone: spine.joints[0],
    flat: true,
    name: "paleUnderside",
  });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    at: hp(0, 0.025, 0.085),
    scale: [0.255, 0.255, 0.32],
    bone: head,
    flat: true,
    name: "angularSkull",
  });

  const upperMuzzle = b.loft(
    [
      { at: hp(0, -0.055, 0.22), w: 0.32, h: 0.20 },
      { at: hp(0, -0.085, 0.43), w: 0.265, h: 0.155 },
      { at: hp(0, -0.100, 0.61), w: 0.205, h: 0.125 },
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
      { at: hp(0, 0.004, 0.255), w: 0.205, h: 0.085 },
      { at: hp(0, -0.022, 0.43), w: 0.18, h: 0.065 },
      { at: hp(0, -0.061, 0.58), w: 0.15, h: 0.045 },
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
      { at: hp(0, -0.16, 0.14), w: 0.29, h: 0.12 },
      { at: hp(0, -0.205, 0.36), w: 0.23, h: 0.075 },
      { at: hp(0, -0.205, 0.58), w: 0.17, h: 0.063 },
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
      { at: hp(0, -0.148, 0.24), w: 0.24, h: 0.042 },
      { at: hp(0, -0.16, 0.42), w: 0.205, h: 0.035 },
      { at: hp(0, -0.165, 0.575), w: 0.155, h: 0.025 },
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
    at: hp(0, -0.095, 0.631),
    scale: [0.121, 0.077, 0.073],
    bone: head,
    flat: true,
    name: "blackNose",
  });

  b.decal(nose, noseTexture, {
    at: hp(0, -0.088, 0.705),
    dir: [0, 0.08, 1],
    size: [0.205, 0.123],
    bone: head,
    name: "noseNostrils",
  });

  // The muzzle is relaxed, just parted enough to show separate jaws.
  for (const s of [-1, 1]) {
    b.spike(
      hp(s * 0.100, -0.125, 0.43),
      hp(s * 0.105, -0.184, 0.44),
      null,
      0.019,
      { color: C.ivory, bone: head, sides: 5, name: "upperCanine" },
    );
    for (let i = 0; i < 2; i++) {
      b.spike(
        hp(s * (0.098 - i * 0.006), -0.19, 0.31 + i * 0.05),
        [0, 1, 0],
        0.023,
        0.012,
        { color: C.ivory, bone: jaw, sides: 5, name: "lowerTooth" },
      );
    }

    b.decal(upperMuzzle, muzzleTexture, {
      at: hp(s * 0.13, -0.074, 0.43),
      dir: [s, 0.05, 0.24],
      size: [0.255, 0.12],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
  }

  // Face first: the amber eyes are forward readable, underneath heavy angular brows.
  const skullSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = skullSurface.nearest(hp(s * 0.178, 0.099, 0.316));
    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 7),
      C.charcoal,
      hit,
      {
        scale: [0.085, 0.036, 0.061],
        embed: 0.42,
        bone: head,
        name: s > 0 ? "eyeSocketL" : "eyeSocketR",
      },
    );

    b.decal(socket, eyeTexture, {
      at: hit.at.clone().addScaledVector(hit.n, 0.035),
      dir: hit.n,
      size: [0.143, 0.085],
      mirror: s > 0,
      bone: head,
      segments: 7,
      lift: 0.002,
      name: s > 0 ? "amberEyeL" : "amberEyeR",
    });

    b.sweep(
      [
        hp(s * 0.095, 0.142, 0.308),
        hp(s * 0.180, 0.165, 0.267),
        hp(s * 0.251, 0.125, 0.178),
      ],
      [0.036, 0.048, 0.015],
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
        hp(s * 0.11, 0.174, 0.272),
        hp(s * 0.18, 0.192, 0.222),
        hp(s * 0.24, 0.152, 0.150),
      ],
      [0.019, 0.026, 0.004],
      {
        color: coat,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "browHighlight",
      },
    );
  }

  // Thick triangular ears, with dark rims and inset warm-gray inner planes.
  for (const { s, joint } of ears) {
    const earAt = hp(s * 0.165, 0.16, -0.02);
    b.extrude(
      [
        [-0.11, 0],
        [-0.105, 0.13],
        [-0.035, 0.365],
        [0.005, 0.405],
        [0.10, 0.13],
        [0.13, 0.015],
      ],
      {
        at: earAt,
        x: [s, 0, 0],
        y: [s * 0.13, 0.985, -0.09],
        thickness: [0.105, 0.035],
        color: darkFur,
        bone: joint,
        name: "pointedEarRim",
      },
    );

    b.extrude(
      [
        [-0.072, 0.048],
        [-0.063, 0.13],
        [-0.023, 0.314],
        [0.005, 0.346],
        [0.065, 0.13],
        [0.079, 0.045],
      ],
      {
        at: earAt.clone().add(new THREE.Vector3(0, 0, 0.054)),
        x: [s, 0, 0],
        y: [s * 0.13, 0.985, -0.09],
        thickness: 0.014,
        color: "#8c9294",
        bone: joint,
        name: "innerEar",
      },
    );

    b.extrude(
      [
        [-0.052, 0.045],
        [-0.050, 0.13],
        [-0.012, 0.268],
        [0.029, 0.124],
        [0.057, 0.05],
      ],
      {
        at: earAt.clone().add(new THREE.Vector3(0, 0, 0.064)),
        x: [s, 0, 0],
        y: [s * 0.13, 0.985, -0.09],
        thickness: 0.009,
        color: "#565967",
        bone: joint,
        name: "earInnerShadow",
      },
    );

    for (let j = 0; j < 3; j++) {
      b.extrude(
        [
          [-0.028, 0],
          [-0.02, 0.07],
          [0.0, 0.11 + j * 0.012],
          [0.012, 0.06],
          [0.03, 0.005],
        ],
        {
          at: hp(s * (0.12 + j * 0.034), 0.18, 0.064),
          x: [1, 0, 0],
          y: [s * 0.16, 1, 0.15],
          thickness: 0.025,
          color: paleFur,
          bone: joint,
          name: "earBaseTuft",
        },
      );
    }
  }

  // A broad fur lock. These are real thick, angular shapes rather than a smooth coat.
  function furLock(
    on: ReturnType<ReturnType<typeof b.surface>["nearest"]>,
    length: number,
    width: number,
    fill: Parameters<typeof b.part>[1],
    flow: number[],
    name: string,
    lift = 0.34,
  ) {
    const n = on.n.clone().normalize();
    const direction = new THREE.Vector3(flow[0], flow[1], flow[2]).normalize();
    const tangent = direction.clone().addScaledVector(n, -direction.dot(n));
    if (tangent.lengthSq() < 0.001) tangent.set(0, -1, -0.2);
    tangent.normalize();
    const y = tangent.addScaledVector(n, lift).normalize();
    const x = y.clone().cross(n).normalize();
    const origin = on.at.clone().addScaledVector(n, -0.012);
    return b.extrude(
      [
        [-width * 0.46, 0],
        [-width * 0.55, length * 0.25],
        [-width * 0.33, length * 0.58],
        [-width * 0.08, length],
        [width * 0.10, length * 0.70],
        [width * 0.33, length * 0.82],
        [width * 0.42, length * 0.38],
        [width * 0.46, length * 0.06],
      ],
      {
        at: origin,
        x,
        y,
        thickness: [width * 0.31, 0.007],
        color: fill,
        bone: on.bone!,
        name,
      },
    );
  }

  // Cheek ruffs define the wolf's diamond-shaped face without covering the eyes.
  for (const s of [-1, 1]) {
    const cheek = b.part(new THREE.SphereGeometry(1, 8, 6), paleFur, {
      at: hp(s * 0.205, -0.066, 0.095),
      scale: [0.105, 0.15, 0.20],
      bone: head,
      flat: true,
      name: "cheekMass",
    });
    const faceSurface = b.surface([skull, cheek]);
    const cheekRows = [
      [0.23, 0.005, 0.14, 0.23, 0.14],
      [0.245, -0.055, 0.11, 0.275, 0.15],
      [0.20, -0.115, 0.15, 0.24, 0.13],
      [0.19, -0.145, 0.05, 0.20, 0.115],
    ];
    cheekRows.forEach(([x, y, z, l, w], i) => {
      const hit = faceSurface.nearest(hp(s * x, y, z));
      furLock(
        hit,
        l,
        w,
        i === 0 ? coat : paleFur,
        [s * 0.65, -0.55, -0.75],
        "angularCheekRuff",
        0.43,
      );
    });

    b.sweep(
      [
        hp(s * 0.218, 0.012, 0.244),
        hp(s * 0.253, -0.024, 0.17),
        hp(s * 0.255, -0.08, 0.085),
      ],
      [0.016, 0.025, 0.003],
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
    at: hp(-0.232, 0.02, 0.17),
    dir: [-1, 0.08, 0.40],
    size: [0.074, 0.118],
    bone: head,
    roll: -12,
    name: "oldCheekScar",
  });

  // Deliberately layered ruff: dark inner silhouette, silver outside, cream throat.
  const ruffSurface = b.surface([neckMass, torso, chestBib]);
  for (const s of [-1, 1]) {
    const rows = [
      { y: 1.53, z: 0.40, x: 0.245, length: 0.25, width: 0.14 },
      { y: 1.43, z: 0.39, x: 0.285, length: 0.29, width: 0.17 },
      { y: 1.32, z: 0.34, x: 0.315, length: 0.32, width: 0.18 },
      { y: 1.20, z: 0.24, x: 0.325, length: 0.29, width: 0.18 },
      { y: 1.10, z: 0.17, x: 0.305, length: 0.255, width: 0.16 },
    ];
    rows.forEach((row, i) => {
      for (let layer = 0; layer < 2; layer++) {
        const hit = ruffSurface.nearest([
          s * row.x,
          row.y + layer * 0.015,
          row.z + layer * 0.17,
        ]);
        furLock(
          hit,
          row.length * (layer ? 0.84 : 1),
          row.width,
          layer ? coat : manePaint,
          [s * 0.22, -0.63, -0.82],
          "layeredShoulderMane",
          layer ? 0.24 : 0.42,
        );
      }
    });
  }

  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.065;
    const hit = ruffSurface.nearest([x, 1.16 + Math.abs(x) * 0.6, 0.70]);
    furLock(
      hit,
      0.24 - Math.abs(x) * 0.34,
      0.105,
      paleFur,
      [x * 1.8, -1, 0.03],
      "pointedChestBib",
      0.25,
    );
  }

  // The dark saddle has a coarse, broken silhouette along the spine.
  const torsoSurface = b.surface(torso);
  for (let i = 0; i < 8; i++) {
    const z = 0.23 - i * 0.109;
    for (const s of [-1, 1]) {
      const hit = torsoSurface.nearest([s * 0.105, 1.60, z]);
      furLock(
        hit,
        0.19 + 0.04 * Math.sin(i * 0.8),
        0.16,
        darkFur,
        [s * 0.25, -0.05, -1],
        "brokenDarkSaddle",
        0.23,
      );
    }
  }

  // Strong articulated legs and broad separated toes.
  for (const leg of legs) {
    const { chain, points, front, foot, toes, s, suffix } = leg;
    const legTube = b.sweep(
      chain,
      front ? [0.153, 0.125, 0.078, 0.09] : [0.185, 0.15, 0.072, 0.083],
      {
        color: coat,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `legMass${suffix}`,
      },
    );

    if (!front) {
      b.part(new THREE.SphereGeometry(1, 9, 7), coat, {
        at: [points[0][0], 0.91, -0.46],
        scale: [0.205, 0.29, 0.235],
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
          [end[0], end[1] + 0.003, end[2] + 0.068],
          [end[0], 0.136, end[2] + 0.086],
        ),
        [0.018, 0],
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
        [0.007, 0.002],
        {
          color: C.silver,
          bone: digit.joints[0],
          sides: 4,
          caps: "flat",
          name: "toeCrease",
        },
      );
    }

    const legSurface = b.surface([legTube, paw]);
    for (let i = 0; i < 3; i++) {
      const y = front ? 0.87 - i * 0.11 : 0.88 - i * 0.10;
      const z = front ? 0.24 : -0.55;
      const hit = legSurface.nearest([s * (front ? 0.385 : 0.435), y, z]);
      furLock(
        hit,
        front ? 0.16 : 0.20,
        front ? 0.105 : 0.125,
        i === 2 ? paleFur : manePaint,
        [s * 0.12, -0.8, -0.5],
        `legFeathering${suffix}`,
        0.34,
      );
    }

    if (front) {
      const sock = b.sweep(
        [
          [points[2][0], 0.41, 0.445],
          [points[2][0], 0.28, 0.50],
        ],
        [0.082, 0.087],
        {
          color: paleFur,
          bone: chain.joints[1],
          sides: 7,
          smooth: false,
          name: `silverSock${suffix}`,
        },
      );
      const sockHit = b.surface(sock).nearest([s * 0.30, 0.35, 0.59]);
      furLock(sockHit, 0.10, 0.09, paleFur, [0, -1, 0.15], "wristTuft", 0.2);

      b.spike(
        [s * 0.237, 0.42, 0.43],
        [s * 0.215, 0.37, 0.46],
        null,
        0.018,
        {
          color: C.claw,
          bone: chain.joints[1],
          sides: 5,
          name: "dewClaw",
        },
      );
    }
  }

  // Lateral fur markings painted on the simple torso mass.
  for (const s of [-1, 1]) {
    b.decal(torso, furMarkTexture, {
      at: [s * 0.29, 1.12, -0.38],
      dir: [s, 0.08, 0],
      size: [0.32, 0.28],
      mirror: s < 0,
      name: "flankCoatMarkings",
    });
  }

  // A long, relaxed bushy tail, fully separated from the hind legs.
  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = 0.125 + Math.sin(t * Math.PI) * 0.065;
      const fade = t > 0.72 ? 1 - (t - 0.72) / 0.30 : 1;
      return [Math.max(0.014, r * fade), Math.max(0.014, r * 0.95 * fade)];
    },
    {
      color: coat,
      sides: 8,
      smooth: false,
      caps: "round",
      sectors: [
        [-65, 65, darkFur],
        [125, 235, paleFur],
      ],
      name: "bushyTail",
    },
  );

  const tailSurface = b.surface(tailTube);
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.115;
    const center = tail.at(t).at;
    for (const s of [-1, 1]) {
      const hit = tailSurface.nearest(
        center.clone().add(new THREE.Vector3(s * 0.3, 0.015, 0)),
      );
      furLock(
        hit,
        0.20 - t * 0.06,
        0.11 - t * 0.023,
        i > 4 ? darkFur : coat,
        [s * 0.12, -0.3, -1],
        "tailSideLocks",
        0.3,
      );
    }
    if (i < 5) {
      const underside = tailSurface.nearest(
        center.clone().add(new THREE.Vector3(0, -0.3, 0)),
      );
      furLock(
        underside,
        0.18,
        0.12,
        paleFur,
        [0, -0.3, -1],
        "tailUndersideLocks",
        0.22,
      );
    }
  }

  // A low broken frost-rune stone at the back edge: atmosphere, not an accessory.
  const runeStone = b.extrude(
    [
      [-0.13, 0],
      [-0.15, 0.22],
      [-0.08, 0.38],
      [0.03, 0.42],
      [0.13, 0.30],
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
      at: [-0.48, 0.33, -1.049],
      dir: [0, 0, 1],
      size: [0.11, 0.23],
      bone: hips,
      lift: 0.002,
      name: "faintFrostRune",
    }),
    0.65,
  );

  b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
    at: [-0.49, 0.50, -1.15],
    scale: [0.14, 0.042, 0.095],
    bone: hips,
    name: "snowOnRuneStone",
  });

  for (let i = 0; i < 5; i++) {
    const x = 0.49 + random() * 0.10;
    const z = -1.38 + random() * 0.25;
    const h = 0.09 + random() * 0.14;
    const crystal = b.part(new THREE.ConeGeometry(0.025, h, 5), C.ice, {
      at: [x, 0.145 + h / 2, z],
      rotation: [random() * 16 - 8, random() * 80, random() * 16 - 8],
      bone: hips,
      name: "frostCrystal",
    });
    if (i === 1) glow(crystal, 0.35);
  }

  // Sparse wind-sculpted snow lips keep the base rough and asymmetric.
  for (const [x, z, w, d] of [
    [0.51, 0.94, 0.16, 0.20],
    [-0.50, 0.38, 0.13, 0.27],
    [0.47, -0.79, 0.16, 0.21],
    [-0.29, -1.64, 0.21, 0.14],
    [0.10, 1.29, 0.23, 0.11],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), snowPaint, {
      at: [x, 0.15, z],
      scale: [w, 0.038, d],
      bone: hips,
      name: "windDrift",
    });
  }

  // Small scratches in the exposed front rock, intentionally non-luminous.
  for (let i = 0; i < 4; i++) {
    b.rod(
      [-0.27 + i * 0.055, 0.075, 1.395],
      [-0.25 + i * 0.055, 0.034, 1.410],
      0.006,
      { color: "#8299a8", bone: hips, sides: 4, name: "slateEdgeScratch" },
    );
  }

  return b.root;
}
```
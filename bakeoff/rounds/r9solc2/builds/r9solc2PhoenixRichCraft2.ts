import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  mix,
  noise,
  mottle,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aureflare, Phoenix of the Dawn",
  description:
    "An elemental phoenix with a fiercely avian face, swept flame crown, layered vermilion wings, luminous curling tail pennants, and a turquoise-inlaid solar shrine.",
};

type P = [number, number, number];

/*
1. Reshape the face: a shorter hooked beak, cream cheek planes, narrower eyes,
   and a small forehead marking replace the mask-like central stripe.
2. Break up the exposed wing spars with a flame-shaped leading-edge mantle.
   Stagger feather depth and sharpen their silhouettes for a fuller wing.
3. Give the crown curved, forked flame silhouettes instead of straight spikes.
4. Replace the muddy tail with vivid, softly emissive vermilion pennants,
   brighter inner flames, and properly seated ornaments.
5. Root the living flames in the plumage, and keep only a few airborne embers.
   Preserve the strong shrine composition and separated, riggable digits.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Aureflare",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(47821);
  const H = 1.1;
  const C = {
    ink: "#39182e",
    wine: "#751b39",
    crimson: "#b92c3b",
    red: "#ed4936",
    orange: "#ff8a36",
    gold: "#efbb58",
    pale: "#fff0b2",
    ivory: "#fff5d8",
    teal: "#36d4bf",
    tealDark: "#11595f",
    slate: "#203c48",
  };

  const hp = (x: number, y: number, z: number): P => [
    x * H,
    2.51 + y * H,
    0.2 + z * H,
  ];
  const add = (a: P, c: P): P => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
  const tup = (v: THREE.Vector3): P => [v.x, v.y, v.z];

  // Skeleton, including independent lower jaw, flight fans, and tail chains.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.19, -0.15],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.19, -0.15],
      [0, 1.52, -0.075],
      [0, 1.88, 0],
      [0, 2.03, 0.035],
    ],
    {
      parent: hips,
      names: ["spine1", "chest", "withers", "neckBase"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.025, 0.035],
      [0, 2.22, 0.005],
      [0, 2.4, 0.11],
      hp(0, 0, 0),
    ]),
    { parent: spine.tip!, count: 3, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: hp(0, 0, 0),
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.08, 0.13),
    dir: [0, 0, 1],
    role: "jaw",
  });
  type J = typeof root;

  const wingRigs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      [
        [s * 0.24, 1.96, -0.04],
        [s * 0.91, 2.22, -0.115],
        [s * 1.52, 2.45, -0.22],
        [s * 1.87, 2.52, -0.27],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    const fans: J[] = [];
    for (let i = 0; i < 4; i++) {
      fans.push(
        b.joint(`flightFan${side}${i + 1}`, {
          parent: wing.joints[2],
          at: [s * (1.13 + i * 0.215), 2.31 + i * 0.061, -0.22],
          dir: [s * 0.35, -0.9, 0],
          role: "fan",
        }),
      );
    }
    return { s, side, wing, fans };
  });

  const legRigs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.175, 1.24, -0.11],
        [s * 0.235, 0.9, 0.02],
        [s * 0.25, 0.48, 0.07],
        [s * 0.255, 0.29, 0.15],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
        contact: [s * 0.255, 0.175, 0.2],
      },
    );
    const toes = [-1, 0, 1, 2].map((i) => {
      const rear = i === 2;
      const start: P = [s * 0.255, 0.29, rear ? 0.1 : 0.17];
      const mid: P = [
        s * 0.255 + (rear ? s * 0.045 : i * 0.075),
        0.235,
        rear ? -0.025 : 0.32,
      ];
      const end: P = [
        s * 0.255 + (rear ? s * 0.08 : i * 0.125),
        0.215,
        rear ? -0.16 : i === 0 ? 0.49 : 0.405,
      ];
      const chain = b.chain(`toe${side}${i + 2}`, [start, mid, end], {
        parent: leg.tip!,
        names: [`toe${side}${i + 2}Base`, `toe${side}${i + 2}Tip`],
        role: "digit",
      });
      return { chain, end, rear };
    });
    return { s, side, leg, toes };
  });

  const tailDefinitions: { name: string; points: P[]; width: number }[] = [
    {
      name: "tailCenter",
      width: 0.40,
      points: [
        [0, 1.31, -0.3],
        [0.035, 1.04, -0.58],
        [-0.04, 0.65, -0.87],
        [0.03, 0.31, -1.16],
        [0, 0.38, -1.43],
      ],
    },
    ...[1, -1].flatMap((s) => [
      {
        name: s > 0 ? "tailOuterL" : "tailOuterR",
        width: 0.40,
        points: [
          [s * 0.12, 1.35, -0.24],
          [s * 0.43, 1.05, -0.48],
          [s * 0.73, 0.72, -0.61],
          [s * 1.07, 0.67, -0.68],
          [s * 1.20, 1.02, -0.73],
        ] as P[],
      },
      {
        name: s > 0 ? "tailInnerL" : "tailInnerR",
        width: 0.32,
        points: [
          [s * 0.075, 1.27, -0.31],
          [s * 0.24, 0.94, -0.6],
          [s * 0.45, 0.56, -0.91],
          [s * 0.66, 0.32, -1.08],
          [s * 0.85, 0.54, -1.20],
        ] as P[],
      },
    ]),
  ];
  const tailRigs = tailDefinitions.map((d) => ({
    ...d,
    chain: b.chain(d.name, catmull(d.points), {
      parent: hips,
      count: 5,
      role: "tail",
    }),
  }));

  const bodyPaint = paint((p, n) => {
    const t = Math.max(0, Math.min(1, 0.45 + n.y * 0.22 + n.z * 0.26));
    return mix("#81213d", "#f4563c", t + 0.09 * noise(p, 0.11, 6));
  });
  const goldPaint = paint((p, n) =>
    mix(
      "#bb7936",
      "#ffe6a0",
      Math.max(0, Math.min(1, 0.52 + n.y * 0.28 + n.z * 0.12 + noise(p, 0.055, 4) * 0.15)),
    ),
  );
  const stonePaint = paint((p, n) =>
    mix("#182e3b", n.y > 0.5 ? "#55716f" : "#36505d", noise(p, 0.17, 18)),
  );
  const palePaint = mottle("#f3c77e", "#fff2ca", { size: 0.09, seed: 8 });
  const shinPaint = paint((p, n) =>
    mix("#915d3c", "#e1b56d", 0.35 + n.z * 0.2 + noise(p, 0.035, 12) * 0.35),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 112">
      <defs>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b64b23"/>
          <stop offset=".52" stop-color="#ffc644"/>
          <stop offset="1" stop-color="#fff7b0"/>
        </linearGradient>
        <clipPath id="eye"><path d="M13 57 Q57 17 105 35 L148 46 Q108 91 63 85 Q29 82 13 57Z"/></clipPath>
      </defs>
      <path d="M5 53 Q53 7 107 27 L156 36 L145 51 Q108 96 60 92 Q22 88 5 53Z" fill="#4a1830"/>
      <g clip-path="url(#eye)">
        <rect width="160" height="112" fill="#fff2c8"/>
        <ellipse cx="84" cy="57" rx="32" ry="40" fill="url(#iris)"/>
        <ellipse cx="84" cy="57" rx="30" ry="38" fill="none" stroke="#e47728" stroke-width="4"/>
        <path d="M85 23 Q98 57 85 89 Q72 57 85 23" fill="#421b36"/>
        <ellipse cx="72" cy="41" rx="9" ry="12" fill="#fffdf0"/>
        <circle cx="99" cy="72" r="5" fill="#ffffff"/>
      </g>
      <path d="M7 52 Q54 12 107 29 L157 36 L141 48 Q99 26 61 39Z" fill="#4a1830"/>
      <path d="M22 23 Q66 4 119 15 L144 23 L110 22 Q60 14 22 30Z" fill="#ffd879"/>
      <path d="M30 89 Q65 105 105 88" stroke="#f8c76c" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const featherTexture = svg(
    `<svg viewBox="0 0 128 512">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M64 480 C45 390 79 300 62 207 C52 140 70 68 64 28"
          stroke="#a23936" stroke-width="10"/>
        <path d="M64 480 C45 390 79 300 62 207 C52 140 70 68 64 28"
          stroke="#ffdd85" stroke-width="4"/>
        <path d="M61 398 Q30 351 31 301 M62 346 Q96 302 98 261
                 M64 286 Q31 242 35 203 M61 232 Q93 197 90 162
                 M62 176 Q44 142 47 115 M63 128 Q79 100 77 77"
          stroke="#ffd175" stroke-width="3"/>
        <path d="M62 453 Q25 422 35 388 Q43 369 47 350
                 M65 367 Q105 333 94 303 M61 263 Q25 226 41 188"
          stroke="#ffad4a" stroke-width="4"/>
        <path d="M64 76 Q50 109 57 138 Q36 113 47 86 Q60 58 64 28
                 Q68 66 79 87 Q89 111 71 137 Q77 107 64 76Z"
          fill="#fff1ad" stroke="none"/>
        <path d="M64 461 L52 437 L64 407 L77 437Z" fill="#ffd779" stroke="#a34935" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const crownTexture = svg(
    `<svg viewBox="0 0 96 320">
      <path d="M48 304 Q17 243 42 177 Q59 127 48 58 Q80 123 61 175 Q36 235 48 304Z"
        fill="#fff0a6"/>
      <path d="M48 297 Q42 226 52 188 Q70 131 48 36" stroke="#ffce60" stroke-width="4" fill="none"/>
      <path d="M48 280 L29 248 L48 216 L67 248Z" fill="none" stroke="#fff4bd" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const medallionTexture = svg(
    `<svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="74" fill="#69263a" stroke="#ffd786" stroke-width="5"/>
      <circle cx="80" cy="80" r="63" fill="none" stroke="#eaa84e" stroke-width="3"/>
      <path d="M80 17 L91 53 L121 39 L108 67 L145 80 L108 93 L121 121 L93 108
        L80 145 L67 108 L39 121 L52 93 L15 80 L52 67 L39 39 L67 52Z"
        fill="#f5bc58" stroke="#fff0af" stroke-width="3"/>
      <path d="M80 43 L105 80 L80 118 L55 80Z" fill="#123f51" stroke="#fff1b6" stroke-width="5"/>
      <path d="M80 56 L96 80 L80 105 L64 80Z" fill="#41cdb7"/>
      <path d="M80 60 L80 96 L68 80Z" fill="#a8ffe1"/>
    </svg>`,
    { size: 384 },
  );

  let runeMarks = "";
  for (let i = 0; i < 16; i++) {
    runeMarks += `<g transform="rotate(${i * 22.5} 256 256)">
      <path d="M250 48 L250 73 L264 65 L264 87 M245 80 L259 88"
        fill="none" stroke="#e5b66c" stroke-width="4"/>
      <path d="M256 106 L247 120 L256 134 L265 120Z" fill="#4ebcab"/>
    </g>`;
  }
  const shrineTexture = svg(
    `<svg viewBox="0 0 512 512">
      <g fill="none" stroke="#b68d55">
        <circle cx="256" cy="256" r="243" stroke-width="5"/>
        <circle cx="256" cy="256" r="225" stroke-width="2"/>
        <circle cx="256" cy="256" r="157" stroke-width="4"/>
        <circle cx="256" cy="256" r="144" stroke-width="2"/>
        <path d="M256 118 L290 222 L394 256 L290 290 L256 394 L222 290 L118 256 L222 222Z"
          stroke="#e4b364" stroke-width="5"/>
        <path d="M256 171 L314 256 L256 341 L198 256Z" stroke-width="3"/>
        <circle cx="256" cy="256" r="30" stroke="#e4b364" stroke-width="6"/>
      </g>${runeMarks}
    </svg>`,
    { size: 768 },
  );

  const tailTexture = svg(
    `<svg viewBox="0 0 128 256">
      <path d="M64 246 Q12 192 37 139 Q75 85 64 10 Q120 96 83 144 Q47 195 64 246Z"
        fill="none" stroke="#fff0b5" stroke-width="5"/>
      <path d="M64 215 Q39 180 60 151 Q83 122 65 83 Q103 135 77 166 Q59 187 64 215Z"
        fill="#fff0a6"/>
      <path d="M64 240 L48 218 L64 194 L80 218Z" fill="#51d9bf" stroke="#fff2b1" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  function orb(
    name: string,
    at: P,
    scale: P,
    color: string | ReturnType<typeof paint>,
    bone: J,
    segments = 8,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at, scale, bone, name, flat: true,
    });
  }

  type FeatherKind = "flight" | "covert" | "cream" | "crown";

  function feather(
    name: string,
    from: P,
    to: P,
    width: number,
    bone: J,
    kind: FeatherKind = "flight",
    decorated = true,
  ) {
    const A = new THREE.Vector3(...from);
    const D = new THREE.Vector3(...to).sub(A);
    const length = D.length();
    D.normalize();
    const X = new THREE.Vector3().crossVectors(D, new THREE.Vector3(0, 0, 1)).normalize();
    const N = new THREE.Vector3().crossVectors(X, D).normalize();
    const thickness = kind === "covert" ? 0.041 : kind === "crown" ? 0.032 : 0.049;

    const featherPaint = paint((p, n, uv) => {
      const t = Math.max(0, Math.min(1, uv[1] / length));
      const side = Math.abs(uv[0]) / width;
      const lit = Math.max(0, Math.min(1, n.y * 0.18 + n.z * 0.22 + 0.6));
      if (kind === "cream") {
        return mix("#edb668", "#fff3c5", 0.40 + t * 0.37 + lit * 0.18);
      }
      if (kind === "crown") {
        return mix("#ef4a35", "#ffe8a1", Math.pow(t, 0.7));
      }
      const base = kind === "covert" ? "#d43a43" : "#d03c49";
      let c = mix(base, "#ff9144", Math.min(1, t * 1.50));
      if (t > 0.68) c = mix(c, "#fff0b3", (t - 0.68) / 0.32);
      if (side > 0.46 && t > 0.15) c = mix(c, "#ffd27e", 0.6);
      const shade = 0.98 + (noise(p, 0.09, 3) - 0.5) * 0.025;
      return [c[0] * shade, c[1] * shade, c[2] * shade];
    });

    const ordinaryOutline: [number, number, "sharp"?][] = [
      [-width * 0.20, 0],
      [width * 0.20, length * 0.025],
      [width * 0.44, length * 0.20],
      [width * 0.49, length * 0.38],
      [width * 0.35, length * 0.59],
      [width * 0.19, length * 0.70],
      [width * 0.20, length * 0.79, "sharp"],
      [width * 0.07, length * 0.76],
      [0, length, "sharp"],
      [-width * 0.18, length * 0.77],
      [-width * 0.39, length * 0.58],
      [-width * 0.48, length * 0.35],
      [-width * 0.36, length * 0.12],
    ];
    const flameOutline: [number, number, "sharp"?][] = [
      [-width * 0.19, 0],
      [width * 0.18, length * 0.015],
      [width * 0.43, length * 0.18],
      [width * 0.45, length * 0.35],
      [width * 0.25, length * 0.54],
      [width * 0.27, length * 0.69],
      [width * 0.65, length * 0.83, "sharp"],
      [width * 0.24, length * 0.73],
      [width * 0.06, length * 0.81],
      [width * 0.07, length, "sharp"],
      [-width * 0.25, length * 0.85],
      [-width * 0.44, length * 0.65],
      [-width * 0.45, length * 0.45],
      [-width * 0.64, length * 0.36, "sharp"],
      [-width * 0.39, length * 0.32],
      [-width * 0.34, length * 0.13],
    ];
    const part = b.extrude(kind === "crown" ? flameOutline : ordinaryOutline, {
      at: from,
      x: X,
      y: D,
      thickness: [thickness, 0.006],
      bevel: 0.003,
      smoothing: 0,
      color: featherPaint,
      bone,
      name,
    });
    if (decorated) {
      glow(
        b.decal(part, kind === "crown" ? crownTexture : featherTexture, {
          at: A.clone().addScaledVector(D, length * 0.5),
          dir: N,
          up: D,
          size: [width * 1.08, length],
          segments: 6,
          lift: 0.0017,
          bone,
          name: `${name} filigree`,
        }),
        kind === "crown" ? 0.75 : 0.42,
      );
    }
    return part;
  }

  function diamond(name: string, at: P, size: number, bone: J, color = C.teal) {
    return b.part(new THREE.OctahedronGeometry(size, 0), color, {
      at,
      scale: [0.66, 1.2, 0.38],
      bone,
      name,
      flat: true,
    });
  }

  // Face: avian planes below the eyes, a clear eye line, and a short hook.
  const skull = orb(
    "Faceted head",
    hp(0, 0.015, -0.015),
    [0.235 * H, 0.198 * H, 0.265 * H],
    bodyPaint,
    head,
    12,
  );
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    orb(
      `Ivory cheek plane ${s}`,
      hp(s * 0.127, -0.091, 0.115),
      [0.105 * H, 0.069 * H, 0.137 * H],
      palePaint,
      head,
      7,
    );
    const hit = headSurface.around(hp(0, 0.015, -0.015)).at(s * 37, 17);
    b.decal(skull, eyeTexture, {
      at: hit,
      dir: hit.n,
      size: [0.190 * H, 0.112 * H],
      mirror: s > 0,
      lift: 0.002,
      segments: 12,
      bone: head,
      name: s > 0 ? "EyeL" : "EyeR",
    });
    const brow = headSurface.drape(
      [
        hp(s * 0.065, 0.135, 0.24),
        hp(s * 0.155, 0.151, 0.21),
        hp(s * 0.235, 0.108, 0.12),
      ],
      { lift: 0.006 },
    );
    b.sweep(brow, [0.017, 0.014, 0.003], {
      color: goldPaint,
      bone: head,
      sides: 6,
      name: `Solar brow ${s}`,
    });
    for (let i = 0; i < 3; i++) {
      feather(
        `Cheek flame ${s} ${i}`,
        hp(s * (0.16 + i * 0.012), -0.04 - i * 0.022, 0.065 - i * 0.025),
        hp(s * (0.37 + i * 0.035), -0.08 - i * 0.065, -0.14 - i * 0.075),
        (0.145 - i * 0.015) * H,
        head,
        i < 2 ? "cream" : "covert",
        i === 0,
      );
    }
  }

  feather(
    "Small forehead blaze",
    hp(0, 0.19, 0.14),
    hp(0, 0.057, 0.25),
    0.092 * H,
    head,
    "cream",
    false,
  );
  b.extrude(
    [
      [0, 0],
      [0.10, 0.022],
      [0.205, -0.014],
      [0.263, -0.072],
      [0.25, -0.143, "sharp"],
      [0.204, -0.108],
      [0.195, -0.066],
      [0.075, -0.052],
      [0, -0.044],
    ],
    {
      at: hp(0, -0.012, 0.19),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.047 * H, 0.143 * H],
      bevel: 0.005,
      color: goldPaint,
      bone: head,
      name: "Hooked upper beak",
    },
  );
  b.extrude(
    [
      [0, 0],
      [0.14, -0.004],
      [0.205, -0.013],
      [0.178, -0.040],
      [0.065, -0.060],
      [0, -0.04],
    ],
    {
      at: hp(0, -0.085, 0.19),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.095 * H,
      bevel: 0.004,
      color: "#d89b48",
      bone: jaw,
      name: "Separate lower beak",
    },
  );
  for (const s of [1, -1]) {
    orb(
      `Nostril ${s}`,
      hp(s * 0.066, -0.02, 0.262),
      [0.007, 0.008, 0.019],
      C.ink,
      head,
      6,
    );
  }
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      `Swept crown flame ${i + 3}`,
      hp(i * 0.065, 0.155 - a * 0.008, -0.065 - a * 0.025),
      hp(i * 0.15, 0.69 - a * 0.115, -0.39 - a * 0.08),
      (0.16 - a * 0.013) * H,
      head,
      "crown",
      true,
    );
  }
  for (const s of [1, -1]) {
    feather(
      `Rear crown flare ${s}`,
      hp(s * 0.11, 0.10, -0.15),
      hp(s * 0.24, 0.22, -0.54),
      0.17 * H,
      head,
      "crown",
      true,
    );
  }
  glow(diamond("Forehead ember", hp(0, 0.195, 0.176), 0.034, head), 0.8);

  const torso = b.sweep(
    spine,
    (t) => [
      0.205 + 0.135 * Math.sin(Math.PI * t),
      0.165 + 0.105 * Math.sin(Math.PI * t),
    ],
    {
      color: bodyPaint,
      sides: 10,
      caps: "round",
      name: "Crimson breast and body",
    },
  );
  b.sweep(neck, [0.153, 0.14, 0.127, 0.167], {
    color: bodyPaint,
    sides: 9,
    name: "Arched neck",
  });

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      feather(
        `Neck hackle ${s} ${i}`,
        [s * (0.105 + i * 0.018), 2.35 - i * 0.1, 0.04 - i * 0.015],
        [s * (0.245 + i * 0.045), 2.12 - i * 0.13, -0.13 - i * 0.025],
        0.16,
        neck.joints[Math.max(0, 2 - Math.floor(i / 2))],
        i % 2 === 0 ? "cream" : "flight",
        i < 2,
      );
    }
  }
  for (let row = 0; row < 3; row++) {
    const y = 2.34 - row * 0.115;
    const z = 0.19 - row * 0.019;
    for (let col = -1; col <= 1; col++) {
      feather(
        `Throat gorget ${row} ${col}`,
        [col * 0.078, y, z],
        [col * 0.107, y - 0.205, z + 0.065],
        col === 0 ? 0.13 : 0.11,
        neck.joints[row === 0 ? 2 : row === 1 ? 1 : 0],
        col === 0 ? "cream" : "covert",
        col === 0 && row === 1,
      );
    }
  }
  for (const s of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      for (let layer = 0; layer < 2; layer++) {
        feather(
          `Flank plumage ${s} ${row} ${layer}`,
          [s * (0.205 + layer * 0.025), 1.64 - row * 0.15, 0.02 - layer * 0.12],
          [s * (0.345 + layer * 0.045), 1.31 - row * 0.15, -0.025 - layer * 0.13],
          0.17,
          row === 2 ? hips : spine.joints[0],
          "covert",
          layer === 0 && row === 1,
        );
      }
    }
  }
  for (let row = 0; row < 4; row++) {
    for (let col = -1; col <= 1; col++) {
      const y = 1.98 - row * 0.17;
      feather(
        `Dorsal mantle ${row} ${col}`,
        [col * 0.112, y, -0.19 - row * 0.014],
        [col * 0.16, y - 0.30, -0.34 - row * 0.014],
        0.18,
        row < 2 ? spine.joints[1] : spine.joints[0],
        "flight",
        false,
      );
    }
  }
  const chestSurface = b.surface(torso);
  for (let row = 0; row < 4; row++) {
    const count = row === 0 || row === 3 ? 3 : 4;
    for (let col = 0; col < count; col++) {
      const x = (col - (count - 1) / 2) * 0.115;
      const y = 1.93 - row * 0.155;
      const hit = chestSurface.ray([x, y, 1], [0, 0, -1]);
      if (!hit) continue;
      const p = tup(hit.at);
      feather(
        `Breast scale ${row} ${col}`,
        add(p, [0, 0.018, 0.012]),
        add(p, [x * 0.12, -0.23, 0.056]),
        0.155,
        hit.bone ?? spine.joints[1],
        row === 0 ? "cream" : "flight",
        row === 0,
      );
    }
  }
  const breastHit = chestSurface.ray([0, 1.87, 1], [0, 0, -1])!;
  const breastCenter = tup(breastHit.at.clone().addScaledVector(breastHit.n, 0.07));
  b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.031, 8), goldPaint, {
    at: breastCenter,
    dir: [0, 0, 1],
    bone: spine.joints[1],
    name: "Sun-heart setting",
  });
  b.part(new THREE.CircleGeometry(0.096, 24), "#ffffff", {
    at: add(breastCenter, [0, 0, 0.017]),
    dir: [0, 0, 1],
    axis: "z",
    texture: medallionTexture,
    bone: spine.joints[1],
    name: "Solar heart enamel",
  });
  glow(
    diamond("Living sun-heart", add(breastCenter, [0, 0, 0.042]), 0.055, spine.joints[1]),
    0.85,
  );

  const primaryTips: [number, number][] = [
    [1.49, 1.23],
    [1.70, 1.25],
    [1.91, 1.34],
    [2.10, 1.48],
    [2.27, 1.66],
    [2.41, 1.88],
    [2.51, 2.12],
    [2.55, 2.38],
    [2.51, 2.64],
  ];

  for (const { s, side, wing, fans } of wingRigs) {
    b.sweep(wing, [0.14, 0.12, 0.083, 0.022], {
      color: bodyPaint,
      sides: 8,
      name: `Wing structure ${side}`,
    });
    b.membrane(
      [
        [s * 0.29, 1.98, -0.045],
        [s * 0.93, 2.23, -0.12],
        [s * 1.54, 2.45, -0.23],
        [s * 1.86, 2.51, -0.27],
      ],
      [
        [s * 0.33, 1.84, -0.085],
        [s * 0.9, 2.04, -0.17],
        [s * 1.53, 2.27, -0.27],
        [s * 1.88, 2.45, -0.3],
      ],
      {
        color: C.wine,
        thickness: 0.05,
        bone: wing,
        rows: 3,
        cols: 12,
        name: `Wing web ${side}`,
      },
    );

    for (let i = 0; i < 7; i++) {
      const f = i / 6;
      feather(
        `Secondary ${side}${i + 1}`,
        [s * (0.37 + f * 0.89), 2.015 + f * 0.31, -0.09 - f * 0.13],
        [s * (0.47 + f * 1.02), 1.18 + f * 0.1, -0.20 - f * 0.22],
        0.245,
        i < 3 ? wing.joints[0] : wing.joints[1],
        "flight",
        true,
      );
    }
    for (let i = 0; i < primaryTips.length; i++) {
      const f = i / 8;
      const tip = primaryTips[i];
      feather(
        `Primary ${side}${i + 1}`,
        [s * (1.12 + f * 0.75), 2.30 + f * 0.22, -0.235 - f * 0.035],
        [s * tip[0], tip[1], -0.35 - 0.14 * Math.sin(f * Math.PI)],
        i < 5 ? 0.272 : 0.245,
        fans[Math.min(3, Math.floor(i / 2.4))],
        "flight",
        true,
      );
    }

    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 10; i++) {
        const f = i / 9;
        const x = 0.34 + f * 1.54;
        const y = 2.015 + f * 0.51 - row * 0.16;
        const z = 0.015 - f * 0.245 + row * 0.045;
        feather(
          `Covert ${side} ${row} ${i}`,
          [s * x, y, z],
          [s * (x + 0.14 + f * 0.055), y - 0.40 + f * 0.11, z + 0.085],
          0.195 + f * 0.025,
          wing.joints[f < 0.37 ? 0 : f < 0.78 ? 1 : 2],
          "covert",
          row === 0 && i % 3 === 0,
        );
      }
    }

    // A red-orange scalloped mantle covers the otherwise exposed tube.
    for (let i = 0; i < 9; i++) {
      const f = i / 8;
      const x = 0.36 + f * 1.42;
      const y = 2.045 + f * 0.49;
      const z = 0.074 - f * 0.275;
      feather(
        `Leading mantle ${side}${i}`,
        [s * x, y, z],
        [s * (x + 0.31), y + 0.13 + f * 0.055, z - 0.02],
        0.172,
        wing.joints[f < 0.38 ? 0 : f < 0.8 ? 1 : 2],
        i % 3 === 0 ? "crown" : "covert",
        i % 3 === 0,
      );
      if (i % 2 === 0) {
        feather(
          `Rear wing covert ${side}${i}`,
          [s * x, y - 0.035, z - 0.17],
          [s * (x + 0.20), y - 0.32, z - 0.27],
          0.23,
          wing.joints[f < 0.38 ? 0 : f < 0.8 ? 1 : 2],
          "flight",
          false,
        );
      }
    }

    const trim = catmull([
      [s * 0.31, 2.06, 0.09],
      [s * 0.72, 2.24, 0.02],
      [s * 1.14, 2.40, -0.08],
      [s * 1.53, 2.54, -0.16],
      [s * 1.88, 2.56, -0.20],
    ]);
    b.sweep(trim, [0.021, 0.020, 0.017, 0.012, 0.002], {
      color: goldPaint,
      bone: wing,
      sides: 6,
      name: `Gilded leading edge ${side}`,
    });

    for (let i = 0; i < 3; i++) {
      feather(
        `Shoulder mantle ${side}${i}`,
        [s * (0.26 + i * 0.105), 2.035 + i * 0.045, 0.115 - i * 0.02],
        [s * (0.49 + i * 0.16), 1.76 + i * 0.065, 0.17 - i * 0.03],
        0.205,
        wing.joints[0],
        i === 0 ? "cream" : "flight",
        true,
      );
    }
    const jewelAt: P = [s * 0.98, 2.30, 0.034];
    b.part(new THREE.CylinderGeometry(0.089, 0.089, 0.035, 6), goldPaint, {
      at: jewelAt,
      dir: [0, 0, 1],
      bone: wing.joints[1],
      name: `Wing jewel mount ${side}`,
    });
    glow(
      diamond(`Wing divine gem ${side}`, add(jewelAt, [0, 0, 0.032]), 0.071, wing.joints[1]),
      0.6,
    );
    for (let i = 0; i < 4; i++) {
      const f = (i + 1) / 5;
      diamond(
        `Leading-edge lozenge ${side}${i}`,
        [s * (0.54 + f * 1.18), 2.15 + f * 0.37, 0.015 - f * 0.19],
        0.025,
        wing.joints[f < 0.4 ? 0 : 1],
        C.pale,
      );
    }
  }

  // Tail membranes are slightly self-lit: even their downward-facing
  // surfaces retain the saturated vermilion of magical fire.
  for (let index = 0; index < tailRigs.length; index++) {
    const { chain, width, name } = tailRigs[index];
    const edgeA: P[] = [];
    const edgeB: P[] = [];
    const innerA: P[] = [];
    const innerB: P[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const center = chain.at(t).at;
      const w = width * Math.pow(Math.sin(Math.PI * t), 0.75) * (1 - t * 0.27) + 0.006;
      edgeA.push([center.x - w / 2, center.y + 0.008, center.z]);
      edgeB.push([center.x + w / 2, center.y + 0.008, center.z]);
      const innerWidth = w * (0.53 + 0.12 * Math.sin(t * Math.PI * 3));
      innerA.push([center.x - innerWidth / 2, center.y + 0.026, center.z + 0.013]);
      innerB.push([center.x + innerWidth / 2, center.y + 0.026, center.z + 0.013]);
    }
    const ribbon = b.membrane(edgeA, edgeB, {
      color: index === 0 ? "#f85d3c" : index % 2 === 1 ? "#ff8140" : "#ed5140",
      thickness: 0.027,
      rows: 3,
      cols: 20,
      bone: chain,
      name: `${name} pennant`,
    });
    glow(ribbon, 0.32);
    glow(
      b.membrane(innerA, innerB, {
        color: "#ffc966",
        thickness: 0.008,
        rows: 2,
        cols: 20,
        bone: chain,
        name: `${name} golden inner flame`,
      }),
      0.38,
    );
    for (const [label, edge] of [["left", edgeA], ["right", edgeB]] as const) {
      b.sweep(edge, [0.009, 0.006], {
        color: goldPaint,
        bone: chain,
        sides: 5,
        name: `${name} ${label} edging`,
      });
    }
    b.sweep(chain, [0.013, 0.010, 0.007, 0.004, 0.001], {
      color: C.gold,
      sides: 5,
      name: `${name} central quill`,
    });
    for (let i = 0; i < 2; i++) {
      const t = 0.34 + i * 0.27;
      const at = chain.at(t);
      const hit = b.surface(ribbon).nearest(
        at.at.clone().add(new THREE.Vector3(0, 0.06, 0.06)),
      );
      glow(
        b.decal(ribbon, tailTexture, {
          at: hit,
          dir: hit.n,
          up: at.tangent,
          size: [width * 0.47, 0.26],
          segments: 6,
          lift: 0.028,
          bone: at.bone!,
          name: `${name} flame seal ${i}`,
        }),
        0.45,
      );
    }
    const end = chain.at(1);
    const endPoint = tup(end.at);
    feather(
      `${name} terminal flame`,
      add(endPoint, [0, -0.055, 0.015]),
      add(endPoint, [index === 0 ? 0 : Math.sign(endPoint[0]) * 0.06, 0.22, -0.065]),
      0.12,
      end.bone!,
      "crown",
      true,
    );
  }

  for (const { s, side, leg, toes } of legRigs) {
    b.sweep(leg, [0.13, 0.105, 0.052, 0.048], {
      color: shinPaint,
      sides: 7,
      name: `Leg ${side}`,
    });
    b.sweep(leg, [0.145, 0.13, 0.085, 0.05], {
      from: 0,
      to: 0.46,
      color: bodyPaint,
      sides: 7,
      name: `Feathered thigh ${side}`,
    });
    for (let i = 0; i < 4; i++) {
      const x = s * 0.22 + (i % 2 ? 0.06 : -0.045);
      feather(
        `Thigh tuft ${side}${i}`,
        [x, 1.08 - Math.floor(i / 2) * 0.12, 0.065],
        [x + s * 0.025, 0.79 - Math.floor(i / 2) * 0.11, 0.11],
        0.125,
        leg.joints[0],
        i < 2 ? "flight" : "cream",
        false,
      );
    }
    for (let i = 0; i < 5; i++) {
      const at = leg.at(0.54 + i * 0.065);
      b.part(
        new THREE.CylinderGeometry(0.058 - i * 0.002, 0.059 - i * 0.002, 0.024, 7),
        goldPaint,
        {
          at,
          dir: at.tangent,
          bone: at.bone!,
          name: `Shin scute ${side}${i}`,
        },
      );
    }
    orb(`Foot knuckle ${side}`, [s * 0.255, 0.29, 0.15], [0.084, 0.065, 0.105], shinPaint, leg.tip!);
    for (let i = 0; i < toes.length; i++) {
      const { chain, end, rear } = toes[i];
      b.sweep(chain, [0.043, 0.033, 0.019], {
        color: shinPaint,
        sides: 6,
        name: `Toe ${side}${i}`,
      });
      const tip: P = [end[0], 0.18, end[2] + (rear ? -0.057 : 0.062)];
      b.sweep(
        catmull([
          end,
          [end[0], end[1] + 0.005, end[2] + (rear ? -0.035 : 0.035)],
          tip,
        ]),
        [0.025, 0.019, 0],
        {
          bone: chain.joints[1],
          color: C.ink,
          sides: 6,
          caps: "flat",
          name: `Obsidian talon ${side}${i}`,
        },
      );
      const top = chain.at(0.55);
      b.stick(
        new THREE.BoxGeometry(0.041, 0.016, 0.045),
        goldPaint,
        frame(top, [0, 1, 0]),
        { bone: top.bone!, name: `Toe plate ${side}${i}` },
      );
    }
  }

  b.part(new THREE.CylinderGeometry(1.21, 1.25, 0.13, 12), stonePaint, {
    at: [0, 0.065, -0.3],
    bone: root,
    name: "Solar shrine foundation",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1.17, 1.20, 0.045, 12), stonePaint, {
    at: [0, 0.151, -0.3],
    bone: root,
    name: "Shrine upper paving",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1.22, 1.22, 0.018, 12), goldPaint, {
    at: [0, 0.055, -0.3],
    bone: root,
    name: "Foundation gold course",
  });
  glow(
    b.part(new THREE.CircleGeometry(1.127, 64), "#ffffff", {
      at: [0, 0.1755, -0.3],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      bone: root,
      texture: shrineTexture,
      name: "Ancient solar inscription",
    }),
    0.38,
  );
  b.part(new THREE.TorusGeometry(1.145, 0.012, 5, 48), goldPaint, {
    at: [0, 0.18, -0.3],
    rotation: [90, 0, 0],
    bone: root,
    name: "Inlaid shrine rim",
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.071, 0.053, 0.024), goldPaint, {
      at: [Math.sin(a) * 1.224, 0.107, -0.3 + Math.cos(a) * 1.224],
      rotation: [0, i * 30, 0],
      bone: root,
      name: `Foundation clasp ${i}`,
    });
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.86 + i * 0.11);
      const z = -0.46 - i * 0.19;
      const height = 0.13 + (2 - i) * 0.075;
      b.part(new THREE.CylinderGeometry(0.115, 0.15, height, 5), stonePaint, {
        at: [x, 0.175 + height / 2, z],
        rotation: [0, 19 + i * 23, s * 7],
        bone: root,
        name: `Broken shrine tooth ${s} ${i}`,
        flat: true,
      });
      b.part(new THREE.BoxGeometry(0.075, 0.018, 0.08), goldPaint, {
        at: [x, 0.17 + height, z + 0.015],
        rotation: [0, i * 23, s * 7],
        bone: root,
        name: `Ruin cap inlay ${s} ${i}`,
      });
    }
  }
  for (let i = 0; i < 7; i++) {
    const a = 0.45 + i * 0.88;
    const r = 0.91 + random() * 0.16;
    const x = Math.sin(a) * r;
    const z = -0.3 + Math.cos(a) * r;
    if (z > 0.25 && Math.abs(x) < 0.65) continue;
    b.part(new THREE.DodecahedronGeometry(0.09 + random() * 0.035, 0), stonePaint, {
      at: [x, 0.205, z],
      scale: [1.3, 0.48, 0.8],
      rotation: [0, random() * 180, 0],
      bone: root,
      name: `Scattered shrine stone ${i}`,
      flat: true,
    });
  }

  function fireShard(name: string, at: P, length: number, tilt: number, bone: J) {
    const flame = b.extrude(
      [
        [-length * 0.12, 0],
        [length * 0.04, -length * 0.045],
        [length * 0.15, length * 0.17],
        [length * 0.10, length * 0.45],
        [length * 0.25, length * 0.72, "sharp"],
        [length * 0.06, length * 0.61],
        [length * 0.035, length, "sharp"],
        [-length * 0.09, length * 0.68],
        [-length * 0.07, length * 0.48],
        [-length * 0.18, length * 0.34],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [tilt, 1, 0],
        thickness: 0.022,
        color: "#ff9b3c",
        bone,
        name,
      },
    );
    glow(flame, 0.85);
    glow(
      b.extrude(
        [
          [-length * 0.065, 0.02],
          [length * 0.07, length * 0.12],
          [length * 0.012, length * 0.59, "sharp"],
          [-length * 0.02, length * 0.30],
        ],
        {
          at: add(at, [0, 0, 0.014]),
          x: [1, 0, 0],
          y: [tilt, 1, 0],
          thickness: 0.008,
          color: "#fff1a9",
          bone,
          name: `${name} pale core`,
        },
      ),
      1.1,
    );
  }

  for (const s of [1, -1]) {
    fireShard(`Shrine fire ${s}`, [s * 0.92, 0.23, -0.3], 0.31, s * 0.14, root);
    const rig = wingRigs[s > 0 ? 0 : 1];
    // The roots are within the feather volumes, not dangling beyond them.
    for (const i of [3, 6, 8]) {
      const f = i / 8;
      const tip = primaryTips[i];
      const from: P = [s * (1.12 + f * 0.75), 2.30 + f * 0.22, -0.235 - f * 0.035];
      const end: P = [
        s * tip[0], tip[1], -0.35 - 0.14 * Math.sin(f * Math.PI),
      ];
      const at: P = [
        from[0] * 0.16 + end[0] * 0.84,
        from[1] * 0.16 + end[1] * 0.84,
        from[2] * 0.16 + end[2] * 0.84 + 0.018,
      ];
      fireShard(
        `Living flight flame ${s} ${i}`,
        at,
        0.17 + i * 0.008,
        s * (0.40 + i * 0.025),
        rig.fans[Math.min(3, Math.floor(i / 2.4))],
      );
    }
    for (let i = 0; i < 3; i++) {
      glow(
        diamond(
          `Drifting ember ${s} ${i}`,
          [
            s * (1.95 + random() * 0.56),
            2.78 + random() * 0.25,
            -0.3 - random() * 0.13,
          ],
          0.014 + random() * 0.008,
          root,
          i === 0 ? "#fff2b4" : "#ffb958",
        ),
        1.1,
      );
    }
  }

  return b.root;
}

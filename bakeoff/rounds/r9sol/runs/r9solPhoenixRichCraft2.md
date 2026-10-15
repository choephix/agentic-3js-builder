```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aureflare, Phoenix of the Dawn",
  description:
    "A regal, elemental phoenix with outstretched flame-feather wings, gilded plumage, flowing fire pennants, and a ruined solar shrine. Anime-fantasy proportions, lacquer-crimson shadows, luminous amber filigree, and turquoise divine ornaments.",
};

type P = [number, number, number];

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
    slateLight: "#49616a",
  };

  const hp = (x: number, y: number, z: number): P => [
    x * H,
    2.51 + y * H,
    0.2 + z * H,
  ];
  const add = (a: P, c: P): P => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
  const tup = (v: THREE.Vector3): P => [v.x, v.y, v.z];

  // All of the articulation is established before the plumage.
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
    at: hp(0, -0.09, 0.125),
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
      return { chain, start, mid, end, rear };
    });
    return { s, side, leg, toes };
  });

  const tailDefinitions: { name: string; points: P[]; width: number }[] = [
    {
      name: "tailCenter",
      width: 0.31,
      points: [
        [0, 1.31, -0.3],
        [0.035, 1.04, -0.58],
        [-0.04, 0.62, -0.91],
        [0.03, 0.29, -1.21],
        [0, 0.31, -1.5],
      ],
    },
    ...[1, -1].flatMap((s) => [
      {
        name: s > 0 ? "tailOuterL" : "tailOuterR",
        width: 0.285,
        points: [
          [s * 0.12, 1.35, -0.24],
          [s * 0.43, 1.02, -0.48],
          [s * 0.7, 0.65, -0.61],
          [s * 1.04, 0.54, -0.68],
          [s * 1.2, 0.83, -0.77],
        ] as P[],
      },
      {
        name: s > 0 ? "tailInnerL" : "tailInnerR",
        width: 0.24,
        points: [
          [s * 0.075, 1.27, -0.31],
          [s * 0.22, 0.91, -0.6],
          [s * 0.43, 0.52, -0.94],
          [s * 0.62, 0.285, -1.12],
          [s * 0.81, 0.43, -1.28],
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

  // Paints: rich shadow colour remains in the feather roots, rather than
  // letting the whole bird become an undifferentiated orange light.
  const bodyPaint = paint((p, n) => {
    const shade = Math.max(0, Math.min(1, 0.42 + n.y * 0.25 + n.z * 0.25));
    return mix(C.wine, "#e44b36", shade + 0.12 * noise(p, 0.11, 6));
  });
  const goldPaint = paint((p, n) =>
    mix(
      "#b57838",
      "#ffe6a0",
      Math.max(0, Math.min(1, 0.52 + n.y * 0.28 + n.z * 0.12 + noise(p, 0.055, 4) * 0.15)),
    ),
  );
  const stonePaint = paint((p, n) => {
    const t = noise(p, 0.17, 18);
    return mix("#182e3b", n.y > 0.5 ? "#55716f" : "#36505d", t);
  });
  const palePaint = mottle("#ffe2a0", "#fff5cf", { size: 0.09, seed: 8 });
  const shinPaint = paint((p, n) =>
    mix("#915d3c", "#e1b56d", 0.35 + n.z * 0.2 + noise(p, 0.035, 12) * 0.35),
  );

  // Six reusable drawings. Their fine lines are decoration on broad solids,
  // not a replacement for the silhouette of the primitive-built plumage.
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
          stroke="#9d362f" stroke-width="12"/>
        <path d="M64 480 C45 390 79 300 62 207 C52 140 70 68 64 28"
          stroke="#ffdc78" stroke-width="5"/>
        <path d="M61 398 Q30 351 31 301 M62 346 Q96 302 98 261
                 M64 286 Q31 242 35 203 M61 232 Q93 197 90 162
                 M62 176 Q44 142 47 115 M63 128 Q79 100 77 77"
          stroke="#ffd175" stroke-width="3.5"/>
        <path d="M62 453 Q25 422 35 388 Q43 369 47 350
                 M65 367 Q105 333 94 303
                 M61 263 Q25 226 41 188"
          stroke="#ffad4a" stroke-width="4"/>
        <path d="M64 76 Q50 109 57 138 Q36 113 47 86 Q60 58 64 28
                 Q68 66 79 87 Q89 111 71 137 Q77 107 64 76Z"
          fill="#fff1ad" stroke="none"/>
        <path d="M64 461 L52 437 L64 407 L77 437Z" fill="#ffd779" stroke="#a34935" stroke-width="3"/>
        <path d="M64 449 L59 437 L64 423 L70 437Z" fill="#fff5c1" stroke="none"/>
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
      <path d="M48 254 L40 243 L48 232 L56 243Z" fill="#ffc75c"/>
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
      </g>
      ${runeMarks}
    </svg>`,
    { size: 768 },
  );

  const tailTexture = svg(
    `<svg viewBox="0 0 128 256">
      <path d="M64 246 Q12 192 37 139 Q75 85 64 10 Q120 96 83 144 Q47 195 64 246Z"
        fill="none" stroke="#ffe09a" stroke-width="5"/>
      <path d="M64 215 Q39 180 60 151 Q83 122 65 83 Q103 135 77 166 Q59 187 64 215Z"
        fill="#ffd16e"/>
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
      at,
      scale,
      bone,
      name,
      flat: true,
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
    const thickness = kind === "covert" ? 0.025 : 0.038;

    const featherPaint = paint((p, n, uv) => {
      const t = Math.max(0, Math.min(1, uv[1] / length));
      const side = Math.abs(uv[0]) / width;
      const lit = Math.max(0, Math.min(1, n.y * 0.2 + n.z * 0.25 + 0.55));
      if (kind === "cream") {
        return mix("#e5aa54", "#fff1bc", 0.42 + t * 0.38 + lit * 0.15);
      }
      if (kind === "crown") {
        return mix("#e94c2e", "#fff0a1", Math.pow(t, 0.7));
      }
      const rootColor = kind === "covert" ? "#a62538" : "#91243b";
      const midColor = kind === "covert" ? "#ec6438" : "#ff8737";
      let c = mix(rootColor, midColor, Math.min(1, t * 1.6));
      if (t > 0.58) c = mix(c, "#ffe6a0", (t - 0.58) / 0.42);
      if (side > 0.34 && t > 0.12) c = mix(c, "#ffc56c", 0.48);
      const shade = 0.83 + lit * 0.17 + (noise(p, 0.09, 3) - 0.5) * 0.045;
      return [c[0] * shade, c[1] * shade, c[2] * shade];
    });

    const part = b.extrude(
      [
        [-width * 0.22, 0],
        [width * 0.23, length * 0.025],
        [width * 0.49, length * 0.24],
        [width * 0.51, length * 0.45],
        [width * 0.29, length * 0.72],
        [width * 0.10, length * 0.87],
        [0, length, "sharp"],
        [-width * 0.12, length * 0.82],
        [-width * 0.40, length * 0.64],
        [-width * 0.52, length * 0.37],
        [-width * 0.40, length * 0.13],
      ],
      {
        at: from,
        x: X,
        y: D,
        thickness: [thickness, 0.005],
        bevel: 0.003,
        smoothing: 0,
        color: featherPaint,
        bone,
        name,
      },
    );

    if (decorated) {
      const tex = kind === "crown" ? crownTexture : featherTexture;
      glow(
        b.decal(part, tex, {
          at: A.clone().addScaledVector(D, length * 0.5),
          dir: N,
          up: D,
          size: [width * 1.12, length],
          segments: 9,
          lift: 0.0017,
          bone,
          name: `${name}Filigree`,
        }),
        0.6,
      );
    }
    return part;
  }

  function diamond(name: string, at: P, size: number, bone: J, color = C.teal) {
    const stone = b.part(new THREE.OctahedronGeometry(size, 0), color, {
      at,
      scale: [0.66, 1.2, 0.38],
      bone,
      name,
      flat: true,
    });
    return stone;
  }

  // The face is kept completely clear of the wings and its crown.
  const skull = orb("Faceted head", hp(0, 0.01, 0), [0.234 * H, 0.218 * H, 0.248 * H], bodyPaint, head, 12);
  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const hit = headSurface.around(hp(0, 0.01, 0)).at(s * 43, 15);
    b.decal(skull, eyeTexture, {
      at: hit,
      dir: hit.n,
      size: [0.166 * H, 0.113 * H],
      mirror: s > 0,
      lift: 0.002,
      segments: 12,
      bone: head,
      name: s > 0 ? "EyeL" : "EyeR",
    });

    const brow = headSurface.drape(
      [
        hp(s * 0.065, 0.145, 0.25),
        hp(s * 0.155, 0.168, 0.21),
        hp(s * 0.235, 0.12, 0.13),
      ],
      { lift: 0.009 },
    );
    b.sweep(brow, [0.022, 0.016, 0.005], {
      color: goldPaint,
      bone: head,
      sides: 6,
      name: `Solar brow ${s}`,
    });

    for (let i = 0; i < 3; i++) {
      feather(
        `Cheek flame ${s} ${i}`,
        hp(s * (0.16 + i * 0.013), -0.035 - i * 0.024, 0.055 - i * 0.025),
        hp(s * (0.38 + i * 0.025), -0.12 - i * 0.065, -0.10 - i * 0.06),
        (0.12 - i * 0.012) * H,
        head,
        i === 0 ? "cream" : "covert",
        i === 0,
      );
    }
  }

  feather(
    "Ivory forehead spear",
    hp(0, 0.19, 0.165),
    hp(0, -0.075, 0.267),
    0.125 * H,
    head,
    "cream",
    false,
  );

  b.extrude(
    [
      [0, 0],
      [0.13, 0.025],
      [0.255, -0.01],
      [0.325, -0.068],
      [0.33, -0.14, "sharp"],
      [0.266, -0.114],
      [0.251, -0.074],
      [0.10, -0.057],
      [0, -0.05],
    ],
    {
      at: hp(0, -0.015, 0.19),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.065 * H, 0.16 * H],
      bevel: 0.007,
      color: goldPaint,
      bone: head,
      name: "Hooked upper beak",
    },
  );
  b.extrude(
    [
      [0, 0],
      [0.18, -0.012],
      [0.257, -0.027],
      [0.218, -0.057],
      [0.08, -0.075],
      [0, -0.056],
    ],
    {
      at: hp(0, -0.105, 0.18),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.1 * H,
      bevel: 0.005,
      color: "#d09243",
      bone: jaw,
      name: "Separate lower beak",
    },
  );
  for (const s of [1, -1]) {
    orb(
      `Nostril ${s}`,
      hp(s * 0.074, -0.023, 0.275),
      [0.008, 0.011, 0.026],
      C.ink,
      head,
      6,
    );
  }

  for (let i = -2; i <= 2; i++) {
    const abs = Math.abs(i);
    feather(
      `Crown flame ${i + 3}`,
      hp(i * 0.067, 0.155 - abs * 0.008, -0.06 - abs * 0.02),
      hp(i * 0.142, 0.70 - abs * 0.12, -0.115 - abs * 0.025),
      (0.135 - abs * 0.015) * H,
      head,
      "crown",
      true,
    );
  }
  const foreheadGem = diamond("Forehead ember", hp(0, 0.22, 0.194), 0.044, head);
  glow(foreheadGem, 0.8);

  // Solid tapered body and a long, proud, subtly S-shaped neck.
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
  b.sweep(neck, [0.151, 0.13, 0.116, 0.164], {
    color: bodyPaint,
    sides: 9,
    name: "Arched neck",
  });

  // Long hackles create the mane silhouette without concealing the eyes.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      feather(
        `Neck hackle ${s} ${i}`,
        [s * (0.105 + i * 0.018), 2.35 - i * 0.1, 0.04 - i * 0.015],
        [s * (0.235 + i * 0.045), 2.12 - i * 0.13, -0.12 - i * 0.025],
        0.15,
        neck.joints[Math.max(0, 2 - Math.floor(i / 2))],
        i % 2 === 0 ? "cream" : "flight",
        i < 2,
      );
    }
  }

  const chestSurface = b.surface(torso);
  for (let row = 0; row < 4; row++) {
    const count = row === 0 ? 3 : row === 3 ? 3 : 4;
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
  glow(diamond("Living sun-heart", add(breastCenter, [0, 0, 0.042]), 0.055, spine.joints[1]), 0.85);

  // The outstretched wings: a dark structural web, long flight feathers,
  // layered orange coverts, and a gilded leading edge.
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
    b.sweep(wing, [0.15, 0.13, 0.095, 0.025], {
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
        [s * 0.33, 1.57, -0.07],
        [s * 0.9, 1.47, -0.19],
        [s * 1.53, 1.78, -0.29],
        [s * 2.03, 2.36, -0.3],
      ],
      {
        color: C.wine,
        thickness: 0.04,
        bone: wing,
        rows: 3,
        cols: 12,
        name: `Wing web ${side}`,
      },
    );

    // Innermost feather roots disappear under the next shingled row.
    for (let i = 0; i < 7; i++) {
      const f = i / 6;
      feather(
        `Secondary ${side}${i + 1}`,
        [s * (0.37 + f * 0.89), 2.015 + f * 0.31, -0.09 - f * 0.13],
        [s * (0.47 + f * 1.02), 1.18 + f * 0.1, -0.12 - f * 0.20],
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
        [s * tip[0], tip[1], -0.3 - 0.085 * Math.sin(f * Math.PI)],
        i < 5 ? 0.272 : 0.245,
        fans[Math.min(3, Math.floor(i / 2.4))],
        "flight",
        true,
      );
    }

    // Two rows of broad, deliberately simple coverts.
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 10; i++) {
        const f = i / 9;
        const x = 0.34 + f * 1.54;
        const y = 2.015 + f * 0.51 - row * 0.16;
        const z = 0.015 - f * 0.245 + row * 0.045;
        feather(
          `Covert ${side} ${row} ${i}`,
          [s * x, y, z],
          [s * (x + 0.14 + f * 0.055), y - 0.34 + f * 0.11, z + 0.045],
          0.175 + f * 0.025,
          wing.joints[f < 0.37 ? 0 : f < 0.78 ? 1 : 2],
          row === 0 && i % 3 === 0 ? "cream" : "covert",
          false,
        );
      }
    }

    const trim = catmull([
      [s * 0.31, 2.06, 0.06],
      [s * 0.72, 2.24, -0.01],
      [s * 1.14, 2.40, -0.11],
      [s * 1.53, 2.54, -0.19],
      [s * 1.88, 2.56, -0.23],
    ]);
    b.sweep(trim, [0.032, 0.027, 0.023, 0.015, 0.003], {
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

    const jewelAt: P = [s * 0.98, 2.30, 0.004];
    b.part(new THREE.CylinderGeometry(0.089, 0.089, 0.035, 6), goldPaint, {
      at: jewelAt,
      dir: [0, 0, 1],
      bone: wing.joints[1],
      name: `Wing jewel mount ${side}`,
    });
    glow(diamond(`Wing divine gem ${side}`, add(jewelAt, [0, 0, 0.032]), 0.071, wing.joints[1]), 0.6);

    for (let i = 0; i < 4; i++) {
      const f = (i + 1) / 5;
      diamond(
        `Leading-edge gold lozenge ${side}${i}`,
        [s * (0.54 + f * 1.18), 2.15 + f * 0.37, -0.015 - f * 0.19],
        0.025,
        wing.joints[f < 0.4 ? 0 : 1],
        C.pale,
      );
    }
  }

  // Five articulated flame pennants. Two are lifted out to either side;
  // the remaining three cascade behind the legs and across the shrine.
  for (let index = 0; index < tailRigs.length; index++) {
    const { chain, width, name } = tailRigs[index];
    const edgeA: P[] = [];
    const edgeB: P[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const center = chain.at(t).at;
      const w = width * Math.pow(Math.sin(Math.PI * t), 0.75) * (1 - t * 0.27) + 0.006;
      edgeA.push([center.x - w / 2, center.y + 0.008, center.z]);
      edgeB.push([center.x + w / 2, center.y + 0.008, center.z]);
    }

    const ribbonPaint = paint((_p, n, uv) => {
      const t = uv[0];
      const across = Math.abs(uv[1] - 0.5) * 2;
      let c = mix("#a72a40", "#ff9742", Math.min(1, t * 1.35));
      if (across > 0.77) c = mix(c, "#ffe49a", 0.85);
      if (t > 0.8) c = mix(c, "#fff1a9", (t - 0.8) * 4);
      const k = 0.88 + Math.max(0, n.y) * 0.12;
      return [c[0] * k, c[1] * k, c[2] * k];
    });
    b.membrane(edgeA, edgeB, {
      color: ribbonPaint,
      thickness: 0.025,
      rows: 3,
      cols: 20,
      bone: chain,
      name: `${name} pennant`,
    });
    b.sweep(edgeA, [0.011, 0.007], {
      color: goldPaint,
      bone: chain,
      sides: 5,
      name: `${name} left edging`,
    });
    b.sweep(edgeB, [0.011, 0.007], {
      color: goldPaint,
      bone: chain,
      sides: 5,
      name: `${name} right edging`,
    });
    b.sweep(chain, [0.017, 0.012, 0.009, 0.005, 0.002], {
      color: C.gold,
      sides: 5,
      name: `${name} central quill`,
    });

    for (let i = 0; i < 2; i++) {
      const t = 0.34 + i * 0.27;
      const at = chain.at(t);
      const pos = at.at.clone().add(new THREE.Vector3(0, 0.012, 0.021));
      b.part(new THREE.PlaneGeometry(width * 0.53, 0.24), "#ffffff", {
        at: pos,
        dir: [0, 0.4, 1],
        up: at.tangent,
        axis: "z",
        bone: at.bone!,
        texture: tailTexture,
        name: `${name} flame seal ${i}`,
      });
    }
    const end = chain.at(1);
    const endPoint = tup(end.at);
    feather(
      `${name} flame tip`,
      add(endPoint, [0, -0.02, 0.015]),
      add(endPoint, [index === 0 ? 0 : Math.sign(endPoint[0]) * 0.055, 0.20, -0.055]),
      0.1,
      end.bone!,
      "crown",
      true,
    );
  }

  // Trousers of plumage taper into scaly eagle shins and separated digits.
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
      const t = 0.54 + i * 0.065;
      const at = leg.at(t);
      b.part(new THREE.CylinderGeometry(0.058 - i * 0.002, 0.059 - i * 0.002, 0.024, 7), goldPaint, {
        at,
        dir: at.tangent,
        bone: at.bone!,
        name: `Shin scute ${side}${i}`,
      });
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
      b.stick(new THREE.BoxGeometry(0.041, 0.016, 0.045), goldPaint, frame(top, [0, 1, 0]), {
        bone: top.bone!,
        name: `Toe plate ${side}${i}`,
      });
    }
  }

  // A compact stage: dark celestial stone makes the brilliant bird readable.
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
    const x = Math.sin(a) * 1.224;
    const z = -0.3 + Math.cos(a) * 1.224;
    b.part(new THREE.BoxGeometry(0.071, 0.053, 0.024), goldPaint, {
      at: [x, 0.107, z],
      rotation: [0, (i * 360) / 12, 0],
      bone: root,
      name: `Foundation clasp ${i}`,
    });
  }

  // Ruin fragments sit beside and behind the tail, never in front of the face.
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

  // Elemental fire is in small, saturated accents, with clear air between it
  // and the readable edges of the wings.
  function fireShard(name: string, at: P, length: number, tilt: number, bone: J) {
    const flame = b.extrude(
      [
        [-length * 0.12, 0],
        [length * 0.04, -length * 0.045],
        [length * 0.15, length * 0.17],
        [length * 0.10, length * 0.45],
        [length * 0.20, length * 0.72],
        [length * 0.035, length, "sharp"],
        [-length * 0.015, length * 0.59],
        [-length * 0.14, length * 0.39],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [tilt, 1, 0],
        thickness: 0.018,
        color: "#ff9b3c",
        bone,
        name,
      },
    );
    glow(flame, 0.95);
    const core = b.extrude(
      [
        [-length * 0.065, 0.02],
        [length * 0.07, length * 0.12],
        [length * 0.012, length * 0.59, "sharp"],
        [-length * 0.02, length * 0.30],
      ],
      {
        at: add(at, [0, 0, 0.012]),
        x: [1, 0, 0],
        y: [tilt, 1, 0],
        thickness: 0.008,
        color: "#fff1a9",
        bone,
        name: `${name} pale core`,
      },
    );
    glow(core, 1.1);
  }

  for (const s of [1, -1]) {
    fireShard(`Shrine fire ${s}`, [s * 0.92, 0.23, -0.3], 0.31, s * 0.14, root);
    fireShard(`Wing-tip fire ${s}`, [s * 2.49, 2.49, -0.3], 0.23, s * 0.32, wingRigs[s > 0 ? 0 : 1].wing.tip!);

    for (let i = 0; i < 6; i++) {
      const x = s * (1.49 + random() * 1.14);
      const y = 1.32 + random() * 1.57;
      const z = -0.35 - random() * 0.22;
      const ember = diamond(
        `Drifting ember ${s}${i}`,
        [x, y, z],
        0.018 + random() * 0.016,
        root,
        i % 3 === 0 ? "#fff2b4" : "#ffb958",
      );
      glow(ember, 1.2);
    }
  }

  return b.root;
}
```
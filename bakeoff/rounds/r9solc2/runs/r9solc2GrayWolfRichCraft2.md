```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  offset,
  rng,
  paint,
  noise,
  mix,
  resolve,
  smoothstep,
  grain,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostfang — Northern Sentinel",
  description:
    "An alert gray wolf with sculpted silver fur, powerful natural legs, watchful amber eyes and a weathered frost-rune collar. A hand-painted Warcraft-inspired northern sentinel on snowy slate.",
};

export default function build(): THREE.Object3D {
  /*
   * 1. Bring the forepaws under the shoulders: the previous forward lean read
   *    as bracing rather than an alert, balanced standing pose.
   * 2. Replace thin fur plates with solid, ridged, overlapping locks.
   *    The richest silhouette belongs to the neck, cheeks and breast.
   * 3. Sharpen the muzzle and reduce the bulbous nose and detached eyebrows.
   *    Smaller, keener eyes make this a wolf rather than a worried dog.
   * 4. Break up the dark saddle with softer silver-gray painting and broad
   *    drawn fur strokes, retaining bold low-poly masses.
   * 5. Fit the snow into the rocks instead of balancing discs on their peaks;
   *    simplify the setting so the animal remains the hero.
   */
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(83427);

  const C = {
    ink: "#172630",
    charcoal: "#304351",
    slate: "#607889",
    ivory: "#e8e5d7",
    nose: "#23333e",
    claw: "#718794",
    iron: "#566d79",
    metal: "#b5cbd0",
    gold: "#b99b66",
  };

  const coat = paint((p, n) => {
    const cloud = noise(p, 0.21, 14);
    const backHeight = 1.035 + 0.065 * smoothstep(-0.45, 0.4, p.z);
    const saddle =
      smoothstep(0.12, 0.31, p.y - backHeight) *
      smoothstep(0.31, 0.08, Math.abs(p.x)) *
      smoothstep(0.67, 0.12, p.z);
    const underside = smoothstep(-0.03, -0.7, n.y);
    let col = mix("#8095a3", "#bdc9cd", 0.28 + cloud * 0.48);
    col = mix(col, "#425d72", saddle * 0.78);
    col = mix(col, "#d6dbd5", underside * 0.72);
    return mix(col, "#d0d9d9", Math.max(0, n.y) * 0.10);
  });

  const silver = paint((p, n) =>
    mix(
      "#8ca2ae",
      "#dce3e1",
      0.40 + noise(p, 0.19, 22) * 0.24 + Math.max(0, n.y) * 0.22,
    ),
  );

  const cream = paint((p, n) =>
    mix(
      "#a8bdc5",
      "#ecebdf",
      0.50 + n.y * 0.20 + noise(p, 0.20, 9) * 0.15,
    ),
  );

  const mane = paint((p, n) =>
    mix(
      "#3c566c",
      "#9fb3be",
      0.31 + Math.max(0, n.y) * 0.23 + noise(p, 0.22, 4) * 0.20,
    ),
  );

  const lockPaint = paint((p, n, s) => {
    const t = Math.max(0, Math.min(1, s[1]));
    let col = resolve(silver, p, n);
    col = mix(col, "#526f83", (1 - t) * 0.34);
    col = mix(col, "#e0e6e2", smoothstep(0.55, 1, t) * 0.24);
    const stroke = Math.abs(Math.sin((s[0] + t * 0.10) * Math.PI * 5));
    return mix(
      col,
      "#718b9c",
      stroke > 0.975 && t > 0.18 && t < 0.86 ? 0.19 : 0,
    );
  });

  const darkLockPaint = paint((p, n, s) => {
    const col = resolve(mane, p, n);
    return mix(col, "#b1c1c8", smoothstep(0.25, 1, s[1]) * 0.36);
  });

  const paleLockPaint = paint((p, n, s) =>
    mix(
      resolve(cream, p, n),
      "#f0eee1",
      smoothstep(0.2, 1, s[1]) * 0.25,
    ),
  );

  const rock = paint((p, n) =>
    mix(
      "#2b4052",
      "#667e8e",
      noise(p, 0.20, 43) * 0.62 + Math.max(0, n.y) * 0.17,
    ),
  );

  const snow = paint((p, n) =>
    mix(
      "#b4cdd9",
      "#f1f4ec",
      0.58 + n.y * 0.21 + noise(p, 0.18, 20) * 0.14,
    ),
  );

  const leather = grain("#2d3c45", "#50616a", {
    size: 0.018,
    axis: "x",
    seed: 81,
  });

  // ------------------------------------------------------------------
  // Hand-drawn character textures.
  // ------------------------------------------------------------------
  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <defs>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#a35719"/>
          <stop offset=".48" stop-color="#e9a329"/>
          <stop offset="1" stop-color="#ffe399"/>
        </linearGradient>
        <clipPath id="eye">
          <path d="M13 52 L47 30 Q102 19 145 40
                   L122 68 Q76 84 35 66 Z"/>
        </clipPath>
      </defs>
      <path d="M4 52 L42 22 Q103 10 154 37
               L132 75 Q76 96 25 73 Z" fill="#1b303d"/>
      <g clip-path="url(#eye)">
        <rect width="160" height="100" fill="#dad8bd"/>
        <ellipse cx="88" cy="48" rx="32" ry="35" fill="url(#iris)"/>
        <ellipse cx="89" cy="47" rx="9" ry="29" fill="#172a33"/>
        <path d="M64 68 Q87 79 112 64" stroke="#ffe08a"
              stroke-width="5" fill="none"/>
        <path d="M66 29 L78 27 L81 39 L69 43 Z" fill="#fff9e6"/>
        <circle cx="106" cy="63" r="3.5" fill="#ffedb4"/>
      </g>
      <path d="M9 51 L44 26 Q100 15 148 38"
            stroke="#1c303d" stroke-width="7" fill="none"/>
      <path d="M30 71 Q80 89 134 68"
            stroke="#829aa4" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const earTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170">
      <path d="M17 153 L25 54 L62 9 L85 142 L67 160 Z"
            fill="#cfdadb"/>
      <path d="M29 141 L35 59 L61 27 L74 137 L58 151 Z"
            fill="#4c6474"/>
      <path d="M35 138 L44 107 L49 141 L56 112 L64 143
               L72 126 L75 151 L54 160 Z" fill="#b0c2c8"/>
      <path d="M44 98 L49 62 M59 104 L61 53 M65 120 L68 91"
            stroke="#819ba9" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect width="160" height="100" fill="#263844"/>
      <path d="M12 39 Q33 19 61 32 L54 53 Q34 43 17 56 Z"
            fill="#12232e"/>
      <path d="M148 39 Q127 19 99 32 L106 53 Q126 43 143 56 Z"
            fill="#12232e"/>
      <path d="M40 17 Q80 8 120 17" fill="none"
            stroke="#8aa0ac" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 57 L80 91" stroke="#182a34" stroke-width="4"/>
      <g fill="#607d8d">
        <circle cx="59" cy="23" r="2"/><circle cx="76" cy="19" r="2"/>
        <circle cx="94" cy="22" r="2"/><circle cx="68" cy="39" r="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const furDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 230">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M44 39 Q124 54 151 104 L119 91
                 M88 25 Q169 59 194 121 L163 106
                 M139 31 Q209 73 222 128"
              stroke="#6d8799" stroke-width="5"/>
        <path d="M52 57 Q109 69 130 101
                 M104 47 Q154 72 170 108
                 M168 59 Q196 83 204 109"
              stroke="#cad6d8" stroke-width="4"/>
        <path d="M223 67 Q277 91 298 134 L271 124
                 M267 67 Q321 97 340 140
                 M213 125 Q246 148 248 180 L228 165
                 M269 147 Q299 164 311 188"
              stroke="#7892a3" stroke-width="4"/>
        <path d="M226 83 Q263 103 277 125
                 M278 87 Q307 104 321 130
                 M220 137 L234 157"
              stroke="#c7d3d6" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const runeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150">
      <path d="M60 5 L108 32 L103 102 L60 143 L17 102 L12 32 Z"
            fill="#243b4a" stroke="#bed2d5" stroke-width="7"/>
      <path d="M60 19 L94 39 L90 95 L60 125 L30 95 L26 39 Z"
            fill="#38566a" stroke="#799aa6" stroke-width="3"/>
      <path d="M60 36 L60 108 M60 69 L38 48 L38 72 L60 90
               M60 60 L82 39 L82 63 L60 82"
            stroke="#b9f5e8" stroke-width="7" fill="none"/>
      <path d="M37 112 L43 117 M78 116 L84 110"
            stroke="#d0b579" stroke-width="4"/>
      <circle cx="60" cy="25" r="3" fill="#d0b579"/>
    </svg>`,
    { size: 256 },
  );

  const stitchTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180">
      <path d="M8 5 L112 5 L106 148 L60 176 L14 148 Z"
            fill="#3c4e58" stroke="#8da4ac" stroke-width="5"/>
      <path d="M21 18 L98 18 L93 140 L60 158 L27 141 Z"
            fill="none" stroke="#b9baa7" stroke-width="3"
            stroke-dasharray="5 7"/>
      <path d="M60 35 L78 62 L60 88 L42 62 Z" fill="#263d49"
            stroke="#8ba4ae" stroke-width="4"/>
      <path d="M60 49 L60 75 M50 61 L69 61"
            stroke="#c8b27c" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const plaqueTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 150">
      <path d="M10 14 L470 14 L470 136 L10 136 Z"
            fill="#2c4354" stroke="#a5b8bf" stroke-width="6"/>
      <path d="M29 33 L451 33 M29 117 L451 117"
            stroke="#7793a1" stroke-width="3"/>
      <text x="240" y="85" text-anchor="middle" font-size="52"
            font-family="Georgia,serif" font-weight="bold"
            letter-spacing="6" fill="#e1e7df">FROSTFANG</text>
      <path d="M33 74 L43 63 L53 74 L43 85 Z
               M427 74 L437 63 L447 74 L437 85 Z" fill="#c5a770"/>
    </svg>`,
    { size: 512 },
  );

  // ------------------------------------------------------------------
  // Skeleton first.
  // ------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.98, -0.48],
    dir: [0, 0.08, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.48],
      [0, 1.04, -0.08],
      [0, 1.10, 0.36],
    ]),
    {
      parent: hips,
      names: ["spine1", "chest", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.10, 0.36],
      [0, 1.37, 0.49],
      [0, 1.51, 0.66],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neckTop"],
      role: "neck",
    },
  );

  const HEAD = [0, 1.52, 0.72];
  const H = 1.0;

  const head = b.joint("head", {
    parent: neck.tip!,
    at: HEAD,
    dir: [0, 0, 1],
    role: "head",
  });

  const hr = b.region({ at: HEAD, scale: H, bone: head });
  const hp = (p: number[]) => hr.p(p);

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, -0.135, 0.055]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp([s * 0.19, 0.175, -0.065]),
      dir: [s * 0.18, 1, -0.12],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.00, -0.65],
      [0.035, 0.88, -0.94],
      [0.12, 0.65, -1.19],
      [0.24, 0.47, -1.43],
      [0.32, 0.46, -1.57],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legs: any[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    for (const front of [true, false]) {
      const tag = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [s * 0.235, 1.075, 0.34],
            [s * 0.280, 0.665, 0.275],
            [s * 0.295, 0.245, 0.365],
            [s * 0.300, 0.165, 0.425],
          ]
        : [
            [s * 0.235, 0.975, -0.49],
            [s * 0.315, 0.665, -0.295],
            [s * 0.330, 0.355, -0.665],
            [s * 0.330, 0.165, -0.575],
          ];

      const chain = b.chain(`leg${tag}`, points, {
        parent: front ? spine.joints[1] : hips,
        names: front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${tag}`]
          : [`hip${side}`, `knee${side}`, `hock${side}`, `paw${tag}`],
        role: "leg",
        contact: [points[3][0], 0.083, points[3][2] + 0.07],
      });

      const paw = points[3];
      const digits = [-1.5, -0.5, 0.5, 1.5].map((i, index) => {
        const x = paw[0] + i * 0.057;
        const z = paw[2] + 0.135 - Math.abs(i) * 0.018;

        const joint = b.joint(`toe${tag}${index + 1}`, {
          parent: chain.tip!,
          at: [x, 0.13, z - 0.03],
          dir: [i * 0.09, -0.025, 1],
          role: "digit",
        });

        return { joint, x, z, i };
      });

      legs.push({ s, front, tag, points, chain, paw, digits });
    }
  }

  // ------------------------------------------------------------------
  // Reusable primitive and sculpted-lock helpers.
  // ------------------------------------------------------------------
  function ellipsoid(
    at: any,
    size: number[],
    color: any,
    bone: any,
    name: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      bone,
      scale: size,
      flat: true,
      name,
    });
  }

  function box(
    at: any,
    size: number[],
    color: any,
    bone: any,
    name: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
    });
  }

  // A lock is a closed, ridged volume, not a flat polygon.
  // Local Y follows the flow; local Z is the raised sculpted face.
  function lockGeometry(w: number, l: number, d: number) {
    const outline = [
      [-0.36 * w, 0],
      [-0.50 * w, 0.23 * l],
      [-0.32 * w, 0.57 * l],
      [-0.055 * w, l],
      [0.29 * w, 0.65 * l],
      [0.47 * w, 0.23 * l],
      [0.35 * w, 0],
    ];

    const vertices: number[] = [];
    const uvs: number[] = [];
    const rootZ = -d * 0.30;
    const front = [0, l * 0.31, d];
    const back = [0, l * 0.30, rootZ];

    const emit = (p: number[]) => {
      vertices.push(p[0], p[1], p[2]);
      uvs.push(p[0] / w + 0.5, p[1] / l);
    };

    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const c = outline[(i + 1) % outline.length];
      const az = i === 3 ? 0 : rootZ;
      const cz = (i + 1) % outline.length === 3 ? 0 : rootZ;

      emit(front);
      emit([c[0], c[1], cz]);
      emit([a[0], a[1], az]);

      emit(back);
      emit([a[0], a[1], az]);
      emit([c[0], c[1], cz]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  function furLock(
    hit: any,
    width: number,
    length: number,
    flow: number[],
    color: any = lockPaint,
    name = "sculptedFurLock",
    depth = width * 0.26,
  ) {
    const normal = hit.axis.clone().normalize();
    const tangent = new THREE.Vector3(flow[0], flow[1], flow[2]).normalize();
    const surfaceTangent = tangent
      .clone()
      .addScaledVector(normal, -tangent.dot(normal));

    if (surfaceTangent.lengthSq() < 0.01) surfaceTangent.set(0, -1, 0);
    surfaceTangent.normalize();

    // Slightly outward flow gives the silhouette a natural pointed finish.
    const direction = surfaceTangent.addScaledVector(normal, 0.12).normalize();

    return b.part(lockGeometry(width, length, depth), color, {
      at: hit.moved([0, -depth * 0.38, 0]),
      dir: direction,
      up: normal,
      bone: hit.bone,
      flat: true,
      name,
    });
  }

  function surfaceLock(
    target: any,
    center: any,
    az: number,
    el: number,
    width: number,
    length: number,
    flow: number[],
    color: any,
    name: string,
  ) {
    const hit = b.surface(target).around(center).at(az, el);
    if (hit) return furLock(hit, width, length, flow, color, name);
    return null;
  }

  // ------------------------------------------------------------------
  // Major masses.
  // ------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.965, -0.665], w: 0.38, h: 0.44 },
      { at: [0, 1.000, -0.460], w: 0.55, h: 0.57 },
      { at: [0, 1.025, -0.140], w: 0.49, h: 0.53 },
      { at: [0, 1.055, 0.150], w: 0.60, h: 0.67 },
      { at: [0, 1.090, 0.360], w: 0.62, h: 0.73 },
      { at: [0, 1.105, 0.490], w: 0.43, h: 0.55 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 8,
      smooth: false,
      name: "angularWolfBarrel",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.295 - t * 0.075, 0.32 - t * 0.11],
    {
      color: silver,
      sides: 8,
      smooth: false,
      name: "raisedPowerfulNeck",
    },
  );

  const nape = ellipsoid(
    [0, 1.335, 0.395],
    [0.252, 0.255, 0.245],
    mane,
    neck.joints[0],
    "solidNapeRuff",
  );

  const breast = ellipsoid(
    [0, 1.045, 0.49],
    [0.249, 0.33, 0.205],
    cream,
    spine.joints[1],
    "deepSilverBreast",
  );

  const tailTube = b.sweep(
    tail,
    [0.15, 0.174, 0.158, 0.098, 0.009],
    {
      color: coat,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "point" },
      sectors: [
        [-50, 50, mane],
        [125, 235, silver],
      ],
      name: "fullBrushTail",
    },
  );

  for (const s of [1, -1]) {
    b.decal(body, furDrawing, {
      at: [s * 0.28, 1.09, -0.07],
      dir: [s, 0, 0],
      size: [0.91, 0.44],
      mirror: s < 0,
      lift: 0.002,
      segments: 12,
      name: "handPaintedFlankLocks",
    });
  }

  // ------------------------------------------------------------------
  // Face.
  // ------------------------------------------------------------------
  const skull = ellipsoid(
    hp([0, 0, 0]),
    [H * 0.285, H * 0.238, H * 0.271],
    silver,
    head,
    "broadWolfSkull",
  );

  ellipsoid(
    hp([0, 0.083, -0.078]),
    [H * 0.246, H * 0.185, H * 0.225],
    coat,
    head,
    "slateCrown",
  );

  const muzzle = b.loft(
    [
      { at: hp([0, -0.070, 0.130]), w: H * 0.325, h: H * 0.195 },
      { at: hp([0, -0.080, 0.290]), w: H * 0.258, h: H * 0.142 },
      { at: hp([0, -0.087, 0.456]), w: H * 0.183, h: H * 0.100 },
    ],
    {
      color: silver,
      bone: head,
      sides: 6,
      smooth: false,
      caps: "flat",
      name: "longTaperedUpperMuzzle",
    },
  );

  b.frustumBox(
    hp([0, 0.003, 0.125]),
    hp([0, -0.037, 0.425]),
    [H * 0.175, H * 0.061],
    [H * 0.126, H * 0.036],
    { bone: head, color: coat, name: "angularNasalBridge" },
  );

  box(
    hp([0, -0.142, 0.290]),
    [H * 0.205, H * 0.016, H * 0.280],
    C.ink,
    head,
    "narrowMouthLine",
  );

  const lowerJaw = b.loft(
    [
      { at: hp([0, -0.155, 0.090]), w: H * 0.237, h: H * 0.098 },
      { at: hp([0, -0.165, 0.280]), w: H * 0.207, h: H * 0.071 },
      { at: hp([0, -0.156, 0.444]), w: H * 0.162, h: H * 0.049 },
    ],
    {
      bone: jaw,
      color: cream,
      sides: 6,
      smooth: false,
      caps: "flat",
      name: "separateLowerJaw",
    },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      hp([s * 0.092, -0.100, 0.29]),
      [H * 0.056, H * 0.046, H * 0.137],
      cream,
      head,
      s > 0 ? "creamJowlL" : "creamJowlR",
    );

    b.spike(
      hp([s * 0.105, -0.137, 0.225]),
      [0, -1, 0.05],
      H * 0.022,
      H * 0.006,
      { bone: head, color: C.ivory, sides: 5, name: "smallCanineTip" },
    );

    const eyeHit = b.surface(skull).around(HEAD).at(s * 39, 15);

    if (eyeHit) {
      const socket = b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        C.charcoal,
        eyeHit,
        {
          scale: [H * 0.087, H * 0.022, H * 0.053],
          embed: 0.52,
          name: s > 0 ? "eyeSocketL" : "eyeSocketR",
        },
      );

      glow(
        b.decal(socket, eyeTexture, {
          at: offset(eyeHit, eyeHit.axis, 0.016),
          dir: eyeHit.axis,
          size: [H * 0.157, H * 0.094],
          mirror: s > 0,
          lift: 0.0015,
          segments: 6,
          bone: head,
          name: s > 0 ? "watchfulAmberEyeL" : "watchfulAmberEyeR",
        }),
        0.20,
      );

      // Brow rooted into the forehead, with a low inner corner.
      b.sweep(
        bezier(
          hp([s * 0.104, 0.109, 0.204]),
          hp([s * 0.190, 0.147, 0.200]),
          hp([s * 0.261, 0.122, 0.129]),
        ),
        [0.018, 0.027, 0.008],
        {
          bone: head,
          color: coat,
          sides: 5,
          smooth: false,
          name: "integratedWolfBrow",
        },
      );

      b.sweep(
        bezier(
          hp([s * 0.115, 0.137, 0.181]),
          hp([s * 0.184, 0.162, 0.173]),
          hp([s * 0.244, 0.144, 0.123]),
        ),
        [0.011, 0.014, 0.004],
        {
          bone: head,
          color: silver,
          sides: 5,
          smooth: false,
          name: "silverForeheadRidge",
        },
      );
    }

    for (let i = 0; i < 3; i++) {
      const hit = b.surface(muzzle).nearest(
        hp([
          s * (0.125 - i * 0.012),
          -0.093 - (i % 2) * 0.022,
          0.25 + i * 0.052,
        ]),
      );

      b.stick(new THREE.SphereGeometry(0.0045, 5, 4), C.slate, hit, {
        embed: 0.55,
        name: "whiskerPore",
      });
    }
  }

  const nose = b.extrude(
    [
      [-0.097 * H, 0.017 * H],
      [-0.069 * H, 0.048 * H],
      [0.069 * H, 0.048 * H],
      [0.097 * H, 0.017 * H],
      [0.065 * H, -0.037 * H],
      [0, -0.052 * H],
      [-0.065 * H, -0.037 * H],
    ],
    {
      at: hp([0, -0.073, 0.465]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: H * 0.087,
      bevel: 0.008,
      color: C.nose,
      bone: head,
      name: "angularBlackNose",
    },
  );

  b.decal(nose, noseTexture, {
    at: hp([0, -0.073, 0.511]),
    dir: [0, 0, 1],
    size: [H * 0.19, H * 0.10],
    bone: head,
    segments: 6,
    name: "nostrilsAndNoseHighlight",
  });

  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];

    const shell = b.extrude(
      [
        [-0.092 * H, 0],
        [0.080 * H, 0.018 * H],
        [0.061 * H, 0.239 * H],
        [0.012 * H, 0.222 * H],
        [-0.078 * H, 0.084 * H],
      ],
      {
        at: ear,
        x: [s, 0, 0],
        y: [s * 0.18, 1, -0.12],
        thickness: [H * 0.095, H * 0.027],
        bevel: 0.007,
        color: mane,
        bone: ear,
        name: s > 0 ? "pointedEarL" : "pointedEarR",
      },
    );

    b.decal(shell, earTexture, {
      at: hp([s * 0.213, 0.293, -0.035]),
      dir: [0, 0.08, 1],
      size: [H * 0.14, H * 0.208],
      mirror: s < 0,
      segments: 5,
      bone: ear,
      name: "silverRimmedInnerEar",
    });

    surfaceLock(
      skull, HEAD, s * 73, 46,
      H * 0.13, H * 0.14,
      [s * 0.6, -0.45, -0.5],
      lockPaint, "earRootFur",
    );
  }

  // ------------------------------------------------------------------
  // Legs and planted paws.
  // ------------------------------------------------------------------
  for (const leg of legs) {
    const { front, chain, s, points, paw, digits, tag } = leg;

    const tube = b.sweep(
      chain,
      front
        ? [0.151, 0.118, 0.077, 0.058, 0.068]
        : [0.191, 0.166, 0.101, 0.061, 0.066],
      {
        color: coat,
        sides: 7,
        smooth: false,
        name: `${front ? "foreleg" : "hindleg"}${tag}`,
      },
    );

    if (front) {
      ellipsoid(
        [s * 0.255, 1.075, 0.31],
        [0.151, 0.251, 0.183],
        coat,
        chain.joints[0],
        `heavyShoulder${tag}`,
      );
    } else {
      ellipsoid(
        [s * 0.275, 0.865, -0.44],
        [0.18, 0.244, 0.213],
        coat,
        chain.joints[0],
        `powerfulHaunch${tag}`,
      );
    }

    b.sweep(
      [points[front ? 1 : 2], points[3]],
      front ? [0.065, 0.053] : [0.051, 0.046],
      {
        color: silver,
        bone: chain.joints[front ? 1 : 2],
        sides: 6,
        smooth: false,
        name: "silverLowerShank",
      },
    );

    b.loft(
      [
        { at: [paw[0], 0.150, paw[2] - 0.048], w: 0.166, h: 0.123 },
        { at: [paw[0], 0.153, paw[2] + 0.032], w: 0.231, h: 0.134 },
        { at: [paw[0], 0.132, paw[2] + 0.126], w: 0.205, h: 0.089 },
      ],
      {
        color: silver,
        bone: chain.tip,
        sides: 8,
        smooth: false,
        caps: "flat",
        name: `taperedPaw${tag}`,
      },
    );

    ellipsoid(
      [paw[0], 0.184, paw[2] + 0.006],
      [0.108, 0.072, 0.117],
      coat,
      chain.tip,
      `pawKnuckle${tag}`,
    );

    for (const digit of digits) {
      ellipsoid(
        [digit.x, 0.129, digit.z],
        [0.036, 0.046, 0.064],
        silver,
        digit.joint,
        "separatedToe",
      );

      b.sweep(
        bezier(
          [digit.x, 0.136, digit.z + 0.042],
          [digit.x + digit.i * 0.003, 0.133, digit.z + 0.067],
          [digit.x + digit.i * 0.004, 0.110, digit.z + 0.083],
        ),
        [0.010, 0.007, 0],
        {
          bone: digit.joint,
          color: C.claw,
          sides: 5,
          caps: "point",
          name: "shortSlateClaw",
        },
      );
    }

    ellipsoid(
      points[front ? 1 : 2],
      front ? [0.086, 0.095, 0.092] : [0.074, 0.079, 0.081],
      silver,
      chain.joints[front ? 1 : 2],
      front ? "elbowPoint" : "hockPoint",
    );

    for (let row = 0; row < 3; row++) {
      const p = chain.at(front ? 0.13 + row * 0.13 : 0.13 + row * 0.12);
      const hit = b.surface(tube).nearest(
        p.at.clone().add(new THREE.Vector3(s * 0.22, 0, -0.065)),
      );

      furLock(
        hit,
        0.10 - row * 0.012,
        0.148 - row * 0.019,
        [s * 0.1, -0.88, -0.45],
        row === 0 ? darkLockPaint : lockPaint,
        "solidLegFeathering",
      );
    }
  }

  // ------------------------------------------------------------------
  // Sculpted fur hierarchy: big masses first, fewer small silhouette tips.
  // ------------------------------------------------------------------
  for (const s of [1, -1]) {
    const cheeks = [
      [64, 13, 0.160, 0.211],
      [84, -5, 0.180, 0.240],
      [108, 5, 0.169, 0.227],
      [67, -24, 0.146, 0.190],
      [96, -28, 0.153, 0.208],
    ];

    for (let i = 0; i < cheeks.length; i++) {
      const [az, el, w, l] = cheeks[i];
      surfaceLock(
        skull, HEAD, s * az, el, w * H, l * H,
        [s * 0.54, -0.39, -0.66],
        i === 2 ? darkLockPaint : i > 2 ? paleLockPaint : lockPaint,
        "sculptedCheekRuff",
      );
    }

    const shoulderPoints = [
      [s * 0.25, 1.29, 0.23],
      [s * 0.32, 1.16, 0.19],
      [s * 0.33, 1.02, 0.24],
    ];

    for (let i = 0; i < shoulderPoints.length; i++) {
      furLock(
        b.surface(body).nearest(shoulderPoints[i]),
        0.19 - i * 0.014,
        0.25 - i * 0.025,
        [s * 0.18, -0.67, -0.73],
        i === 0 ? darkLockPaint : lockPaint,
        "heavyShoulderCape",
        0.056 - i * 0.006,
      );
    }

    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 4; j++) {
        surfaceLock(
          neckTube,
          [0, 1.31 + row * 0.095, 0.49 + row * 0.06],
          s * (39 + j * 32),
          row === 0 ? -8 : 16,
          0.181 - row * 0.015,
          0.253 - row * 0.025,
          [s * (0.26 + j * 0.04), -0.81, -0.43],
          j > 2 ? darkLockPaint : lockPaint,
          "layeredSolidNeckRuff",
        );
      }
    }

    // Haunch locks follow the muscle rather than sticking out as fins.
    for (let j = 0; j < 3; j++) {
      furLock(
        b.surface(body).nearest([s * 0.36, 1.10 - j * 0.085, -0.40]),
        0.145 - j * 0.012,
        0.185 - j * 0.014,
        [s * 0.04, -0.78, -0.62],
        j === 0 ? darkLockPaint : lockPaint,
        "haunchFur",
      );
    }

    for (let i = 0; i < 3; i++) {
      surfaceLock(
        nape,
        [0, 1.335, 0.395],
        s * (123 + i * 17),
        11 + i * 9,
        0.182,
        0.255,
        [s * 0.2, -0.48, -0.85],
        i === 1 ? lockPaint : darkLockPaint,
        "fullRaisedNapeLock",
      );
    }
  }

  // Low overlapping spinal locks blend into the painted saddle.
  for (let i = 0; i < 4; i++) {
    furLock(
      b.surface(body).nearest([0, 1.6, 0.34 - i * 0.22]),
      0.225 - i * 0.012,
      0.205,
      [0, -0.24, -1],
      darkLockPaint,
      "sweptBackDorsalLock",
      0.033,
    );
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      surfaceLock(
        breast,
        [0, 1.045, 0.49],
        s * (14 + i * 24),
        -5 - i * 16,
        0.144 - i * 0.008,
        0.235 - i * 0.019,
        [s * 0.13, -0.98, 0.04],
        paleLockPaint,
        "sculptedSilverBreastLock",
      );
    }

    surfaceLock(
      lowerJaw,
      hp([0, -0.16, 0.24]),
      s * 95,
      -35,
      0.10,
      0.113,
      [s * 0.16, -0.5, -0.84],
      paleLockPaint,
      "jawHingeFur",
    );
  }

  // Tail locks point along the brush, avoiding a serrated saw-tooth edge.
  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.145;
    for (const s of [1, -1]) {
      furLock(
        tailTube.at(t, s * 83),
        0.132 - i * 0.014,
        0.235 - i * 0.018,
        [0.15, -0.48, -0.88],
        i > 2 ? lockPaint : darkLockPaint,
        "overlappingTailBrushLock",
        0.030 - i * 0.003,
      );
    }
  }

  furLock(
    tailTube.at(0.89, 0),
    0.10,
    0.12,
    [0.40, -0.24, -0.88],
    lockPaint,
    "silverTailTip",
  );

  // ------------------------------------------------------------------
  // Northern collar: restrained iron, stitched leather and one clear rune.
  // ------------------------------------------------------------------
  const collarPlane = frame([0, 1.305, 0.478], [0, 0.87, 0.49]);
  const collarLoop = b.surface(neckTube).loop(collarPlane, { lift: 0.006 });

  b.sweep(collarLoop, 0.027, {
    bone: neck.joints[0],
    color: leather,
    sides: 6,
    smooth: false,
    name: "weatheredLeatherCollar",
  });

  b.sweep(collarLoop, 0.006, {
    bone: neck.joints[0],
    color: "#8aa0a9",
    shift: [0, 0.024],
    sides: 5,
    name: "collarEdgePiping",
  });

  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), C.metal, {
      at,
      bone: neck.joints[0],
      name: "ironCollarRivet",
    });
  });

  for (const s of [1, -1]) {
    const hit = b.surface(neckTube).around([0, 1.305, 0.478]).at(s * 90, 0);
    if (hit) {
      b.stick(new THREE.BoxGeometry(0.063, 0.013, 0.071), C.iron, hit, {
        embed: 0.18,
        bone: neck.joints[0],
        name: "collarIronSidePlate",
      });
      b.stick(new THREE.SphereGeometry(0.012, 6, 4), C.gold, hit, {
        embed: 0.02,
        bone: neck.joints[0],
        name: "collarBronzePin",
      });
    }
  }

  b.extrude(
    [
      [-0.068, 0.10],
      [0.068, 0.10],
      [0.060, -0.083],
      [0, -0.122],
      [-0.060, -0.083],
    ],
    {
      at: [0, 1.19, 0.808],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: leather,
      bone: neck.joints[0],
      name: "collarPendantTab",
    },
  );

  b.part(new THREE.PlaneGeometry(0.125, 0.192), "#ffffff", {
    at: [0, 1.19, 0.821],
    dir: [0, 0, 1],
    axis: "z",
    texture: stitchTexture,
    bone: neck.joints[0],
    name: "stitchedLeatherTab",
  });

  b.part(new THREE.TorusGeometry(0.025, 0.007, 5, 10), C.gold, {
    at: [0, 1.282, 0.836],
    bone: neck.joints[0],
    name: "bronzePendantLink",
  });

  b.extrude(
    [
      [0, 0.073],
      [0.058, 0.038],
      [0.051, -0.041],
      [0, -0.094],
      [-0.051, -0.041],
      [-0.058, 0.038],
    ],
    {
      at: [0, 1.193, 0.841],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.023,
      bevel: 0.004,
      color: C.iron,
      bone: neck.joints[0],
      name: "ironRuneBezel",
    },
  );

  glow(
    b.part(new THREE.PlaneGeometry(0.108, 0.148), "#ffffff", {
      at: [0, 1.188, 0.855],
      dir: [0, 0, 1],
      axis: "z",
      texture: runeTexture,
      bone: neck.joints[0],
      name: "frostRuneInlay",
    }),
    0.55,
  );

  // A subtle upward gaze completes the alert silhouette.
  b.pose(head, { axis: [1, 0, 0], deg: -3 });

  // ------------------------------------------------------------------
  // Compact snow-covered slate setting.
  // ------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.075, 12), rock, {
    at: [0, 0.0375, -0.15],
    scale: [0.80, 1, 1.57],
    bone: hips,
    flat: true,
    name: "slateOutcropBase",
  });

  b.part(new THREE.CylinderGeometry(1, 1.012, 0.022, 12), snow, {
    at: [0, 0.076, -0.15],
    scale: [0.783, 1, 1.545],
    bone: hips,
    flat: true,
    name: "windScouredSnowSurface",
  });

  const rocks = [
    [-0.59, -0.77, 0.17, 0.115, 0.22],
    [0.59, -0.94, 0.15, 0.145, 0.19],
    [-0.60, 0.10, 0.12, 0.080, 0.18],
    [0.60, -0.04, 0.11, 0.075, 0.16],
    [-0.36, -1.34, 0.14, 0.065, 0.17],
    [0.44, 0.88, 0.10, 0.055, 0.13],
  ];

  for (let i = 0; i < rocks.length; i++) {
    const [x, z, rx, ry, rz] = rocks[i];

    b.part(new THREE.DodecahedronGeometry(1, 0), rock, {
      at: [x, 0.08 + ry * 0.80, z],
      scale: [rx, ry, rz],
      rotation: [0, i * 41, 0],
      bone: hips,
      flat: true,
      name: "brokenSlateAtBaseEdge",
    });

    // A faceted, thick snow mass overlaps the stone's upper shoulders.
    b.part(new THREE.DodecahedronGeometry(1, 0), snow, {
      at: [x - 0.006, 0.08 + ry * 1.43, z - 0.006],
      scale: [rx * 0.87, ry * 0.43, rz * 0.87],
      rotation: [0, i * 41, 0],
      bone: hips,
      flat: true,
      name: "fittedUnevenRockSnow",
    });
  }

  for (const [x, z, radius] of [
    [-0.52, -0.21, 0.12],
    [0.49, 0.48, 0.10],
    [-0.43, 0.56, 0.08],
    [0.16, -1.29, 0.11],
  ]) {
    ellipsoid(
      [x, 0.091, z],
      [radius, 0.020, radius * 1.2],
      snow,
      hips,
      "driftedSnow",
    );
  }

  for (const [x, z] of [
    [-0.60, -0.98],
    [0.60, -0.45],
    [-0.57, 0.70],
  ]) {
    for (let j = 0; j < 4; j++) {
      const dx = (random() - 0.5) * 0.05;
      const dz = (random() - 0.5) * 0.05;
      const height = 0.065 + random() * 0.08;

      b.sweep(
        bezier(
          [x + dx, 0.085, z + dz],
          [x + dx, 0.085 + height * 0.7, z + dz],
          [x + dx + 0.03, 0.085 + height, z + dz - 0.025],
        ),
        [0.004, 0.001],
        {
          color: "#7e8e8d",
          bone: hips,
          sides: 4,
          name: "sparseWinterGrass",
        },
      );
    }
  }

  for (const [x, z, h] of [
    [0.54, -1.17, 0.12],
    [0.61, -1.10, 0.08],
    [-0.57, -1.17, 0.075],
  ]) {
    b.part(new THREE.ConeGeometry(0.023, h, 5), "#a5c9d7", {
      at: [x, 0.093 + h / 2, z],
      rotation: [10, 12, x > 0 ? -13 : 13],
      bone: hips,
      flat: true,
      name: "smallEdgeIceShard",
    });
  }

  const plaqueNormal = new THREE.Vector3(0, 0.72, 0.69).normalize();

  b.part(new THREE.BoxGeometry(0.45, 0.133, 0.025), C.iron, {
    at: [0, 0.092, 1.20],
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    name: "frontNameplateBacking",
  });

  b.part(new THREE.PlaneGeometry(0.43, 0.129), "#ffffff", {
    at: new THREE.Vector3(0, 0.092, 1.20).addScaledVector(
      plaqueNormal,
      0.014,
    ),
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    texture: plaqueTexture,
    name: "FrostfangNameplate",
  });

  return b.root;
}
```
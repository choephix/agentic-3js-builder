import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  arc,
  rng,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "UNDERTOW — Abyssal Titan",
  description:
    "A heroic, game-stylized kraken erupting from a dark tidal pool. Eight individually rigged tentacles display porcelain suction cups, while angular teal carapace, rescue-orange armor, luminous eyes and a split hooked beak define its formidable silhouette.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Undertow",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(4317);
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;

  const C = {
    ink: "#102636",
    deep: "#123c4b",
    skin: "#247b85",
    turquoise: "#47b3b0",
    pale: "#c3e6dc",
    ivory: "#ecf2d7",
    orange: "#f29a3c",
    orangeDark: "#ba532b",
    gold: "#ffd27a",
    steel: "#6c939f",
    plum: "#352f52",
    violet: "#866b9b",
    aqua: "#65fff0",
    white: "#eafff5",
    sea: "#143951",
    foam: "#9ed8d5",
  };

  // Shared paints preserve large, readable color blocks. Wear is concentrated
  // in the recesses, rather than spread as noisy scratches over every surface.
  const hide = paint((p, n) => {
    const fleck = noise(p, 0.31, 7);
    const shade = Math.max(0, Math.min(1, 0.47 + n.y * 0.32 + n.z * 0.12));
    const base = mix("#164657", "#3c989c", shade);
    return mix(base, "#63b8ad", Math.max(0, fleck - 0.56) * 0.36);
  });

  const mantlePaint = paint((p, n) => {
    const side = Math.abs(p.x);
    const centerStripe = side < 0.18 + Math.max(0, p.y - 4.9) * 0.065;
    if (centerStripe && p.z > 0.08 && n.z > 0.18) {
      return n.y > 0.1 ? "#f2b653" : "#cf7133";
    }
    return mix(
      "#153a51",
      "#36848c",
      Math.max(0, Math.min(1, 0.46 + n.y * 0.30 + n.z * 0.22)),
    );
  });

  const armorPaint = paint((p, n) => {
    const edge = noise(p, 0.18, 18);
    return mix(
      n.y > 0.28 ? "#3b737f" : "#1a4358",
      "#5c969b",
      Math.max(0, edge - 0.5) * 0.35,
    );
  });

  const orangePaint = paint((p, n) =>
    mix(
      "#bf592d",
      "#f8ac48",
      Math.max(0, Math.min(1, 0.58 + 0.29 * n.y + noise(p, 0.2, 8) * 0.12)),
    ),
  );

  const ivoryPaint = paint((_p, n) =>
    mix("#78a6a7", "#e0f0dc", Math.max(0, Math.min(1, 0.66 + 0.30 * n.y))),
  );

  const waterPaint = paint((p, n) => {
    const ripples = Math.sin(Math.hypot(p.x, p.z) * 7.2 + noise(p, 0.8, 4));
    return mix(
      "#102e47",
      "#255b70",
      Math.max(0, Math.min(1, 0.32 + 0.13 * ripples + 0.24 * n.y)),
    );
  });

  // Six reusable drawings: eyes, suction-cup interiors, insignia, serial plate,
  // fin inlay, and the recessed luminous gill graphics.
  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 112">
      <path d="M8 35 L43 13 L161 18 L232 43 L207 89 L70 101 L24 75Z"
        fill="#081d2e" stroke="#79b8bb" stroke-width="5"/>
      <path d="M24 41 L57 28 L157 31 L215 47 L192 76 L74 86 L39 68Z"
        fill="#32c5c3"/>
      <path d="M40 45 L78 34 L159 37 L201 49 L184 66 L81 75 L51 63Z"
        fill="#b3ffe7"/>
      <path d="M113 31 L130 34 L145 75 L127 80 L111 63Z" fill="#092c42"/>
      <path d="M55 41 L90 36 L98 43 L62 49Z" fill="#f5fff2"/>
      <path d="M161 67 L184 61 L176 70 L164 73Z" fill="#ffffff"/>
      <path d="M8 35 L43 13 L161 18 L232 43" fill="none"
        stroke="#071722" stroke-width="10" stroke-linejoin="round"/>
    </svg>`,
    { size: 512 },
  );

  const cupTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="63" fill="#243846"/>
      <circle cx="64" cy="64" r="54" fill="#71678a"/>
      <circle cx="64" cy="64" r="47" fill="#413b5b"/>
      <circle cx="64" cy="64" r="41" fill="none" stroke="#a4b6ba"
        stroke-width="8" stroke-dasharray="3.5 9"/>
      <circle cx="64" cy="64" r="29" fill="#152f3e"/>
      <circle cx="64" cy="64" r="22" fill="#102432"/>
      <path d="M43 42 Q62 30 81 43" fill="none" stroke="#4c7c87"
        stroke-width="5" stroke-linecap="round"/>
      <path d="M35 83 Q63 104 92 78" fill="none" stroke="#a4c3c0"
        stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const emblemTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <path d="M80 6 L143 40 L143 112 L80 151 L17 112 L17 40Z"
        fill="#163b50" stroke="#f8c673" stroke-width="7"/>
      <path d="M80 28 L94 54 L87 54 L87 91 L109 77 L109 49 L122 60
        L122 88 L88 110 L88 129 L72 129 L72 110 L38 88 L38 60
        L51 49 L51 77 L73 91 L73 54 L66 54Z"
        fill="#f8d58a"/>
      <path d="M38 119 L58 131 M102 131 L122 119"
        stroke="#55d8ce" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const serialTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 112">
      <rect width="320" height="112" rx="9" fill="#122f42"/>
      <path d="M12 12H308V100H12Z" fill="none" stroke="#64959d" stroke-width="3"/>
      <path d="M23 22 L41 22 L27 47 L18 47Z M49 22 L67 22 L53 47 L35 47Z"
        fill="#f6b64f"/>
      <text x="80" y="49" font-family="sans-serif" font-weight="900"
        font-size="34" fill="#e2efe2">ABYSS / 09</text>
      <text x="22" y="84" font-family="sans-serif" font-weight="bold"
        font-size="16" letter-spacing="4" fill="#7ab6ba">DEEP RESPONSE</text>
      <path d="M248 72h7v13h-7z M260 72h3v13h-3z M269 72h6v13h-6z
        M280 72h3v13h-3z M289 72h10v13h-10z" fill="#cce1d8"/>
    </svg>`,
    { size: 512 },
  );

  const finTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
      <path d="M17 232 L33 110 L93 19 L110 13 L83 106 L44 238Z"
        fill="#efab52"/>
      <path d="M36 214 L50 117 L84 63" fill="none"
        stroke="#ffe2a0" stroke-width="6"/>
      <path d="M62 144 L94 118 M56 170 L83 148 M49 196 L73 177"
        fill="none" stroke="#173e51" stroke-width="7"/>
    </svg>`,
    { size: 256 },
  );

  const gillTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 96">
      <path d="M7 76 L30 16 L179 8 L155 76Z" fill="#0b2639"/>
      <path d="M30 65 L44 28 L57 26 L43 64Z
        M62 63 L75 25 L88 23 L75 62Z
        M94 61 L107 22 L120 20 L107 60Z
        M126 59 L139 18 L152 16 L139 58Z"
        fill="#50d8cd"/>
      <path d="M34 65 L44 37 M66 63 L76 34 M98 61 L108 31 M130 59 L140 28"
        stroke="#bdfff0" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // -----------------------------------------------------------------------
  // Skeleton. All eight arms and the split beak are independent rig chains.
  // -----------------------------------------------------------------------
  const root = b.joint("root", {
    at: [0, 0.2, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const core = b.chain(
    "spine",
    [
      [0, 0.25, 0],
      [0, 1.25, 0],
      [0, 2.45, 0],
      [0, 3.35, 0.22],
    ],
    {
      parent: root,
      names: ["pelvis", "spineLower", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: core.tip!,
    at: [0, 3.54, 0.34],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.86, 0.91],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const mantle = b.chain(
    "mantle",
    [
      [0, 3.95, -0.05],
      [0, 4.8, -0.20],
      [0, 5.75, -0.40],
      [0, 6.55, -0.49],
      [0, 7.12, -0.30],
    ],
    {
      parent: head,
      names: ["mantleBase", "mantleMiddle", "mantleCrown", "mantleTip"],
      role: "spine",
    },
  );

  const armAngles = [-154, -111, -68, -26, 26, 68, 111, 154];
  const arms = armAngles.map((degrees, i) => {
    const a = degrees * DEG;
    const side = degrees > 0 ? 1 : -1;
    const front = Math.cos(a);
    const backLift = front < 0 ? 0.45 : 0;
    const reach = Math.abs(degrees) < 40 ? 4.82 : 4.96;
    const point = (r: number, y: number, bend = 0): number[] => [
      Math.sin(a) * r + side * bend * Math.cos(a),
      y,
      Math.cos(a) * r - side * bend * Math.sin(a),
    ];
    const points = [
      point(0.70, 2.33),
      point(1.38, 2.02 + backLift * 0.3),
      point(2.31, 1.34 + backLift),
      point(3.31, 0.83 + backLift, 0.06),
      point(4.17, 1.04 + backLift, 0.20),
      point(reach, 1.67 + backLift, 0.35),
      point(reach + 0.05, 2.34 + backLift, 0.48),
    ];
    const chain = b.chain(`tentacle${i + 1}`, catmull(points), {
      parent: core.joints[2],
      count: 7,
      role: "tentacle",
      names: (j) => `tentacle${i + 1}_${j + 1}`,
    });
    return { chain, side, degrees, points, index: i };
  });

  // A few placement helpers. All geometries enter through the builder.
  type Fill = string | Paint;

  const box = (
    name: string,
    at: number[] | THREE.Vector3,
    size: number[],
    color: Fill,
    bone: Joint = root,
    rotation: number[] = [0, 0, 0],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });

  const ellipsoid = (
    name: string,
    at: number[] | THREE.Vector3,
    scale: number[],
    color: Fill,
    bone: Joint,
    segments = 12,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
    });

  const bolt = (
    at: number[] | THREE.Vector3,
    normal: number[] | THREE.Vector3,
    radius: number,
    bone: Joint,
    color = C.steel,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, radius * 0.46, 6), color, {
      at,
      dir: normal,
      bone,
      name: "hexFastener",
    });

  const plateDrawing = (
    texture: THREE.Texture,
    at: number[] | THREE.Vector3,
    size: number[],
    bone: Joint,
    normal: number[] | THREE.Vector3 = [0, 0, 1],
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir: normal,
      axis: "z",
      texture,
      bone,
      name: "printedInlay",
    });

  // -----------------------------------------------------------------------
  // Core, mantle and face. The face remains completely clear of accessories.
  // -----------------------------------------------------------------------
  b.sweep(core, (t) => {
    const r = 0.57 + Math.sin(t * Math.PI * 0.86) * 0.56;
    return [r, r * 0.86];
  }, {
    color: hide,
    sides: 10,
    caps: "flat",
    name: "emergingBody",
  });

  const mantleTube = b.sweep(
    mantle,
    [0.91, 1.17, 0.98, 0.60, 0.035],
    {
      color: mantlePaint,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "tallArrowheadMantle",
    },
  );

  const skull = ellipsoid(
    "broadFacetedSkull",
    [0, 3.57, 0.40],
    [1.37, 1.05, 1.02],
    hide,
    head,
    16,
  );

  // Recessed orbital blocks flatten the eye-bearing front of the creature.
  for (const s of [-1, 1]) {
    const orbit = b.extrude(
      [
        [-0.52, -0.15],
        [-0.39, -0.36],
        [0.30, -0.28],
        [0.54, 0.06],
        [0.22, 0.26],
        [-0.37, 0.24],
      ],
      {
        at: [s * 0.68, 3.72, 1.12],
        x: [s, 0, -0.17],
        y: [0, 1, 0],
        thickness: 0.24,
        bevel: 0.045,
        color: C.ink,
        bone: head,
        name: `orbitalSocket${s > 0 ? "L" : "R"}`,
      },
    );

    glow(
      b.decal(orbit, eyeTexture, {
        at: [s * 0.67, 3.72, 1.29],
        dir: [s * 0.12, 0, 1],
        size: [1.00, 0.43],
        mirror: s > 0,
        segments: 8,
        lift: 0.008,
        bone: head,
        name: `eye${s > 0 ? "L" : "R"}`,
      }),
      0.65,
    );

    // An oversized swept brow makes the expression readable at thumbnail size.
    b.extrude(
      [
        [-0.57, 0.10],
        [-0.32, 0.28],
        [0.31, 0.23],
        [0.64, -0.02],
        [0.55, -0.15],
        [0.16, 0.02],
        [-0.37, -0.02],
      ],
      {
        at: [s * 0.65, 4.02, 1.12],
        x: [s, 0, -0.16],
        y: [0, 1, 0],
        thickness: 0.29,
        bevel: 0.04,
        color: armorPaint,
        bone: head,
        name: "heavyBrowCarapace",
      },
    );

    b.extrude(
      [
        [-0.41, 0.04],
        [-0.25, 0.14],
        [0.24, 0.10],
        [0.46, -0.05],
        [0.15, 0.015],
        [-0.29, -0.025],
      ],
      {
        at: [s * 0.68, 4.15, 1.29],
        x: [s, 0, -0.16],
        y: [0, 1, 0],
        thickness: 0.035,
        color: orangePaint,
        bone: head,
        name: "orangeBrowEdge",
      },
    );

    // Broad cheek guards leave the mouth and eyes exposed.
    b.extrude(
      [
        [-0.06, 0.28],
        [0.36, 0.37],
        [0.57, 0.08],
        [0.34, -0.45],
        [0.10, -0.57],
        [-0.10, -0.20],
      ],
      {
        at: [s * 0.94, 3.17, 0.87],
        x: [s, 0, -0.33],
        y: [0, 1, 0],
        thickness: 0.22,
        bevel: 0.04,
        color: armorPaint,
        bone: head,
        name: "cheekGuard",
      },
    );

    b.sweep(
      [
        [s * 1.03, 3.32, 1.00],
        [s * 1.19, 3.14, 0.94],
        [s * 1.17, 2.93, 0.90],
      ],
      0.045,
      {
        color: C.orange,
        bone: head,
        sides: 5,
        caps: "flat",
        name: "cheekOrangePiping",
      },
    );

    bolt([s * 1.25, 3.35, 0.97], [s * 0.3, 0, 1], 0.067, head);
  }

  // Center bridge, upper hooked beak and separate hinged lower jaw.
  b.extrude(
    [
      [-0.20, 0.29],
      [0, 0.43],
      [0.20, 0.29],
      [0.14, -0.24],
      [0, -0.34],
      [-0.14, -0.24],
    ],
    {
      at: [0, 3.78, 1.31],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.19,
      bevel: 0.025,
      color: orangePaint,
      bone: head,
      name: "centralNasalShield",
    },
  );

  ellipsoid("mouthRecess", [0, 2.98, 1.16], [0.60, 0.50, 0.29], C.ink, head);
  ellipsoid("innerMouth", [0, 2.95, 1.39], [0.35, 0.30, 0.08], C.plum, head);

  b.extrude(
    [
      [-0.38, 0.20],
      [-0.25, 0.40],
      [0, 0.47],
      [0.25, 0.40],
      [0.38, 0.20],
      [0.24, 0.04],
      [0.09, -0.30],
      [0, -0.37],
      [-0.09, -0.30],
      [-0.24, 0.04],
    ],
    {
      at: [0, 3.04, 1.49],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.30,
      bevel: 0.045,
      color: ivoryPaint,
      bone: head,
      name: "upperHookedBeak",
    },
  );

  b.extrude(
    [
      [-0.18, 0.23],
      [0, 0.34],
      [0.18, 0.23],
      [0.12, -0.04],
      [0, -0.26],
      [-0.12, -0.04],
    ],
    {
      at: [0, 3.07, 1.66],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: C.gold,
      bone: head,
      name: "beakKeel",
    },
  );

  b.extrude(
    [
      [-0.40, 0.15],
      [-0.25, 0.18],
      [0, -0.01],
      [0.25, 0.18],
      [0.40, 0.15],
      [0.30, -0.18],
      [0, -0.34],
      [-0.30, -0.18],
    ],
    {
      at: [0, 2.60, 1.34],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.29,
      bevel: 0.04,
      color: orangePaint,
      bone: jaw,
      name: "lowerBeak",
    },
  );

  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.30, 2.72, 1.46],
      [s * 0.25, 2.92, 1.50],
      null,
      0.09,
      { color: ivoryPaint, bone: jaw, sides: 5, name: "lowerBeakPoint" },
    );
    bolt([s * 0.48, 2.85, 1.23], [s * 0.4, 0, 1], 0.10, jaw, C.orange);
  }

  // -----------------------------------------------------------------------
  // Mantle armor: a few large plates, not a coat of tiny greebles.
  // -----------------------------------------------------------------------
  const forehead = b.extrude(
    [
      [-0.57, -0.32],
      [-0.69, 0.11],
      [-0.37, 0.45],
      [0.37, 0.45],
      [0.69, 0.11],
      [0.57, -0.32],
      [0, -0.49],
    ],
    {
      at: [0, 4.57, 0.88],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.23,
      bevel: 0.05,
      color: orangePaint,
      bone: mantle.joints[0],
      name: "commandCrest",
    },
  );

  b.decal(forehead, emblemTexture, {
    at: [0, 4.57, 1.02],
    dir: [0, 0, 1],
    size: [0.51, 0.55],
    bone: mantle.joints[0],
    lift: 0.006,
    name: "tridentInsignia",
  });

  for (const s of [-1, 1]) {
    bolt([s * 0.47, 4.55, 1.025], [0, 0, 1], 0.055, mantle.joints[0]);

    // The fins extend the arrowhead silhouette behind, not across the face.
    const fin = b.extrude(
      [
        [0.03, -0.59],
        [0.43, -0.39],
        [0.91, 0.13],
        [1.14, 1.12],
        [0.89, 1.72],
        [0.63, 1.02],
        [0.18, 0.45],
      ],
      {
        at: [s * 0.77, 4.60, -0.38],
        x: [s, 0, -0.08],
        y: [0, 1, -0.12],
        thickness: [0.24, 0.08],
        bevel: 0.025,
        color: armorPaint,
        bone: mantle.joints[1],
        name: `mantleFin${s > 0 ? "L" : "R"}`,
      },
    );

    b.extrude(
      [
        [0.37, -0.18],
        [0.76, 0.20],
        [1.01, 1.10],
        [0.85, 1.44],
        [0.71, 0.87],
        [0.48, 0.39],
      ],
      {
        at: [s * 0.77, 4.60, -0.20],
        x: [s, 0, -0.08],
        y: [0, 1, -0.12],
        thickness: 0.035,
        color: orangePaint,
        bone: mantle.joints[1],
        name: "finOrangeInset",
      },
    );

    b.decal(fin, finTexture, {
      at: [s * 1.35, 5.15, -0.19],
      dir: [0, 0, 1],
      size: [0.51, 1.16],
      mirror: s < 0,
      segments: 6,
      lift: 0.008,
      bone: mantle.joints[1],
      name: "finStencil",
    });

    b.sweep(
      [
        [s * 1.22, 4.47, -0.12],
        [s * 1.61, 5.03, -0.22],
        [s * 1.84, 5.70, -0.31],
        [s * 1.68, 6.19, -0.39],
      ],
      [0.06, 0.045],
      {
        color: C.pale,
        bone: mantle.joints[1],
        sides: 5,
        caps: "flat",
        name: "finLeadingEdge",
      },
    );

    for (let k = 0; k < 3; k++) {
      const y = 4.91 + k * 0.36;
      const x = s * (0.75 - k * 0.12);
      const z = 0.70 - k * 0.12;
      const gill = b.extrude(
        [[-0.25, -0.09], [-0.20, 0.11], [0.25, 0.08], [0.17, -0.12]],
        {
          at: [x, y, z],
          x: [s, 0, -0.20],
          y: [0, 1, 0],
          thickness: 0.055,
          color: C.ink,
          bone: mantle.joints[Math.min(2, k)],
          name: "recessedGillHousing",
        },
      );
      glow(
        b.decal(gill, gillTexture, {
          at: [x, y, z + 0.04],
          dir: [s * 0.18, 0, 1],
          size: [0.44, 0.18],
          segments: 3,
          mirror: s < 0,
          lift: 0.004,
          bone: mantle.joints[Math.min(2, k)],
          name: "bioluminousGill",
        }),
        0.65,
      );
    }
  }

  // Dorsal plates and restrained luminous seams are visible on the reverse.
  for (let i = 0; i < 4; i++) {
    const t = 0.13 + i * 0.19;
    const hit = mantleTube.at(t, 0);
    b.stick(
      new THREE.BoxGeometry(0.62 - i * 0.10, 0.12, 0.44),
      armorPaint,
      hit,
      {
        flow: [0, 1, 0],
        embed: 0.42,
        name: "dorsalMantlePlate",
      },
    );
  }

  const serialPanel = box(
    "serialPanelBacking",
    [0, 4.12, -1.025],
    [0.87, 0.34, 0.07],
    C.ink,
    mantle.joints[0],
  );
  plateDrawing(serialTexture, [0, 4.12, -1.068], [0.80, 0.28], mantle.joints[0], [0, 0, -1]);

  // Side operculum plates repeat the orange chevron language.
  for (const s of [-1, 1]) {
    const cheekHit = b.surface(skull).around([0, 3.57, 0.4]).at(s * 100, -8);
    b.stick(
      new THREE.CylinderGeometry(0.38, 0.43, 0.12, 8),
      orangePaint,
      cheekHit,
      { embed: 0.40, name: "sideOperculum" },
    );
    const center = cheekHit.at.clone().addScaledVector(cheekHit.n, 0.09);
    b.part(new THREE.CylinderGeometry(0.245, 0.245, 0.035, 8), armorPaint, {
      at: center,
      dir: cheekHit.n,
      bone: head,
      name: "operculumInset",
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.042, 6), C.aqua, {
        at: center.clone().addScaledVector(cheekHit.n, 0.023),
        dir: cheekHit.n,
        bone: head,
        name: "operculumLight",
      }),
      0.65,
    );
  }

  // -----------------------------------------------------------------------
  // Tentacles. Wide bases, separated sweeping gestures and pointed ends.
  // The oral face rolls toward the viewer as the arms turn upward.
  // -----------------------------------------------------------------------
  const armRadius = (t: number) =>
    0.49 * Math.pow(1 - t, 0.92) + 0.025;

  arms.forEach(({ chain, side, index }) => {
    const tube = b.sweep(
      chain,
      (t) => [armRadius(t), armRadius(t) * 0.83],
      {
        color: hide,
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "point" },
        sectors: [
          [-54, 54, ivoryPaint],
          [126, 234, C.deep],
        ],
        name: `tentacle${index + 1}Skin`,
      },
    );

    // A narrow raised side seam gives the long limbs a designed silhouette.
    b.sweep(tube.line(side * 72, 0.007).slice(0.13, 0.89), [0.037, 0.012], {
      color: C.turquoise,
      bone: chain,
      sides: 5,
      caps: "flat",
      name: "tentacleLateralRidge",
    });

    // Three broad, overlapping root guards sit on the non-oral sides.
    for (let j = 0; j < 3; j++) {
      const t = 0.08 + j * 0.115;
      const hit = tube.at(t, side * 97);
      const rr = armRadius(t);

      b.stick(
        new THREE.BoxGeometry(rr * 1.18, 0.13, 0.47 - j * 0.045),
        j === 0 ? orangePaint : armorPaint,
        hit,
        {
          embed: 0.55,
          flow: chain.at(t).tangent,
          name: `tentacleRootGuard${index}_${j}`,
        },
      );

      const stud = hit.at.clone().addScaledVector(hit.n, 0.10);
      bolt(stud, hit.n, 0.051 - j * 0.006, hit.bone!, C.steel);
    }

    // Eleven large sculpted cups, with real hollow lips and drawn radial
    // interior muscles. Alternating offsets make the oral strip feel organic.
    for (let j = 0; j < 11; j++) {
      const t = 0.14 + j * 0.073;
      const clock = (j % 2 ? -1 : 1) * 17;
      const hit = tube.at(t, clock);
      const r = armRadius(t) * (j < 3 ? 0.49 : 0.52);
      const h = r * 0.58;
      const axis = hit.n;
      const cupBone = hit.bone!;

      b.lathe(
        [
          [0, -h * 0.16],
          [r * 0.60, -h * 0.16],
          [r * 0.82, h * 0.16],
          [r, h * 0.73],
          [r * 0.97, h],
          [r * 0.77, h * 1.03],
          [r * 0.62, h * 0.55],
          [0, h * 0.34],
        ],
        {
          at: hit,
          axis,
          segments: 10,
          color: ivoryPaint,
          bone: cupBone,
          name: `suctionCup${index + 1}_${j + 1}`,
        },
      );

      b.part(new THREE.CircleGeometry(r * 0.65, 12), "#ffffff", {
        at: hit.at.clone().addScaledVector(axis, h * 0.48),
        dir: axis,
        axis: "z",
        up: chain.at(t).tangent,
        texture: cupTexture,
        bone: cupBone,
        name: "recessedCupInterior",
      });
    }

    // Tiny glowing sensory pits taper with the terminal section.
    for (let j = 0; j < 3; j++) {
      const hit = tube.at(0.79 + j * 0.066, side * 85);
      glow(
        b.stick(
          new THREE.SphereGeometry(0.034 - j * 0.007, 6, 4),
          C.aqua,
          hit,
          { embed: 0.45, name: "terminalSensoryPit" },
        ),
        0.7,
      );
    }
  });

  // A heavy armored collar ties all eight appendages to the main body.
  // Each segment is derived from the same radial axes as its arm.
  arms.forEach(({ degrees, chain }, i) => {
    const a = degrees * DEG;
    const normal = new THREE.Vector3(Math.sin(a), 0.20, Math.cos(a)).normalize();
    const at = new THREE.Vector3(Math.sin(a) * 1.03, 2.48, Math.cos(a) * 1.03);
    b.part(new THREE.BoxGeometry(0.62, 0.45, 0.22), armorPaint, {
      at,
      dir: normal,
      axis: "z",
      bone: chain.joints[0],
      name: `radialCollar${i + 1}`,
    });
    bolt(at.clone().addScaledVector(normal, 0.14), normal, 0.072, chain.joints[0], C.orange);
  });

  // -----------------------------------------------------------------------
  // Tidal stage. A low, tightly fitted piece of ocean, not a competing prop.
  // -----------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(5.48, 5.34, 0.18, 48), C.ink, {
    at: [0, 0.09, 0],
    bone: root,
    name: "oceanStageEdge",
  });

  b.part(new THREE.CylinderGeometry(5.37, 5.43, 0.08, 48), waterPaint, {
    at: [0, 0.19, 0],
    bone: root,
    name: "facetedOceanSurface",
  });

  // Broad impact-ring segments remain below all of the hero's facial detail.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const r = 1.43 + (i % 3) * 0.11;
    const from = [Math.sin(a) * r, 0.29, Math.cos(a) * r];
    const curve = arc([0, 0.29, 0], from, [0, 1, 0], 20 + (i % 2) * 4);

    b.sweep(curve, (t) => 0.10 + Math.sin(t * Math.PI) * 0.055, {
      color: i % 3 ? "#458e9b" : C.foam,
      bone: root,
      sides: 5,
      caps: "round",
      name: "impactFoamRing",
    });
  }

  // Low sweeping wave ribbons echo, but do not duplicate, the tentacle rays.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.16;
    const radial = (r: number, y: number, shift = 0) => [
      Math.sin(a + shift) * r,
      y,
      Math.cos(a + shift) * r,
    ];
    const inner = catmull([
      radial(1.16, 0.24, -0.08),
      radial(1.65, 0.32, -0.03),
      radial(2.13, 0.33, 0.04),
      radial(2.55, 0.23, 0.10),
    ]);
    const crest = catmull([
      radial(1.16, 0.25, -0.08),
      radial(1.69, 0.91 + (i % 2) * 0.13, -0.01),
      radial(2.16, 0.63, 0.05),
      radial(2.55, 0.24, 0.10),
    ]);
    b.membrane(inner, crest, {
      color: "#2b768b",
      thickness: 0.045,
      rows: 2,
      cols: 6,
      bone: root,
      name: "risingWaveSheet",
    });
    b.sweep(crest, [0.05, 0.025], {
      color: C.foam,
      bone: root,
      sides: 5,
      caps: "round",
      name: "waveFoamLip",
    });
  }

  // Long, broken ripple arcs allow the negative spaces between arms to read.
  for (let i = 0; i < 15; i++) {
    const r = 2.70 + (i % 4) * 0.59;
    const a = i * 2.399 + 0.2;
    const y = 0.245 + (i % 3) * 0.009;
    const from = [Math.sin(a) * r, y, Math.cos(a) * r];
    b.sweep(
      arc([0, y, 0], from, [0, 1, 0], 13 + random() * 17),
      0.017 + random() * 0.014,
      {
        color: i % 4 === 0 ? C.foam : "#42899a",
        bone: root,
        sides: 4,
        caps: "round",
        name: "brokenOceanRipple",
      },
    );
  }

  // Sparse triangular spray spikes grow directly out of the splash ring.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.27;
    const r = 1.50 + random() * 0.44;
    const p0 = new THREE.Vector3(Math.sin(a) * r, 0.25, Math.cos(a) * r);
    const p1 = p0.clone().add(new THREE.Vector3(Math.sin(a) * 0.21, 0.54, Math.cos(a) * 0.21));
    const p2 = p0.clone().add(new THREE.Vector3(Math.sin(a) * 0.42, 0.91 + random() * 0.3, Math.cos(a) * 0.42));
    b.sweep(bezier(p0, p1, p2), [0.13, 0], {
      color: "#6cb7bf",
      bone: root,
      sides: 5,
      caps: { start: "flat", end: "point" },
      name: "attachedWaterSpray",
    });
  }

  // Low-profile identification plaque on the front edge of the ocean slice.
  box("stagePlaque", [0, 0.16, 5.37], [1.18, 0.24, 0.055], C.ink);
  plateDrawing(serialTexture, [0, 0.17, 5.402], [1.11, 0.21], root);
  bolt([-0.51, 0.16, 5.415], [0, 0, 1], 0.025, root, C.orange);
  bolt([0.51, 0.16, 5.415], [0, 0, 1], 0.025, root, C.orange);

  // These handles are deliberately retained as named assemblies for inspection.
  serialPanel.mesh.userData.assembly = "mantleIdentification";
  b.root.userData.character = {
    class: "Abyssal Vanguard",
    scaleMeters: 7.15,
    palette: "petrol teal / porcelain / rescue orange",
    rigNotes: "Eight spread tentacle chains, flexible mantle, independent lower beak.",
  };

  return b.root;
}

import * as THREE from "three";
import {
  createBuilder,
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
    "An armored kraken rising through a sculpted tidal surge. Eight separated, individually rigged arms form a tiered silhouette around a luminous, sharply expressive face.",
};

/*
Art-direction changes:
1. Replace the repetitive umbrella silhouette with three heights of tentacle
   gesture: low reaching arms, sweeping lateral arms, and raised rear arms.
2. Move the misplaced dorsal plates to the actual back. Restore the uninterrupted
   forehead emblem and seat cheek fasteners directly on their guards.
3. Broaden the mantle and simplify its markings into purposeful armor panels.
   Preserve the strong eyes, brows, split beak, and teal/orange contrast.
4. Replace the thin, spiky splash with broad curled water sheets and clustered
   foam. The creature now visibly rises through water rather than over a stand.
5. Add a second, staggered row of proximal suction cups, a subtle oral blush,
   and larger terminal sensory lights without cluttering the face.
*/

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
    turquoise: "#47b3b0",
    pale: "#c3e6dc",
    orange: "#f29a3c",
    gold: "#ffd27a",
    steel: "#6c939f",
    plum: "#352f52",
    aqua: "#65fff0",
    foam: "#b6e7df",
  };

  const hide = paint((p, n) => {
    const shade = Math.max(0, Math.min(1, 0.47 + n.y * 0.32 + n.z * 0.12));
    return mix(
      mix("#164657", "#3c989c", shade),
      "#63b8ad",
      Math.max(0, noise(p, 0.31, 7) - 0.56) * 0.36,
    );
  });

  const mantlePaint = paint((p, n) => {
    const stripe = Math.abs(p.x) < 0.145 + Math.max(0, p.y - 4.9) * 0.035;
    if (stripe && p.z > 0.08 && n.z > 0.18) {
      return n.y > 0.1 ? "#f2b653" : "#cf7133";
    }
    return mix(
      "#153a51",
      "#36848c",
      Math.max(0, Math.min(1, 0.46 + n.y * 0.30 + n.z * 0.22)),
    );
  });

  const armorPaint = paint((p, n) =>
    mix(
      n.y > 0.28 ? "#3b737f" : "#1a4358",
      "#5c969b",
      Math.max(0, noise(p, 0.18, 18) - 0.5) * 0.35,
    ),
  );

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

  const oralPaint = paint((p, n) => {
    const base = mix("#8db5b5", "#d7e7d4", Math.max(0, Math.min(1, 0.65 + n.y * 0.28)));
    return mix(base, "#b4a7b5", Math.max(0, noise(p, 0.34, 24) - 0.40) * 0.26);
  });

  const waterPaint = paint((p, n) => {
    const ripples = Math.sin(Math.hypot(p.x, p.z) * 7.2 + noise(p, 0.8, 4));
    return mix(
      "#102e47",
      "#255b70",
      Math.max(0, Math.min(1, 0.32 + 0.13 * ripples + 0.24 * n.y)),
    );
  });

  const wavePaint = paint((p, n) =>
    mix(
      "#24576e",
      "#59a9b2",
      Math.max(0, Math.min(1, p.y * 0.47 + n.y * 0.15)),
    ),
  );

  // Reusable high-contrast drawings; fine detail belongs in the textures.
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
        M126 59 L139 18 L152 16 L139 58Z" fill="#50d8cd"/>
      <path d="M34 65 L44 37 M66 63 L76 34 M98 61 L108 31 M130 59 L140 28"
        stroke="#bdfff0" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: the neutral pose keeps all arms separate and animatable.
  const root = b.joint("root", {
    at: [0, 0.2, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const core = b.chain(
    "spine",
    [[0, 0.25, 0], [0, 1.25, 0], [0, 2.45, 0], [0, 3.35, 0.22]],
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
      [0, 5.66, -0.40],
      [0, 6.43, -0.49],
      [0, 6.98, -0.30],
    ],
    {
      parent: head,
      names: ["mantleBase", "mantleMiddle", "mantleCrown", "mantleTip"],
      role: "spine",
    },
  );

  const armAngles = [-148, -108, -66, -27, 27, 66, 108, 148];
  const arms = armAngles.map((degrees, i) => {
    const a = degrees * DEG;
    const side = degrees > 0 ? 1 : -1;
    const angle = Math.abs(degrees);
    const rear = angle > 125;
    const midBack = angle > 90 && !rear;
    const lateral = angle > 45 && angle < 90;
    const tipHeight = rear ? 4.28 : midBack ? 3.27 : lateral ? 2.62 : 1.91;
    const reach = rear ? 4.27 : midBack ? 4.88 : lateral ? 4.98 : 4.63;
    const trough = rear ? 1.86 : midBack ? 1.34 : lateral ? 0.95 : 0.76;
    const bend = rear ? 0.65 : lateral ? 0.28 : 0.42;

    const point = (r: number, y: number, turn = 0): number[] => [
      Math.sin(a) * r + side * turn * Math.cos(a),
      y,
      Math.cos(a) * r - side * turn * Math.sin(a),
    ];

    const points = [
      point(0.70, 2.33),
      point(1.38, 2.05),
      point(2.24, trough + 0.38),
      point(3.20, trough, 0.08),
      point(reach - 0.48, trough + (tipHeight - trough) * 0.27, bend * 0.5),
      point(reach, tipHeight - 0.63, bend),
      point(reach - (rear ? 0.20 : 0.06), tipHeight, bend + 0.12),
    ];

    const chain = b.chain(`tentacle${i + 1}`, catmull(points), {
      parent: core.joints[2],
      count: 7,
      role: "tentacle",
      names: (j) => `tentacle${i + 1}_${j + 1}`,
    });

    return { chain, side, degrees, index: i };
  });

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
      at, bone, rotation, name,
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
      at, scale, bone, flat: true, name,
    });

  const bolt = (
    at: number[] | THREE.Vector3,
    normal: number[] | THREE.Vector3,
    radius: number,
    bone: Joint,
    color = C.steel,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, radius * 0.46, 6), color, {
      at, dir: normal, bone, name: "hexFastener",
    });

  const drawing = (
    texture: THREE.Texture,
    at: number[] | THREE.Vector3,
    size: number[],
    bone: Joint,
    normal: number[] | THREE.Vector3 = [0, 0, 1],
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, dir: normal, axis: "z", texture, bone, name: "printedInlay",
    });

  // Large volumes.
  b.sweep(core, (t) => {
    const r = 0.72 + Math.sin(t * Math.PI * 0.86) * 0.42;
    return [r, r * 0.86];
  }, {
    color: hide,
    sides: 10,
    caps: "flat",
    name: "emergingBody",
  });

  const mantleTube = b.sweep(
    mantle,
    [0.94, 1.24, 1.08, 0.64, 0.035],
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

  // The face stays the highest-contrast and most detailed focal point.
  for (const s of [-1, 1]) {
    const orbit = b.extrude(
      [
        [-0.52, -0.15], [-0.39, -0.36], [0.30, -0.28],
        [0.54, 0.06], [0.22, 0.26], [-0.37, 0.24],
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

    glow(b.decal(orbit, eyeTexture, {
      at: [s * 0.67, 3.72, 1.29],
      dir: [s * 0.12, 0, 1],
      size: [1.00, 0.43],
      mirror: s > 0,
      segments: 8,
      lift: 0.008,
      bone: head,
      name: `eye${s > 0 ? "L" : "R"}`,
    }), 0.65);

    b.extrude(
      [
        [-0.57, 0.10], [-0.32, 0.28], [0.31, 0.23],
        [0.64, -0.02], [0.55, -0.15], [0.16, 0.02], [-0.37, -0.02],
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
        [-0.41, 0.04], [-0.25, 0.14], [0.24, 0.10],
        [0.46, -0.05], [0.15, 0.015], [-0.29, -0.025],
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

    const cheek = b.extrude(
      [
        [-0.06, 0.28], [0.36, 0.37], [0.57, 0.08],
        [0.34, -0.45], [0.10, -0.57], [-0.10, -0.20],
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

    const guardSurface = b.surface(cheek);
    const fastenerHit = guardSurface.nearest([s * 1.25, 3.35, 1.1]);
    b.stick(
      new THREE.CylinderGeometry(0.067, 0.067, 0.035, 6),
      C.steel,
      fastenerHit,
      { embed: 0.25, name: "seatedCheekFastener" },
    );

    const piping = guardSurface.drape(
      [
        [s * 1.03, 3.32, 1.06],
        [s * 1.19, 3.14, 1.03],
        [s * 1.17, 2.93, 1.00],
      ],
      { lift: 0.024 },
    );
    b.sweep(piping, 0.043, {
      color: C.orange,
      bone: head,
      sides: 5,
      caps: "flat",
      name: "cheekOrangePiping",
    });
  }

  b.extrude(
    [[-0.20, 0.29], [0, 0.43], [0.20, 0.29], [0.14, -0.24], [0, -0.34], [-0.14, -0.24]],
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
      [-0.38, 0.20], [-0.25, 0.40], [0, 0.47], [0.25, 0.40], [0.38, 0.20],
      [0.24, 0.04], [0.09, -0.30], [0, -0.37], [-0.09, -0.30], [-0.24, 0.04],
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
    [[-0.18, 0.23], [0, 0.34], [0.18, 0.23], [0.12, -0.04], [0, -0.26], [-0.12, -0.04]],
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
      [-0.40, 0.15], [-0.25, 0.18], [0, -0.01], [0.25, 0.18],
      [0.40, 0.15], [0.30, -0.18], [0, -0.34], [-0.30, -0.18],
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

  // Crest: the emblem sits on the known flat front face, clear of dorsal armor.
  b.extrude(
    [
      [-0.57, -0.32], [-0.69, 0.11], [-0.37, 0.45],
      [0.37, 0.45], [0.69, 0.11], [0.57, -0.32], [0, -0.49],
    ],
    {
      at: [0, 4.57, 0.94],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.23,
      bevel: 0.05,
      color: orangePaint,
      bone: mantle.joints[0],
      name: "commandCrest",
    },
  );
  drawing(emblemTexture, [0, 4.58, 1.063], [0.56, 0.58], mantle.joints[0]);

  for (const s of [-1, 1]) {
    bolt([s * 0.47, 4.55, 1.067], [0, 0, 1], 0.055, mantle.joints[0]);

    const fin = b.extrude(
      [
        [0.03, -0.59], [0.43, -0.39], [0.91, 0.13],
        [1.14, 1.12], [0.89, 1.72], [0.63, 1.02], [0.18, 0.45],
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
        [0.37, -0.18], [0.76, 0.20], [1.01, 1.10],
        [0.85, 1.44], [0.71, 0.87], [0.48, 0.39],
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

    // Surface-derived gills remain seated as the mantle proportions change.
    for (let k = 0; k < 3; k++) {
      const t = 0.32 + k * 0.135;
      const hit = b.surface(mantleTube).around(mantle.at(t)).at(s * 32, 0);
      const housing = b.stick(
        new THREE.BoxGeometry(0.47 - k * 0.04, 0.065, 0.22),
        C.ink,
        hit,
        { embed: 0.55, flow: [0, 1, 0], name: "recessedGillHousing" },
      );
      glow(b.decal(housing, gillTexture, {
        at: hit.at.clone().addScaledVector(hit.n, 0.08),
        dir: hit.n,
        size: [0.43 - k * 0.04, 0.19],
        segments: 3,
        mirror: s < 0,
        lift: 0.005,
        bone: hit.bone!,
        name: "bioluminousGill",
      }), 0.60);
    }
  }

  // Correctly placed rear armor, with an uninterrupted orange central stripe
  // on the front. The original front-facing plates obscured the insignia.
  for (let i = 0; i < 4; i++) {
    const t = 0.14 + i * 0.19;
    const center = mantle.at(t);
    const hit = b.surface(mantleTube).around(center).at(180, 0);
    b.stick(
      new THREE.BoxGeometry(0.69 - i * 0.11, 0.14, 0.46),
      armorPaint,
      hit,
      {
        flow: [0, 1, 0],
        embed: 0.42,
        name: "dorsalMantlePlate",
      },
    );
    b.stick(
      new THREE.BoxGeometry(0.35 - i * 0.045, 0.027, 0.055),
      orangePaint,
      hit.moved([0, 0.085, 0.10]),
      { embed: 0.25, flow: [0, 1, 0], name: "rearArmorIdentificationBar" },
    );
  }

  const rearHit = b.surface(skull).around([0, 3.57, 0.4]).at(180, 4);
  const rearPanel = b.stick(
    new THREE.BoxGeometry(0.89, 0.07, 0.34),
    C.ink,
    rearHit,
    { embed: 0.4, flow: [0, 1, 0], name: "rearSerialPanel" },
  );
  b.decal(rearPanel, serialTexture, {
    at: rearHit.at.clone().addScaledVector(rearHit.n, 0.08),
    dir: rearHit.n,
    size: [0.81, 0.28],
    lift: 0.005,
    bone: head,
    name: "rearSerialGraphic",
  });

  for (const s of [-1, 1]) {
    const hit = b.surface(skull).around([0, 3.57, 0.4]).at(s * 100, -8);
    b.stick(
      new THREE.CylinderGeometry(0.38, 0.43, 0.12, 8),
      orangePaint,
      hit,
      { embed: 0.40, name: "sideOperculum" },
    );

    const center = hit.at.clone().addScaledVector(hit.n, 0.09);
    b.part(new THREE.CylinderGeometry(0.245, 0.245, 0.035, 8), armorPaint, {
      at: center,
      dir: hit.n,
      bone: head,
      name: "operculumInset",
    });
    glow(b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.042, 6), C.aqua, {
      at: center.clone().addScaledVector(hit.n, 0.023),
      dir: hit.n,
      bone: head,
      name: "operculumLight",
    }), 0.65);
  }

  // Arms have robust, slightly compressed sections, not flat ribbons.
  const armRadius = (t: number) =>
    0.49 * Math.pow(1 - t, 0.88) + 0.025;

  arms.forEach(({ chain, side, index }) => {
    const tube = b.sweep(
      chain,
      (t) => [armRadius(t), armRadius(t) * 0.90],
      {
        color: hide,
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "point" },
        sectors: [
          [-57, 57, oralPaint],
          [126, 234, C.deep],
        ],
        name: `tentacle${index + 1}Skin`,
      },
    );

    b.sweep(tube.line(side * 72, 0.007).slice(0.13, 0.91), [0.037, 0.012], {
      color: C.turquoise,
      bone: chain,
      sides: 5,
      caps: "flat",
      name: "tentacleLateralRidge",
    });

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
      b.stick(
        new THREE.CylinderGeometry(0.050 - j * 0.006, 0.050 - j * 0.006, 0.026, 6),
        C.steel,
        hit.moved([0, 0.065, 0]),
        { embed: 0.25, name: "rootGuardFastener" },
      );
    }

    const cup = (t: number, clock: number, size: number, name: string) => {
      const hit = tube.at(t, clock);
      const r = armRadius(t) * size;
      const h = r * 0.58;
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
          axis: hit.n,
          segments: 10,
          color: ivoryPaint,
          bone: hit.bone!,
          name,
        },
      );
      b.part(new THREE.CircleGeometry(r * 0.65, 12), "#ffffff", {
        at: hit.at.clone().addScaledVector(hit.n, h * 0.48),
        dir: hit.n,
        axis: "z",
        up: chain.at(t).tangent,
        texture: cupTexture,
        bone: hit.bone!,
        name: "recessedCupInterior",
      });
    };

    for (let j = 0; j < 11; j++) {
      const t = 0.14 + j * 0.073;
      cup(t, j < 5 ? 24 : (j % 2 ? -1 : 1) * 15, j < 5 ? 0.43 : 0.51,
        `suctionCup${index + 1}_${j + 1}`);
    }

    for (let j = 0; j < 5; j++) {
      cup(0.175 + j * 0.073, -25, 0.39,
        `secondaryCup${index + 1}_${j + 1}`);
    }

    for (let j = 0; j < 3; j++) {
      const hit = tube.at(0.78 + j * 0.066, side * 85);
      glow(b.stick(
        new THREE.SphereGeometry(0.038 - j * 0.008, 6, 4),
        C.aqua,
        hit,
        { embed: 0.45, name: "terminalSensoryPit" },
      ), 0.65);
    }
  });

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
    bolt(at.clone().addScaledVector(normal, 0.12), normal, 0.072, chain.joints[0], C.orange);
  });

  // A tightly fitted ocean stage with broad water masses, not needle-like spray.
  b.part(new THREE.CylinderGeometry(5.32, 5.20, 0.18, 48), C.ink, {
    at: [0, 0.09, 0],
    bone: root,
    name: "oceanStageEdge",
  });
  b.part(new THREE.CylinderGeometry(5.23, 5.27, 0.08, 48), waterPaint, {
    at: [0, 0.19, 0],
    bone: root,
    name: "facetedOceanSurface",
  });

  // The surge hides the narrow lower torso and explains the creature's lift.
  b.lathe(
    [
      [0.61, 0],
      [1.87, 0],
      [1.79, 0.13],
      [1.56, 0.28],
      [1.25, 0.57],
      [1.04, 0.91],
      [0.89, 1.00],
      [0.76, 0.81],
      [0.67, 0.37],
    ],
    {
      at: [0, 0.21, 0],
      axis: [0, 1, 0],
      segments: 16,
      color: wavePaint,
      bone: root,
      name: "centralDisplacedWater",
    },
  );

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.09;
    const high = 0.90 + (i % 3) * 0.13;
    const p = (r: number, y: number, angle: number) => [
      Math.sin(angle) * r, y, Math.cos(angle) * r,
    ];

    // Both edges travel along the wave. The top rolls outward after the peak.
    const bottom = catmull([
      p(1.05, 0.25, a - 0.29),
      p(1.42, 0.24, a - 0.11),
      p(1.90, 0.24, a + 0.10),
      p(2.23, 0.24, a + 0.26),
    ]);
    const top = catmull([
      p(1.05, 0.34, a - 0.29),
      p(1.34, high, a - 0.09),
      p(1.84, high * 0.78, a + 0.11),
      p(2.23, 0.27, a + 0.26),
    ]);

    b.membrane(bottom, top, {
      color: wavePaint,
      thickness: 0.10,
      rows: 3,
      cols: 8,
      bone: root,
      name: "broadCurledSplash",
    });

    b.sweep(top, [0.055, 0.11, 0.08, 0.025], {
      color: C.foam,
      bone: root,
      sides: 6,
      caps: "round",
      name: "rollingFoamCrest",
    });

    for (let j = 0; j < 3; j++) {
      const t = 0.36 + j * 0.16;
      const point = top.at(t);
      ellipsoid(
        "crestFoamCluster",
        point,
        [0.13 + j * 0.018, 0.09, 0.12],
        j % 2 ? "#8ecacb" : C.foam,
        root,
        8,
      );
    }

    const from = p(2.10, 0.26, a + 0.02);
    b.sweep(arc([0, 0.26, 0], from, [0, 1, 0], 23), [0.038, 0.068, 0.026], {
      color: "#74b4bf",
      bone: root,
      sides: 5,
      caps: "round",
      name: "surgeRunoffFoam",
    });
  }

  // Low broken arcs follow the force of the breach and leave dark breathing room.
  for (let i = 0; i < 13; i++) {
    const r = 2.74 + (i % 4) * 0.55;
    const a = i * 2.399 + 0.2;
    const y = 0.245 + (i % 3) * 0.009;
    const from = [Math.sin(a) * r, y, Math.cos(a) * r];
    b.sweep(
      arc([0, y, 0], from, [0, 1, 0], 13 + random() * 17),
      0.017 + random() * 0.014,
      {
        color: i % 4 === 0 ? "#83bdc3" : "#356f85",
        bone: root,
        sides: 4,
        caps: "round",
        name: "brokenOceanRipple",
      },
    );
  }

  // A few short, fat curling sprays remain visibly rooted in the water mass.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.72;
    const r = 1.37;
    const p0 = new THREE.Vector3(Math.sin(a) * r, 0.44, Math.cos(a) * r);
    const p1 = p0.clone().add(new THREE.Vector3(Math.sin(a) * 0.24, 0.72, Math.cos(a) * 0.24));
    const p2 = p0.clone().add(new THREE.Vector3(Math.sin(a) * 0.57, 0.49, Math.cos(a) * 0.57));
    b.sweep(bezier(p0, p1, p2), [0.16, 0.11, 0.025], {
      color: wavePaint,
      bone: root,
      sides: 6,
      caps: "round",
      name: "curledWaterTongue",
    });
    ellipsoid("sprayTipFoam", p2, [0.065, 0.06, 0.065], C.foam, root, 8);
  }

  box("stagePlaque", [0, 0.16, 5.22], [1.18, 0.24, 0.055], C.ink);
  drawing(serialTexture, [0, 0.17, 5.252], [1.11, 0.21], root);
  bolt([-0.51, 0.16, 5.265], [0, 0, 1], 0.025, root, C.orange);
  bolt([0.51, 0.16, 5.265], [0, 0, 1], 0.025, root, C.orange);

  const result = b.root;
  result.userData.character = {
    class: "Abyssal Vanguard",
    palette: "petrol teal / porcelain / rescue orange",
    rigNotes:
      "Eight separated tentacle chains in a tiered neutral spread, flexible mantle, independent lower beak.",
  };
  return result;
}

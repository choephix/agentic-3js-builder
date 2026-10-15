import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  noise,
  mix,
  svg,
  frame,
  catmull,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Vulcanite — Heart of the Caldera",
  description:
    "An elemental basalt golem with monumental, chamfered armor, golden volcanic inscriptions, a radiant furnace heart, and articulated molten joints. Staged on a fractured caldera seal.",
};

type P = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Vulcanite",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(7349);

  const C = {
    black: "#171a28",
    recess: "#10111c",
    stone: "#343847",
    edge: "#505464",
    light: "#77777d",
    gold: "#b88b51",
    paleGold: "#e8c388",
    ember: "#e44116",
    orange: "#ff781e",
    yellow: "#ffd166",
    white: "#fff2b5",
    earth: "#24202c",
    ash: "#69616a",
  };

  const basalt = paint((p, n) => {
    const v = noise(p, 0.19, 4);
    const base = mix("#252733", "#444b5b", v * 0.65 + Math.max(0, n.y) * 0.25);
    return mix(base, "#6b4a44", Math.max(0, -n.y) * 0.16);
  });
  const paleBasalt = paint((p, n) => {
    const v = noise(p, 0.14, 11);
    return mix("#383b4b", "#6b6d79", v * 0.57 + Math.max(0, n.y) * 0.27);
  });
  const groundPaint = paint((p, n) =>
    mix("#25212d", "#514653", noise(p, 0.36, 8) * 0.6 + Math.max(0, n.y) * 0.15),
  );

  // The six drawings use a common angular, mineral-based visual language.
  const eyeTex = svg(
    `<svg viewBox="0 0 160 64">
      <path d="M5 13 L153 4 L123 50 L24 56Z" fill="#de4619"/>
      <path d="M15 18 L143 12 L116 42 L30 46Z" fill="#ffba39"/>
      <path d="M27 23 L130 17 L110 32 L37 36Z" fill="#fff5b7"/>
      <path d="M88 15 L77 43 L90 41 L103 13Z" fill="#fffbd6"/>
    </svg>`,
    { size: 256 },
  );

  const runeTex = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 9 L111 62 L64 111 L17 62Z" fill="none" stroke="#9e5a29" stroke-width="11"/>
      <path d="M64 9 L111 62 L64 111 L17 62Z" fill="none" stroke="#ffcf73" stroke-width="5"/>
      <path d="M64 31 L88 62 L64 88 L40 62Z M64 111 V170 M39 132 L64 157 L89 132 M46 174 L64 185 L82 174"
        fill="none" stroke="#ffc25c" stroke-width="6" stroke-linejoin="miter"/>
      <path d="M64 45 L77 62 L64 76 L51 62Z" fill="#fff0ac"/>
    </svg>`,
    { size: 256 },
  );

  const crackTex = svg(
    `<svg viewBox="0 0 160 160">
      <g fill="none" stroke-linejoin="miter">
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158 M44 67 L9 88 M88 96 L129 77 L151 91"
          stroke="#150f1d" stroke-width="14"/>
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158 M44 67 L9 88 M88 96 L129 77 L151 91"
          stroke="#c84319" stroke-width="6"/>
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158 M88 96 L129 77"
          stroke="#ffbb49" stroke-width="2.8"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const coreTex = svg(
    `<svg viewBox="0 0 160 160">
      <path d="M80 5 L149 80 L80 155 L11 80Z" fill="#e14a15"/>
      <path d="M80 17 L136 80 L80 143 L24 80Z" fill="#ffac2f"/>
      <path d="M80 17 L80 143 L24 80Z" fill="#ffd36b"/>
      <path d="M80 36 L118 80 L80 124 L42 80Z" fill="none" stroke="#fff1a5" stroke-width="6"/>
      <path d="M80 51 L103 80 L80 109 L57 80Z" fill="#fff8ce"/>
      <path d="M80 5 V36 M149 80 H118 M80 155 V124 M11 80 H42"
        stroke="#fff2a5" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const trimTex = svg(
    `<svg viewBox="0 0 256 48">
      <path d="M0 5 H256 M0 43 H256" fill="none" stroke="#ad7540" stroke-width="4"/>
      <path d="M0 24 L24 8 L48 24 L24 40Z M64 24 L88 8 L112 24 L88 40Z
        M128 24 L152 8 L176 24 L152 40Z M192 24 L216 8 L240 24 L216 40Z"
        fill="none" stroke="#eac78b" stroke-width="3"/>
      <path d="M48 24 H64 M112 24 H128 M176 24 H192 M240 24 H256"
        stroke="#eac78b" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const sealTex = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#b17f54">
        <circle cx="128" cy="128" r="115" stroke-width="3"/>
        <circle cx="128" cy="128" r="105" stroke-width="2"/>
        <path d="M128 20 L236 128 L128 236 L20 128Z" stroke-width="4"/>
        <path d="M128 48 L208 128 L128 208 L48 128Z" stroke-width="2"/>
        <path d="M128 75 L176 128 L128 181 L80 128Z" stroke-width="5"/>
        <path d="M128 8 V35 M128 221 V248 M8 128 H35 M221 128 H248
          M43 43 L61 61 M195 195 L213 213 M43 213 L61 195 M195 61 L213 43"
          stroke-width="6"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // Skeleton first. Broad, lowered T-pose; the fingers remain individually readable.
  const hips = b.joint("hips", {
    at: [0, 1.47, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.47, 0], [0, 2.02, 0], [0, 2.68, -0.015]],
    { parent: hips, names: ["waist", "chest", "upperChest"], role: "spine" },
  );
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 2.94, -0.025],
    dir: [0, 1, 0],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 3.23, 0],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 3.10, 0.035],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const armPoints: P[] = [
      [s * 0.78, 2.72, 0],
      [s * 1.39, 2.49, 0],
      [s * 1.89, 2.25, 0.015],
    ];
    const arm = b.chain(`arm${side}`, armPoints, {
      parent: spine.tip!,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const legPoints: P[] = [
      [s * 0.46, 1.48, 0],
      [s * 0.58, 0.95, 0.015],
      [s * 0.64, 0.40, 0.055],
    ];
    const leg = b.chain(`leg${side}`, legPoints, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.64, 0.18, 0.21],
    });
    const fingers = [0, 1, 2].map((i) => {
      const x = s * (1.94 + i * 0.14);
      const points: P[] = [
        [x, 2.12, 0.105],
        [x + s * 0.045, 1.94 - i * 0.025, 0.145],
        [x + s * 0.07, 1.78 - i * 0.018, 0.14],
      ];
      const chain = b.chain(`finger${side}${i + 1}`, points, {
        parent: arm.tip!,
        names: [`finger${side}${i + 1}Base`, `finger${side}${i + 1}Tip`],
        role: "digit",
      });
      return { chain, points };
    });
    const thumbPoints: P[] = [
      [s * 1.91, 2.22, 0.12],
      [s * 1.82, 2.09, 0.32],
      [s * 1.83, 1.94, 0.40],
    ];
    const thumb = b.chain(`thumb${side}`, thumbPoints, {
      parent: arm.tip!,
      names: [`thumb${side}Base`, `thumb${side}Tip`],
      role: "digit",
    });
    return { s, side, arm, armPoints, leg, legPoints, fingers, thumb, thumbPoints };
  });

  function box(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = hips,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      name, at, bone, rotation,
    });
  }

  function rock(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = hips,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      name, at, bone, scale: size, rotation, flat: true,
    });
  }

  function molten(
    name: string,
    at: P,
    size: P,
    bone: Joint,
    color = C.orange,
  ) {
    return glow(rock(name, at, size, color, bone), 1.6);
  }

  function drawing(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    bone: Joint,
    luminous = false,
    dir: P = [0, 0, 1],
  ) {
    const p = b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, bone, name, texture, dir, axis: "z",
    });
    if (luminous) glow(p, 1.25);
    return p;
  }

  // A simple eight-corner slab is the repeated building block of the armor.
  function plate(
    name: string,
    at: P,
    w: number,
    h: number,
    depth: number,
    bone: Joint,
    color: Fill = basalt,
    cut = 0.18,
    x: P = [1, 0, 0],
    y: P = [0, 1, 0],
  ) {
    const X = w / 2;
    const Y = h / 2;
    const c = Math.min(w, h) * cut;
    return b.extrude(
      [
        [-X + c, -Y], [X - c, -Y], [X, -Y + c], [X, Y - c],
        [X - c, Y], [-X + c, Y], [-X, Y - c], [-X, -Y + c],
      ],
      {
        name, at, x, y, thickness: depth, bevel: Math.min(0.025, depth * 0.14),
        bone, color,
      },
    );
  }

  function diamond(
    name: string,
    at: P,
    w: number,
    h: number,
    depth: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.extrude(
      [[0, -h / 2], [w / 2, 0], [0, h / 2], [-w / 2, 0]],
      {
        name, at, x: [1, 0, 0], y: [0, 1, 0],
        thickness: depth, bevel: Math.min(depth * 0.1, 0.015), color, bone,
      },
    );
  }

  // Ground: a thin, fractured octagonal caldera, not a competing landscape.
  b.part(new THREE.CylinderGeometry(1.82, 1.92, 0.14, 12), C.earth, {
    at: [0, 0.07, 0], bone: hips, name: "calderaFoundation",
  });
  b.part(new THREE.CylinderGeometry(1.75, 1.82, 0.055, 12), groundPaint, {
    at: [0, 0.155, 0], bone: hips, name: "ashStonePlatform",
  });
  drawing("oldCalderaSeal", [0, 0.185, 0], [3.25, 3.25], sealTex, hips, false, [0, 1, 0]);

  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const r = 1.73;
    plate(
      `rimBlock${i}`,
      [Math.sin(a) * r, 0.13, Math.cos(a) * r],
      0.49, 0.19, 0.23, hips, i % 3 === 0 ? paleBasalt : basalt,
      0.22, [Math.cos(a), 0, -Math.sin(a)],
    );
  }

  const fissures: P[][] = [
    [[-0.22, 0.19, 0.60], [-0.41, 0.19, 0.91], [-0.26, 0.19, 1.15], [-0.65, 0.19, 1.59]],
    [[0.72, 0.19, -0.27], [1.03, 0.19, -0.38], [1.13, 0.19, -0.71], [1.53, 0.19, -0.80]],
    [[-0.56, 0.19, -0.62], [-0.91, 0.19, -0.87], [-1.27, 0.19, -0.82]],
  ];
  fissures.forEach((path, i) => {
    b.sweep(path, 0.026, { color: C.recess, bone: hips, caps: "flat", name: `groundRift${i}` });
    glow(b.sweep(path, 0.010, {
      color: C.orange, bone: hips, caps: "flat", name: `groundRiftFire${i}`,
    }), 1.4);
  });

  for (let i = 0; i < 19; i++) {
    const a = random() * Math.PI * 2;
    const r = 1.14 + random() * 0.48;
    const size = 0.035 + random() * 0.07;
    rock(`fallenBasalt${i}`, [Math.sin(a) * r, 0.19 + size * 0.6, Math.cos(a) * r],
      [size * 1.3, size * 0.65, size], i % 5 === 0 ? paleBasalt : basalt,
      hips, [random() * 35, random() * 90, random() * 30]);
  }

  // A warm, continuous inner body remains visible only through plate gaps.
  glow(b.sweep(spine, (t) => [0.33 + t * 0.30, 0.27 + t * 0.10], {
    color: C.ember, sides: 6, smooth: false, caps: "flat", name: "moltenTorso",
  }), 1.1);

  const chestBone = spine.joints[1];
  plate("pelvisCore", [0, 1.47, 0.01], 1.00, 0.43, 0.59, hips);
  plate("waistDarkSocket", [0, 1.83, 0], 0.70, 0.36, 0.58, spine.joints[0], C.recess);
  for (let j = 0; j < 3; j++) {
    plate(`abdominalCourse${j}`, [0, 1.77 + j * 0.16, 0.30],
      0.55 + j * 0.12, 0.125, 0.13, chestBone, j === 2 ? paleBasalt : basalt);
    glow(box(`abdominalSeam${j}`, [0, 1.85 + j * 0.16, 0.295],
      [0.41 + j * 0.12, 0.025, 0.035], C.orange, chestBone), 1.4);
  }

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.10, -0.38], [0.59, -0.26], [0.84, 0.13],
        [0.68, 0.40], [0.13, 0.32], [0.26, 0.02],
      ],
      {
        at: [0, 2.53, 0.24], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.30, bevel: 0.035, color: paleBasalt,
        bone: chestBone, name: s > 0 ? "pectoralL" : "pectoralR",
      },
    );
    plate(`ribGuard${s}`, [s * 0.57, 2.10, 0.025], 0.32, 0.57, 0.60, chestBone);
    plate(`collar${s}`, [s * 0.43, 2.92, 0.04], 0.65, 0.18, 0.61, chestBone, basalt);
    diamond(`collarGoldInlay${s}`, [s * 0.44, 2.91, 0.355], 0.22, 0.075, 0.012, C.gold, chestBone);
    drawing(`chestEtching${s}`, [s * 0.51, 2.67, 0.396],
      [0.34, 0.064], trimTex, chestBone);
    drawing(`chestCrack${s}`, [s * 0.51, 2.43, 0.398],
      [0.25, 0.27], crackTex, chestBone, true);

    b.extrude(
      [[-0.19, 0.19], [0.18, 0.17], [0.23, -0.20], [0.07, -0.34], [-0.24, -0.22]],
      {
        at: [s * 0.52, 1.50, 0.34],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.15,
        bevel: 0.02, bone: hips, color: paleBasalt, name: `hipSkirt${s}`,
      },
    );
    drawing(`hipRune${s}`, [s * 0.52, 1.47, 0.423], [0.105, 0.19], runeTex, hips, true);
  }

  // Furnace heart: mineral casing, thick bronze rim, and a faceted hot crystal.
  diamond("heartObsidianSocket", [0, 2.49, 0.395], 0.66, 0.82, 0.17, C.recess, chestBone);
  diamond("heartAncientRim", [0, 2.49, 0.49], 0.52, 0.68, 0.08, C.gold, chestBone);
  diamond("heartInnerShadow", [0, 2.49, 0.537], 0.44, 0.60, 0.028, C.ember, chestBone);
  glow(diamond("heartCrystal", [0, 2.49, 0.565], 0.35, 0.49, 0.11, C.yellow, chestBone), 1.7);
  drawing("heartCrystalFacets", [0, 2.49, 0.627], [0.35, 0.49], coreTex, chestBone, true);

  for (const s of [1, -1]) {
    diamond(`heartClamp${s}`, [s * 0.268, 2.49, 0.55], 0.13, 0.20, 0.10, paleBasalt, chestBone);
  }
  diamond("sternumKeystone", [0, 2.88, 0.39], 0.18, 0.25, 0.12, basalt, chestBone);
  diamond("heartLowerLock", [0, 2.09, 0.39], 0.17, 0.22, 0.10, paleBasalt, chestBone);

  // Back armor and the three dark chimney-like dorsal crystals.
  plate("backCentralShield", [0, 2.45, -0.34], 1.02, 0.91, 0.25, chestBone);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.31;
    plate(`backColumn${i}`, [x, 2.57, -0.49], 0.23, 0.80, 0.17, chestBone, paleBasalt);
    glow(box(`backVent${i}`, [x, 2.54, -0.585], [0.045, 0.46, 0.025], C.orange, chestBone), 1.3);
    rock(`backChimney${i}`, [x, 2.98, -0.37], [0.15, 0.26, 0.15], basalt, chestBone);
  }

  // Face: a small, stern guardian mask recessed between massive shoulders.
  molten("neckFire", [0, 3.04, 0], [0.22, 0.22, 0.20], neck, C.ember);
  plate("headMainBasalt", [0, 3.32, 0], 0.70, 0.56, 0.48, head, basalt, 0.24);
  plate("faceRecess", [0, 3.28, 0.247], 0.56, 0.32, 0.042, head, C.recess, 0.22);

  for (const s of [1, -1]) {
    const eye = drawing(`furnaceEye${s}`, [s * 0.155, 3.305, 0.279],
      [0.235, 0.093], eyeTex, head, true);
    if (s < 0) eye.mesh.geometry.scale(-1, 1, 1).setIndex(
      eye.mesh.geometry.index
        ? Array.from(eye.mesh.geometry.index.array).reduce<number[]>((a, _, i, arr) => {
            if (i % 3 === 0) a.push(arr[i], arr[i + 2], arr[i + 1]);
            return a;
          }, [])
        : [],
    );

    b.extrude(
      [[0.035, 0.00], [0.29, 0.08], [0.33, 0.19], [0.055, 0.14]],
      {
        at: [0, 3.31, 0.29], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.11, bevel: 0.01, color: paleBasalt, bone: head, name: `brow${s}`,
      },
    );
    b.extrude(
      [[0.235, 0.13], [0.355, 0.17], [0.34, -0.13], [0.19, -0.23], [0.18, -0.08]],
      {
        at: [0, 3.23, 0.23], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.16, bevel: 0.015, color: basalt, bone: head, name: `cheek${s}`,
      },
    );
  }

  diamond("nasalKeystone", [0, 3.25, 0.315], 0.12, 0.24, 0.13, paleBasalt, head);
  plate("upperJaw", [0, 3.155, 0.25], 0.37, 0.095, 0.15, head, basalt);
  glow(box("mouthFurnaceSlit", [0, 3.085, 0.245], [0.30, 0.032, 0.055], C.orange, jaw), 1.3);
  b.extrude(
    [[-0.23, 0.065], [0.23, 0.065], [0.18, -0.08], [0, -0.14], [-0.18, -0.08]],
    {
      at: [0, 3.02, 0.23], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.20, bevel: 0.02, color: paleBasalt, bone: jaw, name: "separateLowerJaw",
    },
  );
  diamond("chinGoldSeal", [0, 2.985, 0.34], 0.085, 0.12, 0.012, C.gold, jaw);

  // An asymmetric-looking but balanced volcanic crown, built from broad blades.
  b.extrude(
    [[-0.16, 0], [0.16, 0], [0.14, 0.26], [0, 0.46], [-0.13, 0.29]],
    {
      at: [0, 3.48, -0.005], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.32, bevel: 0.025, color: basalt, bone: head, name: "crownCentralPeak",
    },
  );
  drawing("crownElementalRune", [0, 3.675, 0.163], [0.12, 0.22], runeTex, head, true);
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.09, 0], [0.12, -0.035], [0.22, 0.30], [0.10, 0.25], [0.035, 0.34]],
      {
        at: [s * 0.25, 3.46, -0.045], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.27, bevel: 0.018, color: paleBasalt, bone: head, name: `crownSidePeak${s}`,
      },
    );
    glow(b.sweep(
      [[s * 0.24, 3.46, 0.10], [s * 0.29, 3.58, 0.10], [s * 0.35, 3.68, 0.10]],
      [0.018, 0.006], { color: C.orange, bone: head, sides: 4, name: `crownVein${s}` },
    ), 1.4);
  }

  for (const limb of limbs) {
    const { s, side, arm, leg, fingers, thumb } = limb;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    const thigh = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;

    // Molten armature is deliberately thinner than the enclosing armor.
    glow(b.sweep(arm, [0.23, 0.18, 0.14], {
      color: C.ember, sides: 6, smooth: false, name: `armatureArm${side}`,
    }), 1.2);
    glow(b.sweep(leg, [0.23, 0.20, 0.18], {
      color: C.ember, sides: 6, smooth: false, name: `armatureLeg${side}`,
    }), 1.2);

    molten(`shoulderJoint${side}`, [s * 0.87, 2.73, 0],
      [0.28, 0.28, 0.27], shoulder);

    // Oversized, layered shoulder mass with a broken mountain silhouette.
    plate(`shoulderMain${side}`, [s * 1.04, 2.82, 0.005],
      0.70, 0.66, 0.70, shoulder, basalt, 0.23);
    b.extrude(
      [[-0.32, 0.12], [0.08, 0.30], [0.36, 0.18], [0.43, -0.13], [0.14, -0.27], [-0.29, -0.16]],
      {
        at: [s * 1.04, 2.89, 0.35], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.17, bevel: 0.028, color: paleBasalt, bone: shoulder,
        name: `shoulderCap${side}`,
      },
    );
    b.extrude(
      [[-0.16, -0.11], [0.20, -0.09], [0.16, 0.30], [-0.02, 0.47], [-0.12, 0.22]],
      {
        at: [s * 0.99, 3.02, -0.10], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.39, bevel: 0.022, color: basalt, bone: shoulder,
        name: `shoulderPeak${side}`,
      },
    );
    rock(`shoulderOuterShard${side}`, [s * 1.35, 2.94, -0.09],
      [0.22, 0.30, 0.24], paleBasalt, shoulder, [0, 0, -s * 24]);
    drawing(`shoulderSigil${side}`, [s * 1.06, 2.91, 0.442],
      [0.18, 0.27], runeTex, shoulder, true);
    drawing(`shoulderFracture${side}`, [s * 1.28, 2.82, 0.443],
      [0.17, 0.25], crackTex, shoulder, true);

    plate(`bicep${side}`, [s * 1.28, 2.56, -0.01],
      0.39, 0.38, 0.48, shoulder, basalt);
    plate(`bicepFront${side}`, [s * 1.31, 2.56, 0.26],
      0.32, 0.30, 0.10, shoulder, paleBasalt);

    molten(`elbowFire${side}`, [s * 1.43, 2.46, 0.015],
      [0.21, 0.205, 0.20], elbow, C.yellow);
    rock(`elbowKnuckle${side}`, [s * 1.44, 2.48, -0.17],
      [0.225, 0.205, 0.18], basalt, elbow);
    plate(`forearmBracer${side}`, [s * 1.69, 2.34, 0.01],
      0.50, 0.48, 0.53, elbow, basalt, 0.24);
    plate(`forearmTopPlate${side}`, [s * 1.67, 2.48, 0.07],
      0.43, 0.22, 0.55, elbow, paleBasalt, 0.20);
    drawing(`bracerRune${side}`, [s * 1.70, 2.34, 0.282],
      [0.14, 0.26], runeTex, elbow, true);
    drawing(`bracerGoldBand${side}`, [s * 1.69, 2.49, 0.352],
      [0.29, 0.055], trimTex, elbow);

    molten(`wristFire${side}`, [s * 1.91, 2.23, 0.02],
      [0.14, 0.16, 0.15], wrist);
    plate(`palm${side}`, [s * 2.07, 2.16, 0.04],
      0.43, 0.30, 0.35, wrist, basalt);
    plate(`handBackPlate${side}`, [s * 2.08, 2.21, -0.13],
      0.34, 0.24, 0.12, wrist, paleBasalt);
    drawing(`palmCrack${side}`, [s * 2.08, 2.17, 0.22],
      [0.24, 0.20], crackTex, wrist, true);

    fingers.forEach(({ chain, points }, i) => {
      glow(b.sweep(chain, [0.068, 0.045], {
        color: C.orange, sides: 5, name: `fingerFire${side}${i}`,
      }), 1.4);
      for (let j = 0; j < 2; j++) {
        const a = points[j];
        const z = points[j + 1];
        const A: P = [a[0], a[1] - 0.012, a[2]];
        const B: P = [
          a[0] + (z[0] - a[0]) * 0.80,
          a[1] + (z[1] - a[1]) * 0.80,
          a[2] + (z[2] - a[2]) * 0.80,
        ];
        b.frustumBox(A, B, [0.115, 0.14], [0.10, 0.12], {
          bone: chain.joints[j], color: j === 0 ? paleBasalt : basalt,
          name: `fingerStone${side}${i}_${j}`,
        });
      }
    });
    glow(b.sweep(thumb, [0.075, 0.045], {
      color: C.orange, sides: 5, name: `thumbFire${side}`,
    }), 1.3);
    for (let i = 0; i < 2; i++) {
      const a = limb.thumbPoints[i];
      const e = limb.thumbPoints[i + 1];
      b.frustumBox(a, [
        a[0] + (e[0] - a[0]) * 0.80,
        a[1] + (e[1] - a[1]) * 0.80,
        a[2] + (e[2] - a[2]) * 0.80,
      ], [0.14, 0.15], [0.11, 0.12], {
        color: basalt, bone: thumb.joints[i], name: `thumbStone${side}${i}`,
      });
    }

    // Short load-bearing legs; wide feet land directly on the caldera.
    plate(`thighMass${side}`, [s * 0.51, 1.23, 0],
      0.47, 0.49, 0.55, thigh, basalt);
    plate(`thighFront${side}`, [s * 0.52, 1.25, 0.29],
      0.39, 0.38, 0.12, thigh, paleBasalt);
    drawing(`thighCrack${side}`, [s * 0.52, 1.25, 0.355],
      [0.26, 0.28], crackTex, thigh, true);

    molten(`kneeFire${side}`, [s * 0.58, 0.96, 0.015],
      [0.22, 0.20, 0.23], knee, C.yellow);
    diamond(`kneecapSocket${side}`, [s * 0.58, 0.96, 0.26],
      0.44, 0.39, 0.16, basalt, knee);
    diamond(`kneecapInlay${side}`, [s * 0.58, 0.96, 0.35],
      0.20, 0.19, 0.025, C.gold, knee);
    glow(diamond(`kneecapCoal${side}`, [s * 0.58, 0.96, 0.37],
      0.085, 0.09, 0.025, C.yellow, knee), 1.1);

    plate(`shinMass${side}`, [s * 0.63, 0.66, 0.035],
      0.50, 0.48, 0.54, knee, basalt);
    plate(`shinShield${side}`, [s * 0.63, 0.67, 0.32],
      0.39, 0.43, 0.13, knee, paleBasalt);
    drawing(`shinSigil${side}`, [s * 0.63, 0.68, 0.39],
      [0.14, 0.25], runeTex, knee, true);
    for (const q of [1, -1]) {
      glow(box(`shinSeam${side}${q}`, [s * 0.63 + q * 0.207, 0.66, 0.30],
        [0.017, 0.28, 0.025], C.orange, knee), 1.25);
    }

    molten(`ankleFire${side}`, [s * 0.64, 0.405, 0.07],
      [0.19, 0.14, 0.21], ankle);
    plate(`footHeel${side}`, [s * 0.64, 0.31, 0.13],
      0.60, 0.25, 0.68, ankle, basalt, 0.18);
    plate(`footUpper${side}`, [s * 0.64, 0.405, 0.20],
      0.48, 0.20, 0.54, ankle, paleBasalt);
    for (let i = 0; i < 3; i++) {
      const x = s * 0.64 + (i - 1) * 0.19;
      plate(`toe${side}${i}`, [x, 0.28, 0.49],
        0.173, 0.19, 0.30, ankle, i === 1 ? paleBasalt : basalt, 0.20);
      if (i < 2) {
        glow(box(`toeSeam${side}${i}`, [x + 0.095, 0.28, 0.48],
          [0.013, 0.09, 0.21], C.orange, ankle), 1.2);
      }
    }
    drawing(`footBand${side}`, [s * 0.64, 0.39, 0.477],
      [0.36, 0.055], trimTex, ankle);
  }

  // Small hot splinters at the shoulders emphasize the scale of the broad plates.
  for (const s of [1, -1]) {
    const bone = limbs.find((l) => l.s === s)!.arm.joints[0];
    for (let i = 0; i < 3; i++) {
      const x = s * (0.84 + i * 0.16);
      const y = 3.105 - i * 0.065;
      glow(b.spike([x, y, -0.28], [s * 0.16, 1, -0.12],
        0.11 + i * 0.025, 0.035,
        { color: C.orange, bone, sides: 4, name: `shoulderEmberShard${s}_${i}` }), 1.3);
    }
  }

  // Broad, geometric flank vents, with gold stone keys rather than mechanical rivets.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      plate(`sideRib${s}_${i}`, [s * 0.64, 2.18 + i * 0.18, -0.035],
        0.40, 0.125, 0.10, chestBone, basalt, 0.12, [0, 0, -s]);
      glow(b.rod(
        [s * 0.683, 2.25 + i * 0.18, -0.18],
        [s * 0.683, 2.25 + i * 0.18, 0.09],
        0.012, { bone: chestBone, color: C.orange, sides: 4, name: `flankFire${s}_${i}` },
      ), 1.2);
    }
  }

  // A few large mineral facets on the rear keep the model considered from every angle.
  for (const s of [1, -1]) {
    plate(`rearHip${s}`, [s * 0.30, 1.47, -0.33], 0.43, 0.35, 0.15, hips);
    const route = catmull([
      [s * 0.23, 2.83, -0.63],
      [s * 0.36, 2.63, -0.63],
      [s * 0.27, 2.45, -0.63],
    ]);
    glow(b.sweep(route, 0.014, {
      color: C.orange, bone: chestBone, sides: 4, name: `rearMoltenFracture${s}`,
    }), 1.2);
  }

  // The ceremonial seal is chipped at its outer edge.
  b.ring(frame([0, 0.16, 0], [0, 1, 0]), { count: 8, radius: 1.66 }, (item) => {
    b.stick(new THREE.OctahedronGeometry(0.055, 0), C.gold, item, {
      bone: hips, embed: 0.65, scale: [1, 0.6, 1], name: `sealKey${item.i}`,
    });
  });

  return b.root;
}

import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  limb,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku — Dream-Eating Tapir Spirit",
  description:
    "A chunky, low-poly baku spirit in an ukiyo-e woodblock palette, with a long tapir trunk, elephant ears, ink-black mane, vermilion seals, and glowing dream vapor.",
};

const INK = "#201728";
const INK_BLUE = "#292641";
const INDIGO = "#39416d";
const DEEP_INDIGO = "#202c58";
const PAPER = "#e8d8ae";
const WARM_PAPER = "#c9a878";
const VERMILION = "#b94732";
const DARK_RED = "#702b35";
const JADE = "#4f9a8d";
const PALE_JADE = "#a8e0c5";
const GOLD = "#d99b4d";
const IVORY = "#f2dfb4";
const NIGHT = "#16172b";

const COAT = paint((_p, n, _s) => {
  if (n.y < -0.38) return WARM_PAPER;
  if (n.y > 0.48) return INDIGO;
  return INK_BLUE;
});

const BODY_COAT = paint((p, n, _s) => {
  if (p.y < 0.74 || n.y < -0.32) return WARM_PAPER;
  if (p.z > -0.34 && p.z < 0.24 && p.y > 0.72) return PAPER;
  if (n.y > 0.52) return INDIGO;
  return INK_BLUE;
});

const LEG_COAT = paint((p, n, _s) => {
  if (p.y < 0.27 || n.y < -0.46) return WARM_PAPER;
  if (n.y > 0.45) return INDIGO;
  return INK_BLUE;
});

const TRUNK_COAT = paint((p, n, _s) => {
  if (p.y < 1.08 || n.y < -0.25) return WARM_PAPER;
  if (n.y > 0.5) return INDIGO;
  return INK_BLUE;
});

const EAR_INNER = paint((_p, n, _s) => (n.z > 0.2 ? VERMILION : DARK_RED));

const DREAM_BLUE = paint((_p, n, _s) => (n.y > 0.25 ? PALE_JADE : JADE));

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 210">
    <defs>
      <radialGradient id="iris" cx="42%" cy="35%" r="70%">
        <stop offset="0" stop-color="#ffe8a6"/>
        <stop offset=".46" stop-color="#d99b4d"/>
        <stop offset="1" stop-color="#6d3040"/>
      </radialGradient>
    </defs>
    <path d="M12 105 Q42 29 112 34 Q151 41 157 105 Q130 170 65 177 Q27 164 12 105Z"
      fill="#201728" stroke="#0d1020" stroke-width="8"/>
    <ellipse cx="91" cy="106" rx="43" ry="61" fill="url(#iris)" stroke="#201728" stroke-width="7"/>
    <ellipse cx="93" cy="111" rx="15" ry="38" fill="#16172b"/>
    <ellipse cx="76" cy="73" rx="16" ry="23" fill="#fff6d3"/>
    <circle cx="111" cy="143" r="8" fill="#fff6d3"/>
    <path d="M18 72 Q60 8 132 30" fill="none" stroke="#201728" stroke-width="12" stroke-linecap="round"/>
    <path d="M22 71 L5 53 M32 51 L20 28" stroke="#201728" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const DREAM_CLOUD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190">
    <path d="M16 143
      C44 111 73 129 91 103
      C107 79 139 78 155 101
      C177 68 225 77 231 111
      C266 95 306 119 301 150
      C291 177 246 177 219 164
      C193 187 151 175 139 153
      C108 180 53 177 16 143Z"
      fill="#e8d8ae" fill-opacity=".92" stroke="#39416d" stroke-width="10"
      stroke-linejoin="round"/>
    <path d="M41 130 C77 91 109 146 136 119 C164 92 193 139 221 119 C245 103 270 128 279 145"
      fill="none" stroke="#b94732" stroke-width="8" stroke-linecap="round"/>
    <path d="M64 153 C97 126 118 167 151 143 C183 119 206 156 242 145"
      fill="none" stroke="#4f9a8d" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">
    <path d="M120 8 L142 46 L185 25 L181 73 L226 81 L188 111
      L216 147 L169 145 L158 191 L124 160 L89 195 L78 148 L28 153
      L57 113 L15 83 L61 73 L56 27 L100 48Z"
      fill="#b94732" stroke="#201728" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="120" cy="112" r="62" fill="#e8d8ae" stroke="#201728" stroke-width="8"/>
    <text x="120" y="139" text-anchor="middle" font-size="92"
      font-family="serif" font-weight="bold" fill="#201728">夢</text>
    <path d="M41 222 Q91 183 145 215 Q175 232 207 211" fill="none"
      stroke="#4f9a8d" stroke-width="10" stroke-linecap="round"/>
    <path d="M36 247 Q89 212 141 239 Q173 256 211 235" fill="none"
      stroke="#39416d" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const SEAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112">
    <rect x="5" y="5" width="86" height="102" rx="7" fill="#b94732" stroke="#201728" stroke-width="7"/>
    <text x="48" y="77" text-anchor="middle" font-family="serif" font-size="63"
      font-weight="bold" fill="#e8d8ae">獏</text>
  </svg>`,
  { size: 256 },
);

function addToe(
  b: ReturnType<typeof createBuilder>,
  name: string,
  foot: THREE.Vector3,
  end: THREE.Vector3,
  parent: any,
) {
  const toe = b.chain(name, [foot, end], {
    parent,
    names: [`${name}Base`, name],
    role: "digit",
  });
  b.sweep(toe, [0.045, 0.018], {
    color: INK,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: `${name}Claw`,
  });
  b.spike(end, end, 0.045, 0.018, {
    color: IVORY,
    caps: { end: "point" },
    name: `${name}Nail`,
  });
  return toe;
}

export default function build() {
  const b = createBuilder({ name: "baku-dream-eater", detail: 1, paintSize: 2048 });

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: a neutral quadruped rest pose, open jaw, extended trunk, tail, toes, and dream ribbons.

  const hips = b.joint("hips", {
    at: [0, 1.0, -0.3],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const torsoPath = catmull([
    [0, 0.98, -0.82],
    [0, 1.02, -0.48],
    [0, 1.06, -0.08],
    [0, 1.09, 0.32],
    [0, 1.13, 0.63],
  ]);

  const torso = b.chain("spine", torsoPath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
    group: "body",
    count: 5,
  });

  const neckPath = catmull([
    [0, 1.08, 0.48],
    [0, 1.25, 0.62],
    [0, 1.43, 0.73],
    [0, 1.56, 0.78],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: torso.tip ?? torso.joints[torso.joints.length - 1],
    names: ["neck1", "neck2", "neck3", "neck4"],
    role: "neck",
    group: "body",
    count: 4,
  });

  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 1.58, 0.8],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 1.02],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const trunkPath = catmull([
    [0, 1.43, 1.06],
    [0, 1.39, 1.23],
    [0, 1.27, 1.45],
    [0, 1.08, 1.66],
    [0, 1.01, 1.88],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: jaw,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"],
    role: "tentacle",
    group: "head",
    count: 5,
  });

  const tailPath = catmull([
    [0, 1.0, -0.73],
    [0, 1.02, -1.02],
    [0, 1.08, -1.28],
    [0, 1.14, -1.47],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: torso.joints[0],
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "body",
    count: 4,
  });

  const legs: Array<{
    side: number;
    front: boolean;
    chain: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
    name: string;
  }> = [];

  for (const side of [1, -1]) {
    for (const front of [false, true]) {
      const z = front ? 0.42 : -0.48;
      const root = new THREE.Vector3(side * 0.31, 0.94, z);
      const foot = new THREE.Vector3(side * 0.39, 0.14, z + (front ? 0.08 : -0.02));
      const name = `${front ? "front" : "hind"}Leg${side > 0 ? "L" : "R"}`;
      const points = limb(root, foot, [0.39, 0.44], [0, 0, front ? 1 : -1]);
      const chain = b.chain(name, points, {
        parent: front ? torso.tip ?? torso.joints[torso.joints.length - 1] : torso.joints[0],
        names: [
          `${name}Hip`,
          `${name}Knee`,
          `${name}Hoof`,
        ],
        role: "leg",
        group: "legs",
        contact: foot,
      });
      legs.push({ side, front, chain, foot, name });
    }
  }

  const toeChains: ReturnType<typeof b.chain>[] = [];
  for (const leg of legs) {
    const side = leg.side;
    const foot = leg.foot;
    const parent = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
    const offsets = [-0.085, 0, 0.085];
    offsets.forEach((dx, i) => {
      const end = new THREE.Vector3(
        foot.x + dx,
        0.12,
        foot.z + 0.15 + (i === 1 ? 0.035 : 0),
      );
      toeChains.push(
        addToe(
          b,
          `${leg.name}Toe${i + 1}`,
          foot.clone().add(new THREE.Vector3(dx * 0.25, 0, 0.02)),
          end,
          parent,
        ),
      );
    });
  }

  const trunkTip = trunk.tip ?? trunk.joints[trunk.joints.length - 1];

  const dreamLeftPath = catmull([
    trunkTip.at,
    [0.18, 1.18, 2.02],
    [0.38, 1.48, 2.11],
    [0.26, 1.79, 2.22],
    [0.04, 1.92, 2.11],
  ]);

  const dreamRightPath = catmull([
    trunkTip.at,
    [-0.18, 1.18, 2.03],
    [-0.4, 1.44, 2.15],
    [-0.3, 1.72, 2.3],
    [-0.05, 1.99, 2.23],
  ]);

  const dreamLeft = b.chain("dreamRibbonL", dreamLeftPath, {
    parent: trunkTip,
    names: ["dreamL1", "dreamL2", "dreamL3", "dreamL4", "dreamLTip"],
    role: "tentacle",
    group: "dream",
    count: 5,
  });

  const dreamRight = b.chain("dreamRibbonR", dreamRightPath, {
    parent: trunkTip,
    names: ["dreamR1", "dreamR2", "dreamR3", "dreamR4", "dreamRTip"],
    role: "tentacle",
    group: "dream",
    count: 5,
  });

  // -----------------------------------------------------------------------------------------------
  // Main sculptural volumes.

  const body = b.sweep(torso, (t) => [
    0.46 - 0.04 * t,
    0.39 - 0.025 * t,
  ], {
    color: BODY_COAT,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "broadTapirBody",
  });

  const neckSweep = b.sweep(neck, (t) => 0.3 - 0.045 * t, {
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "thickNeck",
  });

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    COAT,
    {
      bone: head,
      at: head.at,
      scale: [0.43, 0.38, 0.46],
      group: "head",
      name: "facetedSkull",
      flat: true,
    },
  );

  const upperMuzzle = b.sweep(
    bezier(
      [0, 1.48, 0.97],
      [0, 1.45, 1.12],
      [0, 1.42, 1.28],
      [0, 1.4, 1.38],
    ),
    [0.23, 0.145],
    {
      bone: head,
      color: WARM_PAPER,
      section: { ngon: 8 },
      caps: { start: "round", end: "flat" },
      group: "head",
      name: "creamUpperMuzzle",
    },
  );

  const lowerJaw = b.sweep(
    [jaw.at, [0, 1.31, 1.19], [0, 1.32, 1.37]],
    [0.16, 0.095],
    {
      bone: jaw,
      color: INK_BLUE,
      section: { ngon: 7 },
      caps: { start: "round", end: "flat" },
      group: "head",
      name: "separateLowerJaw",
    },
  );

  const trunkSweep = b.sweep(trunk, (t) => [
    0.16 * (1 - t) + 0.075,
    0.18 * (1 - t) + 0.07,
  ], {
    color: TRUNK_COAT,
    bands: [
      [0.66, TRUNK_COAT],
      [0.79, VERMILION],
      [1, WARM_PAPER],
    ],
    section: { ngon: 8 },
    caps: { start: "round", end: "flat" },
    group: "head",
    name: "longDreamEatingTrunk",
  });

  const nose = b.part(
    new THREE.SphereGeometry(1, 8, 5),
    INK,
    {
      bone: trunkTip,
      at: trunkTip.at,
      scale: [0.105, 0.085, 0.09],
      group: "head",
      name: "velvetNose",
      flat: true,
    },
  );

  for (const side of [1, -1]) {
    b.spike(
      [side * 0.125, 1.36, 1.2],
      [side * 0.17, 1.34, 1.43],
      null,
      0.034,
      {
        bone: jaw,
        color: IVORY,
        caps: { end: "point" },
        group: "head",
        name: `tusk${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // Elephant-like ears: heavy outer silhouettes with vermilion woodblock interiors.
  const earOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0],
    [0.12, 0.035],
    [0.19, 0.19],
    [0.15, 0.36, "sharp"],
    [0.045, 0.44, "sharp"],
    [-0.035, 0.31],
  ];

  const innerEarOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0.025, 0.06],
    [0.095, 0.08],
    [0.135, 0.2],
    [0.105, 0.32, "sharp"],
    [0.04, 0.36, "sharp"],
    [0.005, 0.25],
  ];

  for (const side of [1, -1]) {
    b.extrude(earOutline, {
      at: [side * 0.24, 1.55, 0.76],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      smoothing: 1,
      bone: head,
      color: INK,
      group: "head",
      name: `inkEar${side > 0 ? "L" : "R"}`,
    });

    b.extrude(innerEarOutline, {
      at: [side * 0.242, 1.55, 0.795],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      bone: head,
      color: EAR_INNER,
      group: "head",
      name: `vermilionEar${side > 0 ? "L" : "R"}`,
    });
  }

  // Four sturdy legs with lighter stockings and broad tapir feet.
  for (const leg of legs) {
    const sweep = b.sweep(leg.chain, (t) => [
      0.115 - 0.035 * t,
      0.13 - 0.045 * t,
    ], {
      color: LEG_COAT,
      bands: [
        [0.68, LEG_COAT],
        [0.84, WARM_PAPER],
        [1, INK_BLUE],
      ],
      section: { ngon: 6 },
      caps: "round",
      group: "legs",
      name: `${leg.name}Skin`,
    });

    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      INK,
      {
        bone: leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1],
        at: leg.foot,
        scale: [0.19, 0.105, 0.235],
        group: "legs",
        name: `${leg.name}WideHoof`,
        flat: true,
      },
    );

    const cuff = b.surface(sweep).around(leg.chain.at(0.8).at).at(0, 0);
    if (cuff) {
      b.stick(
        new THREE.CylinderGeometry(0.12, 0.12, 0.018, 8),
        VERMILION,
        cuff,
        {
          embed: 0.4,
          group: "legs",
          name: `${leg.name}RedCuff`,
        },
      );
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Ukiyo-e silhouette details: mane, tail tuft, collar, ink creases, and raised seal marks.

  const maneOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0],
    [0.18, 0.035],
    [0.31, 0.20, "sharp"],
    [0.43, 0.08],
    [0.56, 0.27, "sharp"],
    [0.71, 0.11],
    [0.85, 0.32, "sharp"],
    [0.99, 0.14],
    [1.14, 0.30, "sharp"],
    [1.28, 0.14],
    [1.4, 0.21, "sharp"],
    [1.49, 0.02],
    [1.49, -0.02],
    [0, -0.02],
  ];

  b.extrude(maneOutline, {
    at: [0, 1.32, -0.83],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    smoothing: 0,
    bone: torso.joints[0],
    color: INK,
    group: "silhouette",
    name: "sawtoothInkMane",
  });

  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.105;
    const dorsal = body.at(t, 0, 0.01);
    b.spike(
      dorsal,
      dorsal,
      0.095 + (i % 3) * 0.018,
      0.035,
      {
        color: i % 3 === 1 ? VERMILION : INK,
        caps: { start: "flat", end: "point" },
        group: "silhouette",
        name: `maneQuill${i + 1}`,
      },
    );
  }

  b.spike(
    tail.tip ?? tail.joints[tail.joints.length - 1],
    [0, 0, -1],
    0.19,
    0.065,
    {
      color: INK,
      caps: { start: "round", end: "point" },
      group: "silhouette",
      name: "tailBrush",
    },
  );

  const neckSurface = b.surface(neckSweep);
  const collarPoint = neckSweep.at(0.62, 90, 0.012);
  const collarLoop = neckSurface.loop(collarPoint, {
    dir: neck.at(0.62).tangent,
    lift: 0.012,
  });
  b.sweep(collarLoop, 0.026, {
    color: VERMILION,
    section: { ngon: 6 },
    caps: "none",
    group: "ornament",
    name: "vermilionNeckCollar",
  });

  const collarStuds = collarLoop;
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const p = collarStuds.at(t);
    b.stick(
      new THREE.SphereGeometry(0.034, 6, 4),
      GOLD,
      frame(p, collarStuds.tangentAt(t)),
      {
        embed: 0.35,
        group: "ornament",
        name: `collarStud${i + 1}`,
      },
    );
  }

  // Ink-red raised dots sampled across the visible shoulder, like repeated carved registration marks.
  const bodySurface = b.surface(body);
  const shoulderMarks = bodySurface.scatter(17, {
    rng: rng(37),
    minDist: 0.13,
    filter: (h) => h.n.x > 0.48 && h.n.y > -0.15 && h.at.z > -0.25,
  });

  for (let i = 0; i < shoulderMarks.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.025, 0.025, 0.012, 7),
      i % 4 === 0 ? GOLD : VERMILION,
      shoulderMarks[i],
      {
        embed: 0.45,
        spin: i * 31,
        group: "ornament",
        name: `woodblockMark${i + 1}`,
      },
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Face: decals are placed only after the skull exists, keeping the eyes seated on its faceted surface.

  const headSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(side * 29, 8);
    if (eyeHit) {
      b.decal(headSurface, EYE_TEXTURE, {
        at: eyeHit.at,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.145, 0.18],
        segments: [5, 6],
        lift: 0.008,
        mirror: side > 0,
        group: "face",
        name: `dreamEye${side > 0 ? "L" : "R"}`,
      });

      const browStart = new THREE.Vector3(side * 0.13, 1.76, 1.03);
      const browEnd = new THREE.Vector3(side * 0.28, 1.73, 1.0);
      b.rod(browStart, browEnd, 0.022, {
        bone: head,
        color: INK,
        section: { ngon: 5 },
        caps: "flat",
        group: "face",
        name: `heavyBrow${side > 0 ? "L" : "R"}`,
      });
    }
  }

  // Mouth crease and whiskers, kept as separate graphic strokes.
  b.rod(
    [0, 1.34, 1.29],
    [0, 1.31, 1.43],
    0.012,
    {
      bone: jaw,
      color: INK,
      section: { ngon: 5 },
      caps: "flat",
      group: "face",
      name: "mouthInkCrease",
    },
  );

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base = new THREE.Vector3(
        side * (0.105 + i * 0.018),
        1.39 - i * 0.027,
        1.31 + i * 0.018,
      );
      const end = new THREE.Vector3(
        side * (0.31 + i * 0.018),
        1.41 - i * 0.06,
        1.39 + i * 0.06,
      );
      b.rod(base, end, 0.0055, {
        bone: head,
        color: PAPER,
        section: { ngon: 5 },
        caps: "flat",
        group: "face",
        name: `whisker${side > 0 ? "L" : "R"}_${i + 1}`,
      });
    }
  }

  // -----------------------------------------------------------------------------------------------
  // The dream-eating spirit: two luminous, carved-looking ribbons rising from the trunk.

  const dreamSweepL = b.sweep(dreamLeft, (t) => 0.037 - 0.015 * t, {
    color: DREAM_BLUE,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "dream",
    name: "glowingDreamRibbonL",
  });

  const dreamSweepR = b.sweep(dreamRight, (t) => 0.037 - 0.015 * t, {
    color: DREAM_BLUE,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "dream",
    name: "glowingDreamRibbonR",
  });

  glow(dreamSweepL, 1.15);
  glow(dreamSweepR, 1.15);

  const dreamAccentPathL = catmull([
    [0.03, 1.45, 1.88],
    [0.22, 1.65, 2.04],
    [0.3, 1.84, 2.16],
    [0.1, 1.98, 2.2],
  ]);

  const dreamAccentPathR = catmull([
    [-0.03, 1.45, 1.89],
    [-0.25, 1.63, 2.08],
    [-0.34, 1.83, 2.2],
    [-0.1, 2.02, 2.27],
  ]);

  b.sweep(dreamAccentPathL, 0.009, {
    color: VERMILION,
    caps: { start: "flat", end: "point" },
    group: "dream",
    name: "redDreamStrokeL",
  });

  b.sweep(dreamAccentPathR, 0.009, {
    color: VERMILION,
    caps: { start: "flat", end: "point" },
    group: "dream",
    name: "redDreamStrokeR",
  });

  const vaporCards = [
    { at: [0.24, 1.57, 2.06] as const, size: [0.34, 0.23] as const, name: "cloudCardL1" },
    { at: [0.11, 1.88, 2.18] as const, size: [0.29, 0.19] as const, name: "cloudCardL2" },
    { at: [-0.25, 1.58, 2.1] as const, size: [0.35, 0.24] as const, name: "cloudCardR1" },
    { at: [-0.12, 1.91, 2.23] as const, size: [0.3, 0.2] as const, name: "cloudCardR2" },
  ];

  for (const cloud of vaporCards) {
    const card = b.part(
      new THREE.PlaneGeometry(cloud.size[0], cloud.size[1]),
      PAPER,
      {
        at: cloud.at,
        dir: [0, 0, 1],
        axis: "z",
        texture: DREAM_CLOUD,
        group: "dream",
        name: cloud.name,
      },
    );
    glow(card, 0.75);
  }

  // A small floating seal sits in the vapor, like a spirit's signature stamp.
  const seal = b.part(
    new THREE.PlaneGeometry(0.17, 0.2),
    PAPER,
    {
      at: [0.0, 2.09, 2.17],
      dir: [0, 0, 1],
      axis: "z",
      texture: SEAL,
      group: "dream",
      name: "floatingBakuSeal",
    },
  );
  glow(seal, 0.55);

  // -----------------------------------------------------------------------------------------------
  // The 夢 emblem is pressed into the flank, with a second small paper seal on the rump.

  const flank = bodySurface.around(torso.at(0.47).at).at(90, 4);
  if (flank) {
    b.decal(bodySurface, EMBLEM, {
      at: flank.at,
      dir: flank.n,
      up: [0, 1, 0],
      size: [0.34, 0.4],
      segments: [7, 8],
      lift: 0.006,
      group: "ornament",
      name: "dreamEatingEmblem",
    });
  }

  const rump = bodySurface.around(torso.at(0.12).at).at(-90, 8);
  if (rump) {
    b.decal(bodySurface, SEAL, {
      at: rump.at,
      dir: rump.n,
      up: [0, 1, 0],
      size: [0.12, 0.15],
      segments: [4, 5],
      lift: 0.005,
      group: "ornament",
      name: "rumpSeal",
    });
  }

  // Small jade hooks at the vapor's source emphasize that the trunk is actively drawing dreams in.
  for (const side of [1, -1]) {
    const hookPath = catmull([
      [side * 0.09, 1.08, 1.78],
      [side * 0.16, 1.0, 1.9],
      [side * 0.13, 1.11, 2.0],
    ]);
    b.sweep(hookPath, [0.018, 0.006], {
      color: PALE_JADE,
      caps: { start: "round", end: "point" },
      group: "dream",
      name: `dreamHook${side > 0 ? "L" : "R"}`,
    });
  }

  return b.root;
}

import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  countershade,
  createBuilder,
  gradient,
  grain,
  paint,
  rng,
  scales,
  stripes,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

const INK = "#120b12";
const MOUTH = "#160911";
const CRIMSON = "#8f2028";
const BLOOD = "#c33a2f";
const RUST = "#9b3b2d";
const TALON = "#d3b581";
const BRIGHT_BONE = "#e0bd84";

const BRONZE = metal("bronze", {
  tarnish: 0.46,
  verdigris: 0.14,
  polish: 0.24,
  size: 0.085,
  seed: 19,
});
const OLD_IRON = metal("iron", {
  tarnish: 0.52,
  verdigris: 0.04,
  polish: 0.16,
  size: 0.07,
  seed: 27,
});
const GILT = metal("gilt", {
  tarnish: 0.24,
  polish: 0.45,
  size: 0.06,
  seed: 41,
});

const SCALE_BASE = scales(
  ["#45363a", "#5d4140", "#753d38", "#30252e"],
  "#120e16",
  { size: 0.105, width: 0.13, seed: 7 },
);
const BODY_COAT = countershade(SCALE_BASE, "#21131c", {
  level: -0.1,
  soft: 0.25,
});
const NECK_COAT = stripes(BODY_COAT, [RUST, "#54252b"], {
  size: 0.38,
  axis: "z",
  width: 0.17,
  wobble: 0.18,
  seed: 12,
});
const TAIL_COAT = gradient(
  BODY_COAT,
  "#161018",
  [0, 0.58, -0.34],
  [0, 0.1, -1.86],
);
const MUZZLE_COAT = countershade(
  scales(["#4c393b", "#67433d"], "#20131a", {
    size: 0.075,
    width: 0.12,
    seed: 22,
  }),
  "#24141a",
  { level: -0.05, soft: 0.3 },
);
const BONE = grain("#e0c29a", "#674943", {
  size: 0.035,
  axis: [0, 1, 0],
  seed: 4,
});
const HORN_DARK = grain("#704a42", "#d7b47c", {
  size: 0.028,
  axis: [0, 1, 0],
  seed: 9,
});
const RED_MARKING = paint((p, n, _s) => {
  const diagonal = Math.sin(p.x * 31 + p.y * 8 + p.z * 12);
  return n.z > -0.15 && diagonal > 0.92 ? BLOOD : BRONZE;
});

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 168">
    <path d="M7 85 Q28 18 96 28 Q119 36 125 80 Q103 147 37 150 Q13 132 7 85Z" fill="#100a12" stroke="#050408" stroke-width="7"/>
    <path d="M28 87 Q39 39 89 43 Q106 51 108 82 Q96 126 50 129 Q31 116 28 87Z" fill="#b32b2d"/>
    <path d="M30 89 Q45 46 92 48 Q102 59 103 77 Q78 69 34 105Z" fill="#70202b"/>
    <path d="M32 101 Q61 118 102 88 Q94 121 55 127 Q38 119 32 101Z" fill="#ec7044"/>
    <path d="M61 47 Q80 63 74 116 Q64 132 54 115 Q57 68 61 47Z" fill="#150913"/>
    <path d="M48 58 Q61 45 74 55 Q79 64 69 72 Q53 76 47 67Z" fill="#fff0d0"/>
    <circle cx="86" cy="99" r="8" fill="#fff6e2"/>
    <circle cx="94" cy="67" r="4" fill="#fff6e2"/>
    <path d="M15 31 Q39 4 79 13" fill="none" stroke="#120b12" stroke-width="8" stroke-linecap="round"/>
    <path d="M17 138 Q34 157 51 157" fill="none" stroke="#d13e42" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

const RUNE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M64 7 L79 35 L106 22 L95 54 L120 64 L94 75 L105 106 L77 92 L64 121 L51 92 L23 106 L34 75 L8 64 L34 53 L23 22 L51 35Z"
      fill="none" stroke="#f0c56f" stroke-width="5" stroke-linejoin="bevel"/>
    <path d="M64 24 L69 49 L91 64 L69 79 L64 105 L58 79 L36 64 L58 49Z"
      fill="#8b1e29" stroke="#38111d" stroke-width="3"/>
    <path d="M64 40 L64 87 M44 64 L84 64" stroke="#ffd98a" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const SCAR_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 72">
    <path d="M8 11 L70 61 M42 5 L104 55 M88 10 L153 63 M132 4 L184 50"
      stroke="#281018" stroke-width="14" stroke-linecap="round"/>
    <path d="M8 11 L70 61 M42 5 L104 55 M88 10 L153 63 M132 4 L184 50"
      stroke="#d34237" stroke-width="5" stroke-linecap="round"/>
    <path d="M18 20 L52 48 M102 21 L139 51" stroke="#ffd17b" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <circle cx="80" cy="80" r="73" fill="#21131b" stroke="#d8ae63" stroke-width="6"/>
    <path d="M80 15 L97 57 L143 62 L108 91 L118 137 L80 112 L42 137 L52 91 L17 62 L63 57Z"
      fill="#a3232c" stroke="#f0c77e" stroke-width="4" stroke-linejoin="bevel"/>
    <path d="M80 37 L89 68 L121 72 L96 91 L102 121 L80 104 L58 121 L64 91 L39 72 L71 68Z"
      fill="#e2b65f" stroke="#4c2027" stroke-width="4"/>
    <circle cx="80" cy="80" r="9" fill="#180c13"/>
  </svg>`,
  { size: 256 },
);

const FANG_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <path d="M12 16 Q64 5 116 16 Q92 31 64 25 Q36 31 12 16Z" fill="#d84c38"/>
    <path d="M17 29 Q64 42 111 29 Q90 53 64 48 Q38 53 17 29Z" fill="#f5b15d"/>
    <path d="M27 64 L44 42 L52 83 L64 39 L74 83 L83 42 L101 64 Q64 83 27 64Z"
      fill="#f3dfae" stroke="#25111a" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const MANE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 160">
    <path d="M32 158 Q9 123 22 94 Q4 72 25 48 Q19 26 34 4 Q42 35 56 53 Q43 74 53 96 Q38 126 32 158Z"
      fill="#731d2b" stroke="#210e19" stroke-width="5" stroke-linejoin="round"/>
    <path d="M32 146 Q24 109 36 78 Q28 52 35 22" fill="none" stroke="#cf4a3d" stroke-width="5"/>
    <path d="M18 116 L31 130 M42 104 L35 121" stroke="#f0a04f" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const CREST_OUTLINE: any = [
  [-0.18, 0],
  [0.17, 0],
  [0.15, 0.07],
  [0.1, 0.17],
  [0.035, 0.3, "sharp"],
  [-0.045, 0.19],
  [-0.13, 0.25, "sharp"],
  [-0.16, 0.1],
];

const CHEEK_FIN_OUTLINE: any = [
  [-0.12, -0.08],
  [0.14, -0.04],
  [0.105, 0.04],
  [0.04, 0.18, "sharp"],
  [-0.045, 0.11],
  [-0.14, 0.17, "sharp"],
];

function makeBand(builder: any, joint: any, radius: number, name: string, color: any = BRONZE) {
  const ring = builder.ring(
    joint,
    {
      count: 10,
      radius,
      name: `${name}Ring`,
      role: "fan",
    },
  );
  const path = catmull(ring.items, { closed: true });
  const band = builder.sweep(path, 0.023, {
    color,
    section: { ngon: 6 },
    caps: "none",
    name: `${name}Band`,
  });
  for (let i = 0; i < ring.items.length; i += 2) {
    builder.stick(
      new THREE.SphereGeometry(0.027, 6, 4),
      GILT,
      ring.items[i],
      {
        embed: 0.35,
        name: `${name}Rivet${i}`,
      },
    );
  }
  return band;
}

function buildHead(
  builder: any,
  record: any,
  index: number,
) {
  const head = record.head;
  const jaw = record.jaw;
  const neckTube = record.tube;
  const key = record.key;

  const skull = builder.part(
    new THREE.SphereGeometry(0.3, 12, 8),
    BODY_COAT,
    {
      bone: head,
      at: head.at,
      scale: [1.0, 0.84, 1.16],
      flat: true,
      group: "heads",
      name: `skull${key}`,
    },
  );

  const skullSurface = builder.surface(skull);

  const upperJaw = builder.frustumBox(
    head.local([0, 0.025, -0.045]),
    head.local([0, 0.43, -0.075]),
    [0.22, 0.17],
    [0.145, 0.105],
    {
      bone: head,
      color: MUZZLE_COAT,
      section: { ngon: 6 },
      name: `upperJaw${key}`,
      group: "heads",
    },
  );

  const lowerJaw = builder.frustumBox(
    jaw.local([0, 0.045, 0]),
    jaw.local([0, 0.39, 0]),
    [0.18, 0.12],
    [0.125, 0.085],
    {
      bone: jaw,
      color: MUZZLE_COAT,
      section: { ngon: 6 },
      name: `lowerJaw${key}`,
      group: "heads",
    },
  );

  builder.part(
    new THREE.BoxGeometry(0.17, 0.32, 0.025),
    MOUTH,
    {
      bone: head,
      at: head.local([0, 0.23, -0.08]),
      dir: head.dir([0, 0, 1]),
      flat: true,
      name: `mouthGap${key}`,
      group: "heads",
    },
  );

  const tongue = builder.sweep(
    bezier(
      jaw.local([0, 0.1, 0.035]),
      jaw.local([0, 0.18, 0.05]),
      jaw.local([0, 0.27, 0.01]),
      jaw.local([0, 0.35, -0.015]),
    ),
    0.013,
    {
      bone: jaw,
      color: BLOOD,
      caps: "round",
      section: { ngon: 6 },
      name: `tongue${key}`,
    },
  );
  glow(tongue, 0.65);

  const ember = builder.part(
    new THREE.SphereGeometry(0.024, 7, 5),
    "#e7442c",
    {
      bone: jaw,
      at: jaw.local([0, 0.23, 0.035]),
      flat: true,
      name: `mouthEmber${key}`,
      group: "heads",
    },
  );
  glow(ember, 1.7);

  const nose = builder.part(
    new THREE.SphereGeometry(0.105, 8, 5),
    OLD_IRON,
    {
      bone: head,
      at: head.local([0, 0.47, -0.045]),
      scale: [1.0, 0.7, 0.58],
      flat: true,
      name: `nose${key}`,
      group: "heads",
    },
  );

  for (const side of [-1, 1]) {
    builder.part(
      new THREE.SphereGeometry(0.019, 6, 4),
      INK,
      {
        bone: head,
        at: head.local([side * 0.055, 0.51, -0.005]),
        name: `nostril${key}${side}`,
        group: "heads",
      },
    );
  }

  const upperTeeth = [-0.085, -0.028, 0.03, 0.087];
  for (let i = 0; i < upperTeeth.length; i++) {
    const x = upperTeeth[i];
    const base = head.local([x, 0.34 + (i % 2) * 0.018, -0.085]);
    const tip = head.local([x * 0.9, 0.39 + (i % 2) * 0.018, -0.205]);
    builder.spike(base, tip, null, i === 0 || i === 3 ? 0.025 : 0.019, {
      bone: head,
      color: BONE,
      name: `upperFang${key}${i}`,
      group: "heads",
    });
  }

  const lowerTeeth = [-0.07, 0, 0.07];
  for (let i = 0; i < lowerTeeth.length; i++) {
    const x = lowerTeeth[i];
    const base = jaw.local([x, 0.32 + (i % 2) * 0.018, 0.035]);
    const tip = jaw.local([x, 0.38 + (i % 2) * 0.018, 0.14]);
    builder.spike(base, tip, null, 0.017, {
      bone: jaw,
      color: BRIGHT_BONE,
      name: `lowerFang${key}${i}`,
      group: "heads",
    });
  }

  for (const eyeSide of [-1, 1]) {
    const eyeHit = skullSurface.nearest(
      head.local([-eyeSide * 0.145, 0.15, 0.07]),
    );
    const eye = builder.decal(skull, EYE_TEXTURE, {
      at: eyeHit,
      size: [0.12, 0.155],
      segments: 9,
      lift: 0.003,
      mirror: eyeSide > 0,
      up: [0, 1, 0],
      name: `eye${key}${eyeSide}`,
      group: "face",
    });
    glow(eye, 2.25);

    builder.rod(
      head.local([-eyeSide * 0.2, 0.14, 0.16]),
      head.local([-eyeSide * 0.025, 0.185, 0.19]),
      0.021,
      {
        color: OLD_IRON,
        bone: head,
        name: `brow${key}${eyeSide}`,
        group: "face",
      },
    );

    builder.extrude(CHEEK_FIN_OUTLINE, {
      at: head.local([-eyeSide * 0.205, -0.035, 0.02]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.021,
      bevel: 0.004,
      smoothing: 1,
      color: RED_MARKING,
      bone: head,
      name: `cheekFin${key}${eyeSide}`,
      group: "heads",
    });
  }

  const browPlate = builder.part(
    new THREE.BoxGeometry(0.26, 0.055, 0.22),
    BRONZE,
    {
      bone: head,
      at: head.local([0, 0.105, 0.17]),
      dir: head.dir([0, 0, 1]),
      flat: true,
      name: `foreheadPlate${key}`,
      group: "armor",
    },
  );

  const rune = builder.decal(browPlate, RUNE_TEXTURE, {
    at: head.local([0, 0.14, 0.17]),
    dir: head.dir([0, 0, 1]),
    up: [0, 1, 0],
    size: [0.11, 0.12],
    segments: 6,
    lift: 0.002,
    name: `foreheadRune${key}`,
    group: "runes",
  });
  glow(rune, 0.55);

  builder.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.135, 0.025],
      [0.095, 0.09],
      [0.055, 0.14],
      [0, 0.17],
    ],
    {
      at: head.local([0, -0.06, 0.22]),
      axis: [0, 1, 0],
      segments: 8,
      smoothing: 0,
      color: BRONZE,
      bone: head,
      name: `crownCap${key}`,
      group: "armor",
    },
  );

  builder.extrude(CREST_OUTLINE, {
    at: head.local([0, -0.115, 0.2]),
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.035, 0.018],
    bevel: 0.004,
    smoothing: 1,
    color: HORN_DARK,
    bone: head,
    name: `crownCrest${key}`,
    group: "heads",
  });

  for (const hornSide of [-1, 1]) {
    const base = head.local([hornSide * 0.145, -0.03, 0.2]);
    const controlA = head.local([hornSide * 0.22, -0.13, 0.34]);
    const controlB = head.local([hornSide * 0.2, -0.3, 0.43]);
    const tip = head.local([hornSide * 0.065, -0.48, 0.39]);

    const horn = builder.sprout(
      `horn${key}${hornSide}`,
      skullSurface.nearest(base),
      bezier(base, controlA, controlB, tip),
      [0.057, 0.007],
      {
        count: 0,
        color: HORN_DARK,
        caps: { start: "flat", end: "point" },
        bands: [
          [0.47, BRONZE],
          [0.53, HORN_DARK],
          [0.76, BRONZE],
          [0.81, HORN_DARK],
        ],
        group: "horns",
      },
    );

    builder.along(horn.sweep, 3, (at: any) => {
      builder.stick(
        new THREE.SphereGeometry(0.014, 6, 4),
        GILT,
        at,
        {
          embed: 0.3,
          name: `hornStud${key}${hornSide}${at.t.toFixed(2)}`,
          group: "horns",
        },
      );
    });
  }

  const neckSurface = builder.surface(neckTube);
  const neckScar = neckSurface.around(head.at).at(0, 8);
  if (neckScar) {
    const scar = builder.decal(neckTube, SCAR_TEXTURE, {
      at: neckScar,
      size: [0.24, 0.1],
      segments: 7,
      lift: 0.004,
      mirror: index % 2 === 0,
      name: `neckScar${key}`,
      group: "scars",
    });
    glow(scar, 0.35);
  }

  const skullScales = skullSurface.scatter(7, {
    rng: rng(900 + index),
    minDist: 0.065,
    filter: (h: any) => h.n.y > -0.2 && h.n.z < 0.55,
  });
  for (let i = 0; i < skullScales.length; i++) {
    builder.stick(
      new THREE.ConeGeometry(0.034, 0.018, 6),
      BRONZE,
      skullScales[i],
      {
        embed: 0.48,
        spin: i * 41,
        name: `headScale${key}${i}`,
        group: "armor",
      },
    );
  }

  const jawScales = builder.surface(lowerJaw).scatter(3, {
    rng: rng(950 + index),
    minDist: 0.06,
    filter: (h: any) => h.n.y > -0.4,
  });
  for (let i = 0; i < jawScales.length; i++) {
    builder.stick(
      new THREE.CylinderGeometry(0.027, 0.035, 0.015, 6),
      OLD_IRON,
      jawScales[i],
      {
        embed: 0.35,
        spin: i * 33,
        name: `jawPlate${key}${i}`,
        group: "armor",
      },
    );
  }

  builder.along(neckTube, 5, (at: any) => {
    const length = 0.11 + 0.035 * (1 - at.t);
    builder.spike(at, at, length, 0.031, {
      color: BONE,
      caps: "point",
      name: `neckSpine${key}${Math.round(at.t * 100)}`,
      group: "spines",
    });
  });

  makeBand(builder, record.neck.joints[1], 0.19, `neckCollarA${key}`);
  makeBand(builder, record.neck.joints[2], 0.16, `neckCollarB${key}`, OLD_IRON);

  const fangMark = builder.decal(upperJaw, FANG_TEXTURE, {
    at: head.local([0, 0.385, -0.055]),
    dir: head.dir([0, 0, 1]),
    up: [0, 1, 0],
    size: [0.12, 0.09],
    segments: 6,
    lift: 0.003,
    name: `fangMark${key}`,
    group: "runes",
  });
  glow(fangMark, 0.4);
}

export default function build() {
  const builder = createBuilder({
    name: "five-headed-hydra",
    detail: 1,
    paintSize: 2048,
  });

  const pelvis = builder.joint("pelvis", {
    at: [0, 0.63, -0.48],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.63, -0.48],
    [0, 0.66, -0.2],
    [0, 0.73, 0.1],
    [0, 0.8, 0.34],
    [0, 0.84, 0.5],
  ]);

  const spine = builder.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spine1", "spine2", "chest", "shoulders", "collar"],
    role: "spine",
    group: "body",
  });

  const tailPath = catmull([
    [0, 0.63, -0.48],
    [0, 0.58, -0.77],
    [0, 0.49, -1.08],
    [0, 0.34, -1.43],
    [0, 0.17, -1.76],
    [0, 0.1, -1.94],
  ]);

  const tail = builder.chain("tail", tailPath, {
    parent: pelvis,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    group: "body",
  });

  const collar = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neckData = [
    {
      key: "C",
      points: [
        [0, 0.8, 0.27],
        [0, 1.13, 0.49],
        [0, 1.55, 0.69],
        [0, 1.93, 0.89],
      ],
      head: [0, 2.07, 1.04],
      dir: [0, 0.045, 1],
    },
    {
      key: "IL",
      points: [
        [0.2, 0.79, 0.22],
        [0.34, 1.12, 0.44],
        [0.47, 1.5, 0.67],
        [0.52, 1.84, 0.88],
      ],
      head: [0.54, 1.97, 1.03],
      dir: [0.09, 0.04, 1],
    },
    {
      key: "IR",
      points: [
        [-0.2, 0.79, 0.22],
        [-0.34, 1.12, 0.44],
        [-0.47, 1.5, 0.67],
        [-0.52, 1.84, 0.88],
      ],
      head: [-0.54, 1.97, 1.03],
      dir: [-0.09, 0.04, 1],
    },
    {
      key: "OL",
      points: [
        [0.31, 0.78, 0.1],
        [0.66, 1.0, 0.27],
        [0.91, 1.29, 0.48],
        [1.02, 1.57, 0.69],
      ],
      head: [1.06, 1.72, 0.86],
      dir: [0.18, 0.035, 1],
    },
    {
      key: "OR",
      points: [
        [-0.31, 0.78, 0.1],
        [-0.66, 1.0, 0.27],
        [-0.91, 1.29, 0.48],
        [-1.02, 1.57, 0.69],
      ],
      head: [-1.06, 1.72, 0.86],
      dir: [-0.18, 0.035, 1],
    },
  ];

  const neckRecords: any[] = [];

  for (const data of neckData) {
    const neck = builder.chain(
      `neck${data.key}`,
      catmull(data.points),
      {
        parent: collar,
        names: [
          `neck${data.key}1`,
          `neck${data.key}2`,
          `neck${data.key}3`,
          `neck${data.key}4`,
        ],
        role: "neck",
        group: "necks",
      },
    );

    const neckTip = neck.joints[neck.joints.length - 1];
    const head = builder.joint(`head${data.key}`, {
      parent: neckTip,
      at: data.head,
      dir: data.dir,
      role: "head",
      group: "heads",
    });

    const jaw = builder.joint(`jaw${data.key}`, {
      parent: head,
      at: head.local({ forward: 0.055, down: 0.12 }),
      dir: head.dir([0, 0, 1]),
      role: "jaw",
      group: "heads",
    });

    neckRecords.push({
      ...data,
      neck,
      head,
      jaw,
    });
  }

  for (const record of neckRecords) {
    builder.pose(record.jaw, {
      axis: record.head.dir([1, 0, 0]),
      deg: record.key === "C" ? 21 : 17,
    });
  }

  const armLPath = catmull([
    [0.31, 0.72, 0.29],
    [0.45, 0.46, 0.36],
    [0.52, 0.14, 0.46],
  ]);
  const armRPath = catmull([
    [-0.31, 0.72, 0.29],
    [-0.45, 0.46, 0.36],
    [-0.52, 0.14, 0.46],
  ]);

  const armL = builder.chain("armL", armLPath, {
    parent: collar,
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
    group: "limbs",
  });
  const armR = builder.chain("armR", armRPath, {
    parent: collar,
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
    group: "limbs",
  });

  const bodySweep = builder.sweep(spine, (t: number) => 0.39 - 0.045 * t, {
    color: BODY_COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "mainBody",
    group: "body",
  });

  const tailSweep = builder.sweep(
    tail,
    (t: number) => 0.32 * (1 - t) + 0.028,
    {
      color: TAIL_COAT,
      section: { ngon: 8 },
      caps: "round",
      name: "tail",
      group: "body",
    },
  );

  for (const record of neckRecords) {
    record.tube = builder.sweep(
      record.neck,
      (t: number) => 0.235 * (1 - t) + 0.125,
      {
        color: NECK_COAT,
        section: { ngon: 8 },
        caps: "round",
        name: `neck${record.key}Tube`,
        group: "necks",
      },
    );
  }

  const armTubeL = builder.sweep(armL, (t: number) => 0.105 - 0.035 * t, {
    color: BODY_COAT,
    section: { ngon: 7 },
    caps: "round",
    name: "armLTube",
    group: "limbs",
  });
  const armTubeR = builder.sweep(armR, (t: number) => 0.105 - 0.035 * t, {
    color: BODY_COAT,
    section: { ngon: 7 },
    caps: "round",
    name: "armRTube",
    group: "limbs",
  });

  const dorsalFin = catmull([
    [0, 0.95, -0.43],
    [0, 1.05, -0.13],
    [0, 1.14, 0.17],
    [0, 1.2, 0.45],
  ]);
  builder.membrane(
    bodySweep.line(0, 0.008).slice(0.04, 0.95),
    dorsalFin,
    {
      color: CRIMSON,
      thickness: 0.024,
      rows: 5,
      cols: 14,
      scallop: 0.14,
      bone: collar,
      name: "dorsalBloodFin",
      group: "fins",
    },
  );

  const tailFin = catmull([
    [0, 0.78, -0.5],
    [0, 0.72, -0.86],
    [0, 0.58, -1.22],
    [0, 0.39, -1.59],
  ]);
  builder.membrane(
    tailSweep.line(0, 0.007).slice(0.08, 0.86),
    tailFin,
    {
      color: "#68202b",
      thickness: 0.018,
      rows: 4,
      cols: 12,
      scallop: 0.2,
      bone: pelvis,
      name: "tailBloodFin",
      group: "fins",
    },
  );

  builder.along(bodySweep, 11, (at: any) => {
    const len = 0.13 + 0.06 * Math.sin(at.t * Math.PI);
    builder.spike(at, at, len, 0.039, {
      color: BONE,
      caps: "point",
      name: `bodySpine${Math.round(at.t * 100)}`,
      group: "spines",
    });
  });

  builder.along(tailSweep, 10, (at: any) => {
    const len = 0.11 * (1 - at.t) + 0.035;
    builder.spike(at, at, len, 0.027 * (1 - at.t) + 0.008, {
      color: HORN_DARK,
      caps: "point",
      name: `tailSpine${Math.round(at.t * 100)}`,
      group: "spines",
    });
  });

  for (const record of neckRecords) {
    builder.along(record.tube, 4, (at: any) => {
      builder.spike(at, at, 0.095 - 0.025 * at.t, 0.028, {
        color: BONE,
        caps: "point",
        name: `neckRidge${record.key}${Math.round(at.t * 100)}`,
        group: "spines",
      });
    });
  }

  makeBand(builder, spine.joints[1], 0.38, "torsoGirth");
  makeBand(builder, spine.joints[2], 0.34, "chestGirth", OLD_IRON);

  const bodySurface = builder.surface([bodySweep, tailSweep]);

  const chestHit = bodySurface.around(collar.at).at(0, 18);
  if (chestHit) {
    const chestPlate = builder.stick(
      new THREE.CylinderGeometry(0.17, 0.17, 0.042, 8),
      BRONZE,
      chestHit,
      {
        embed: 0.2,
        spin: 22,
        name: "hydraChestPlate",
        group: "armor",
      },
    );

    const emblem = builder.decal(chestPlate, EMBLEM_TEXTURE, {
      at: chestHit.moved([0, 0.035, 0]),
      dir: chestHit.n,
      up: [0, 1, 0],
      size: [0.22, 0.22],
      segments: 8,
      lift: 0.002,
      name: "hydraEmblem",
      group: "runes",
    });
    glow(emblem, 0.65);
  }

  const sideArmorHits = [
    [1, -0.27, "L1"],
    [1, 0.08, "L2"],
    [-1, -0.27, "R1"],
    [-1, 0.08, "R2"],
  ];
  for (const [side, z, label] of sideArmorHits as any[]) {
    const hit = bodySurface.around([0, 0.7, z]).at(side * 90, 13);
    if (!hit) continue;

    const plate = builder.stick(
      new THREE.BoxGeometry(0.24, 0.045, 0.2),
      OLD_IRON,
      hit,
      {
        embed: 0.25,
        spin: side * 13,
        name: `ribPlate${label}`,
        group: "armor",
      },
    );

    const rune = builder.decal(plate, RUNE_TEXTURE, {
      at: hit.moved([0, 0.038, 0]),
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.12, 0.105],
      segments: 6,
      lift: 0.002,
      mirror: side < 0,
      name: `ribRune${label}`,
      group: "runes",
    });
    glow(rune, 0.42);
  }

  const scaleHits = bodySurface.scatter(42, {
    rng: rng(120),
    minDist: 0.095,
    filter: (h: any) => h.n.y > -0.34,
  });
  for (let i = 0; i < scaleHits.length; i++) {
    builder.stick(
      new THREE.ConeGeometry(0.043, 0.018, 6),
      BRONZE,
      scaleHits[i],
      {
        embed: 0.45,
        spin: (i * 47) % 360,
        name: `bodyScale${i}`,
        group: "scales",
      },
    );
  }

  const scarLocations = [
    [1, -0.38, 12],
    [-1, -0.38, 192],
    [1, 0.05, -10],
    [-1, 0.05, 170],
    [1, 0.38, 20],
    [-1, 0.38, 160],
  ];
  for (let i = 0; i < scarLocations.length; i++) {
    const [side, z, spin] = scarLocations[i] as number[];
    const hit = bodySurface.around([0, 0.67, z]).at(side * 90, 8);
    if (!hit) continue;
    const scar = builder.decal([bodySweep, tailSweep], SCAR_TEXTURE, {
      at: hit,
      size: [0.26, 0.105],
      segments: 7,
      lift: 0.004,
      roll: spin,
      mirror: side < 0,
      name: `bodyScar${i}`,
      group: "scars",
    });
    glow(scar, 0.3);
  }

  const maneSurface = builder.surface(neckRecords.map((r) => r.tube));
  const maneHits = maneSurface.scatter(64, {
    rng: rng(203),
    minDist: 0.095,
    filter: (h: any) => h.n.y > -0.18 && h.n.z < 0.65,
  });
  builder.cards(maneHits, MANE_TEXTURE, {
    size: [0.045, 0.16],
    lean: 48,
    bend: 24,
    vary: 0.25,
    sink: 0.12,
    flow: [0, -0.18, -1],
    color: "#8b2b32",
    rng: rng(204),
    cross: true,
    group: "manes",
  });

  const handL = armL.tip ?? armL.joints[armL.joints.length - 1];
  const handR = armR.tip ?? armR.joints[armR.joints.length - 1];

  for (const [hand, side, label] of [
    [handL, 1, "L"],
    [handR, -1, "R"],
  ] as any[]) {
    builder.part(
      new THREE.SphereGeometry(0.105, 8, 6),
      BODY_COAT,
      {
        bone: hand,
        at: hand.at,
        scale: [1.0, 0.72, 1.12],
        flat: true,
        name: `clawHand${label}`,
        group: "limbs",
      },
    );

    makeBand(builder, hand, 0.09, `wrist${label}`, BRONZE);

    for (let i = 0; i < 3; i++) {
      const localX = (i - 1) * 0.052;
      const base = hand.local([localX, 0.04, -0.01]);
      const tip = hand.local([localX * 1.1, 0.16, -0.06]);
      builder.spike(base, tip, null, 0.023, {
        bone: hand,
        color: TALON,
        caps: "point",
        name: `claw${label}${i}`,
        group: "limbs",
      });
    }
  }

  for (let i = 0; i < neckRecords.length; i++) {
    buildHead(builder, neckRecords[i], i);
  }

  const shoulderL = builder.surface(armTubeL).around(armL.joints[1].at).at(90, 15);
  const shoulderR = builder.surface(armTubeR).around(armR.joints[1].at).at(-90, 15);

  if (shoulderL) {
    builder.stick(
      new THREE.SphereGeometry(0.14, 8, 5),
      BRONZE,
      shoulderL,
      {
        embed: 0.38,
        scale: [1.2, 0.48, 1.05],
        name: "shoulderArmorL",
        group: "armor",
      },
    );
  }
  if (shoulderR) {
    builder.stick(
      new THREE.SphereGeometry(0.14, 8, 5),
      BRONZE,
      shoulderR,
      {
        embed: 0.38,
        scale: [1.2, 0.48, 1.05],
        name: "shoulderArmorR",
        group: "armor",
      },
    );
  }

  const forearmSurfaceL = builder.surface(armTubeL);
  const forearmSurfaceR = builder.surface(armTubeR);
  const forearmHits = [
    forearmSurfaceL.around(armL.joints[1].at).at(90, -8),
    forearmSurfaceR.around(armR.joints[1].at).at(-90, -8),
  ];
  for (let i = 0; i < forearmHits.length; i++) {
    const hit = forearmHits[i];
    if (!hit) continue;
    builder.stick(
      new THREE.CylinderGeometry(0.105, 0.11, 0.045, 7),
      OLD_IRON,
      hit,
      {
        embed: 0.25,
        spin: i * 18,
        name: `forearmGuard${i === 0 ? "L" : "R"}`,
        group: "armor",
      },
    );
  }

  const tailCap = tailSweep.at(1, 0);
  builder.spike(tailCap, tailCap, 0.11, 0.025, {
    color: BONE,
    caps: "point",
    name: "tailTipSpike",
    group: "spines",
  });

  return builder.root;
}

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal five-headed hydra with armored serpentine coils, open jaws, glowing ember eyes, bone horns, crimson fins, bronze war plates, scars, and a ragged mane.",
};

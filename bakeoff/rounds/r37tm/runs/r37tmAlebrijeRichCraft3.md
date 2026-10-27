```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Oaxacan Alebrije Jaguar-Eagle",
  description:
    "A brightly painted wooden alebrije combining the muscular spotted body of a jaguar with an eagle's beak, crest, talons, and huge patterned wings.",
};

const GOLD = "#d88b22";
const GOLD_DARK = "#8e351e";
const TURQUOISE = "#20b7ad";
const TURQUOISE_DARK = "#075b68";
const MAGENTA = "#d93672";
const MAGENTA_DARK = "#731b58";
const SUN = "#f4c94c";
const CREAM = "#f6e1a5";
const BEAK = "#e87927";
const BEAK_DARK = "#7b241d";
const FEATHER = "#2874bb";
const FEATHER_DARK = "#172b78";
const PURPLE = "#753b9a";
const CLAW = "#efe0a8";
const WOOD_INK = "#2a1425";

const coat = countershade(
  stripes(
    spots(GOLD, [MAGENTA, PURPLE, "#3d237b"], {
      size: 0.16,
      amount: 0.7,
      rosette: true,
      seed: 17,
    }),
    [MAGENTA, TURQUOISE_DARK],
    { size: 0.42, width: 0.16, wobble: 0.35, seed: 9 },
  ),
  furEdge(CREAM, GOLD_DARK, {
    axis: [0, 1, 0],
    by: "normal",
    level: -0.18,
    teeth: 0.18,
    period: 0.055,
    along: [0, 0, 1],
    ink: WOOD_INK,
    inkWidth: 0.025,
  }),
  { level: -0.1, soft: 0.3 },
);

const belly = cel(CREAM, "#bf754d", { threshold: 0.18 });
const wingPaint = countershade(
  stripes(
    spots(TURQUOISE, [MAGENTA, SUN, PURPLE], {
      size: 0.13,
      amount: 0.8,
      rosette: false,
      seed: 31,
    }),
    [FEATHER, MAGENTA],
    { size: 0.24, width: 0.3, wobble: 0.22, seed: 14 },
  ),
  TURQUOISE_DARK,
  { level: -0.1, soft: 0.25 },
);
const featherPaint = cel(FEATHER, FEATHER_DARK);
const purplePaint = cel(PURPLE, "#32165b");
const beakPaint = cel(BEAK, BEAK_DARK);
const sunPaint = cel(SUN, "#b5682b");

const EYE = animeEye({
  iris: "#24d6c4",
  irisLight: "#effff0",
  irisDark: "#103e73",
  blush: "#ee4778",
  brow: true,
  size: 384,
});

const featherMark = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <path d="M32 2 C12 25 7 65 18 101 C23 116 28 123 32 126 C36 123 41 116 46 101 C57 65 52 25 32 2Z"
      fill="#f7d451" stroke="#241448" stroke-width="5"/>
    <path d="M32 11 L32 119" stroke="#d52f73" stroke-width="6"/>
    <path d="M18 39 Q32 29 46 39 M14 62 Q32 52 50 62 M15 85 Q32 75 49 85"
      fill="none" stroke="#1bb9ae" stroke-width="5"/>
    <circle cx="32" cy="19" r="5" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const eyeStripe = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <path d="M4 20 Q25 3 50 20 Q75 37 96 20" fill="none" stroke="#25122d" stroke-width="8"/>
    <path d="M8 20 Q27 7 49 20 Q72 33 92 20" fill="none" stroke="#f1c640" stroke-width="3"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ------------------------------------------------------------------------------------------
  // Skeleton first: one rooted jaguar spine, four legs, a tail, eagle neck and two broad wings.
  // ------------------------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.96, -0.16], role: "spine" });

  const body = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.5],
      [0, 1.05, -0.22],
      [0, 1.08, 0.12],
      [0, 1.13, 0.39],
      [0, 1.26, 0.58],
    ]),
    {
      parent: hips,
      names: ["rump", "back", "midSpine", "shoulders", "chest"],
      role: "spine",
      count: 5,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.24, 0.53],
      [0, 1.42, 0.61],
      [0, 1.61, 0.69],
      [0, 1.75, 0.76],
    ]),
    {
      parent: body.tip,
      names: ["neckBase", "neckMid", "neckTop", "neckTip"],
      role: "neck",
      count: 4,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.79, 0.78],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.735, 0.88],
    dir: [0, -0.1, 1],
    role: "jaw",
    group: "head",
  });

  const legSpecs = [
    { side: 1, z: -0.31, tag: "HL", root: [0.29, 1.01, -0.31] as [number, number, number], target: [0.46, 0.11, -0.42] as [number, number, number], bend: [0, 0, 1] as [number, number, number] },
    { side: -1, z: -0.31, tag: "HR", root: [-0.29, 1.01, -0.31] as [number, number, number], target: [-0.46, 0.11, -0.42] as [number, number, number], bend: [0, 0, 1] as [number, number, number] },
    { side: 1, z: 0.38, tag: "FL", root: [0.31, 1.12, 0.38] as [number, number, number], target: [0.48, 0.11, 0.43] as [number, number, number], bend: [0, 0, -1] as [number, number, number] },
    { side: -1, z: 0.38, tag: "FR", root: [-0.31, 1.12, 0.38] as [number, number, number], target: [-0.48, 0.11, 0.43] as [number, number, number], bend: [0, 0, -1] as [number, number, number] },
  ];

  const legs = legSpecs.map((l) => {
    const pts = limb(l.root, l.target, [0.36, 0.31, 0.22], [l.bend, l.bend], {
      sole: [0, 1, 0],
    });
    return {
      ...l,
      chain: b.chain(`leg${l.tag}`, pts, {
        parent: hips,
        names: [`hip${l.tag}`, `knee${l.tag}`, `hock${l.tag}`, `paw${l.tag}`],
        role: "leg",
        count: 4,
        contact: l.target,
      }),
    };
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.48],
      [0, 0.91, -0.78],
      [0.02, 0.92, -1.08],
      [0.08, 1.03, -1.35],
      [0.16, 1.18, -1.53],
      [0.28, 1.31, -1.64],
    ]),
    {
      parent: hips,
      names: ["tail0", "tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      count: 6,
    },
  );

  const wingChains: {
    side: number;
    upper: ReturnType<typeof b.chain>;
    lower: ReturnType<typeof b.chain>;
  }[] = [];

  for (const side of [1, -1]) {
    const upperPts = [
      [side * 0.31, 1.38, 0.38],
      [side * 0.55, 1.58, 0.29],
      [side * 0.88, 1.78, 0.12],
      [side * 1.18, 1.91, -0.04],
      [side * 1.43, 1.89, -0.12],
    ] as [number, number, number][];

    const lowerPts = [
      [side * 0.32, 1.27, 0.29],
      [side * 0.57, 1.39, 0.12],
      [side * 0.9, 1.51, -0.05],
      [side * 1.2, 1.53, -0.22],
      [side * 1.43, 1.48, -0.28],
    ] as [number, number, number][];

    const upper = b.chain(`wing${side > 0 ? "L" : "R"}A`, upperPts, {
      parent: body.joints[3],
      names: [`wingRoot${side > 0 ? "L" : "R"}`, `wingArm${side > 0 ? "L" : "R"}`, `wingElbow${side > 0 ? "L" : "R"}`, `wingWrist${side > 0 ? "L" : "R"}`, `wingTip${side > 0 ? "L" : "R"}`],
      role: "wing",
      count: 5,
    });

    const lower = b.chain(`wing${side > 0 ? "L" : "R"}B`, lowerPts, {
      parent: body.joints[3],
      names: [`wingLowerRoot${side > 0 ? "L" : "R"}`, `wingLowerArm${side > 0 ? "L" : "R"}`, `wingLowerElbow${side > 0 ? "L" : "R"}`, `wingLowerWrist${side > 0 ? "L" : "R"}`, `wingLowerTip${side > 0 ? "L" : "R"}`],
      role: "wing",
      count: 5,
    });

    wingChains.push({ side, upper, lower });
  }

  // ------------------------------------------------------------------------------------------
  // Continuous low-poly wooden forms.
  // ------------------------------------------------------------------------------------------

  const bodyTube = b.sweep(body, (t) => 0.29 - 0.045 * t, {
    color: coat,
    sides: 8,
    smooth: false,
    section: "circle",
    caps: "round",
    group: "painted wood",
    name: "faceted jaguar torso",
  });

  b.sweep(neck, [0.22, 0.19], {
    color: coat,
    sides: 8,
    smooth: false,
    caps: "round",
    group: "painted wood",
    name: "striped eagle neck",
  });

  for (const l of legs) {
    b.sweep(l.chain, (t) => (t < 0.5 ? 0.105 : 0.075), {
      color: coat,
      sides: 7,
      smooth: false,
      caps: "round",
      group: "painted wood",
      name: `chunky ${l.tag} leg`,
    });
    b.part(new THREE.SphereGeometry(0.105, 8, 5), belly, {
      bone: l.chain.tip,
      at: l.target,
      scale: [1.15, 0.55, 1.25],
      group: "paws",
      name: `${l.tag} paw`,
    });

    for (let i = 0; i < 3; i++) {
      const x = l.target[0] + l.side * (i - 1) * 0.055;
      const z = l.target[2] + 0.075;
      b.spike(
        [x, 0.105, z],
        [0, -0.18, 1],
        0.11,
        0.025,
        {
          color: CLAW,
          bone: l.chain.tip,
          caps: { start: "round", end: "point" },
          name: `${l.tag} curved talon ${i}`,
        },
      );
    }
  }

  b.sweep(tail, (t) => 0.15 * (1 - t) + 0.025, {
    color: stripes(coat, [TURQUOISE, SUN, MAGENTA], {
      size: 0.18,
      width: 0.3,
      wobble: 0.15,
      seed: 88,
    }),
    sides: 7,
    caps: { start: "round", end: "point" },
    group: "painted wood",
    name: "curling painted tail",
  });

  for (const wing of wingChains) {
    b.sweep(wing.upper, (t) => 0.12 - t * 0.08, {
      color: wingPaint,
      sides: 6,
      smooth: false,
      caps: "round",
      name: `${wing.side > 0 ? "left" : "right"} wing bone`,
    });
    b.sweep(wing.lower, (t) => 0.09 - t * 0.06, {
      color: wingPaint,
      sides: 6,
      smooth: false,
      caps: "round",
      name: `${wing.side > 0 ? "left" : "right"} wing trailing edge`,
    });
    b.membrane(wing.upper, wing.lower, {
      color: wingPaint,
      thickness: 0.025,
      rows: 4,
      cols: 10,
      scallop: 0.16,
      name: `${wing.side > 0 ? "left" : "right"} turquoise wing membrane`,
    });
  }

  // ------------------------------------------------------------------------------------------
  // Face: settle the skull, muzzle, beak, eyes, ears, crest, and open lower jaw.
  // ------------------------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(0.225, 12, 8), coat, {
    bone: head,
    at: head.at,
    scale: [1.0, 1.1, 1.16],
    flat: true,
    group: "face",
    name: "painted eagle-jaguar skull",
  });

  const forehead = b.part(new THREE.SphereGeometry(0.145, 9, 6), belly, {
    bone: head,
    at: head.local({ forward: 0.16, up: -0.015 }),
    scale: [1.0, 0.72, 0.72],
    group: "face",
    name: "cream brow muzzle",
  });

  const lowerMuzzle = b.part(new THREE.SphereGeometry(0.13, 9, 6), belly, {
    bone: jaw,
    at: jaw.local({ forward: 0.16, down: 0.025 }),
    scale: [1.0, 0.62, 0.58],
    group: "jaw",
    name: "separate lower muzzle",
  });

  const beakBase = head.local({ forward: 0.23, down: -0.005 });
  b.spike(beakBase, [0, 0, 1], 0.31, 0.125, {
    color: beakPaint,
    bone: head,
    caps: { start: "round", end: "point" },
    name: "hero eagle beak",
  });
  b.sweep(
    bezier(
      head.local({ forward: 0.21, down: 0.04 }),
      head.local({ forward: 0.31, down: 0.1 }),
      head.local({ forward: 0.41, down: 0.07 }),
      head.local({ forward: 0.49, down: 0.12 }),
    ),
    [0.075, 0.008],
    {
      color: BEAK_DARK,
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "dark hooked beak underside",
    },
  );

  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: -s * 0.13, up: 0.055, forward: 0.145 });
    b.decal(skull, EYE, {
      at: eyeAt,
      dir: [0, 0.08, 1],
      up: [0, 1, 0],
      size: [0.115, 0.15],
      lift: 0.004,
      mirror: s > 0,
      segments: 7,
      group: "face",
      name: `${s > 0 ? "left" : "right"} enormous painted eye`,
    });

    b.decal(skull, eyeStripe, {
      at: head.local({ left: -s * 0.135, up: 0.16, forward: 0.115 }),
      dir: [0, 0.15, 1],
      up: [0, 1, 0],
      size: [0.18, 0.07],
      lift: 0.005,
      mirror: s > 0,
      segments: 5,
      group: "face markings",
      name: `${s > 0 ? "left" : "right"} gold brow stripe`,
    });

    const ear = b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.16, 0.17],
        [0.07, 0.28, "sharp"],
        [0, 0.18],
      ],
      {
        at: head.local({ left: -s * 0.16, up: 0.08, forward: -0.02 }),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: coat,
        bone: head,
        group: "ears",
        name: `${s > 0 ? "left" : "right"} jaguar ear`,
      },
    );
    b.part(new THREE.ConeGeometry(0.055, 0.18, 6), PURPLE, {
      bone: head,
      at: ear.local([0.07, 0.13, 0.03]),
      dir: [0, 0, 1],
      axis: "y",
      scale: [0.7, 1, 0.45],
      name: "ear jewel",
    });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: -16 });

  // Bright angular crown and cheek ruffs: intentionally carved like painted wood.
  const crestOutline: [number, number, "sharp"][] = [
    [-0.18, 0],
    [-0.12, 0.18],
    [-0.07, 0.48, "sharp"],
    [0.0, 0.25],
    [0.08, 0.58, "sharp"],
    [0.14, 0.25],
    [0.2, 0.44, "sharp"],
    [0.22, 0],
  ];
  b.extrude(crestOutline, {
    at: head.local({ forward: -0.08, up: 0.1 }),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.01,
    color: magentaPaint(),
    bone: head,
    group: "crest",
    name: "three-point magenta crown",
  });

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p = head.local({ left: -s * (0.16 + i * 0.025), up: -0.01 - i * 0.018, forward: 0.01 });
      b.spike(p, [s * 0.55, -0.15, -0.25], 0.16 - i * 0.018, 0.032, {
        color: i % 2 ? MAGENTA : TURQUOISE,
        bone: head,
        caps: { start: "round", end: "point" },
        name: `${s > 0 ? "left" : "right"} cheek ruff ${i}`,
      });
    }
  }

  // ------------------------------------------------------------------------------------------
  // Painted details: feather blades, wing pinstripes, tail diamonds, and body ornaments.
  // ------------------------------------------------------------------------------------------

  for (const wing of wingChains) {
    const side = wing.side;
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + i * 0.115;
      const root = wing.upper.at(t).at;
      const tip = new THREE.Vector3(
        root.x + side * (0.18 + i * 0.018),
        root.y + 0.17 - i * 0.012,
        root.z - 0.28 - i * 0.018,
      );
      b.sweep(
        bezier(
          root,
          new THREE.Vector3(root.x + side * 0.035, root.y + 0.09, root.z - 0.03),
          new THREE.Vector3(tip.x, tip.y + 0.04, tip.z + 0.05),
          tip,
        ),
        [0.042, 0.006],
        {
          color: i % 3 === 0 ? MAGENTA : i % 3 === 1 ? SUN : featherPaint,
          bone: wing.upper.at(t).bone,
          sides: 5,
          caps: { start: "round", end: "point" },
          name: `${side > 0 ? "left" : "right"} painted flight feather ${i}`,
        },
      );
    }

    const cardFrames = [];
    for (let i = 0; i < 6; i++) cardFrames.push(wing.upper.at(0.18 + i * 0.13));
    b.cards(cardFrames, featherMark, {
      size: [0.12, 0.28],
      lean: 58,
      bend: 18,
      flow: [side * 0.2, 0.15, -1],
      vary: 0.18,
      sink: 0.08,
      mirror: side < 0,
      color: featherPaint,
      rng: rng(100 + side),
      group: "flight feathers",
    });
  }

  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.11;
    const p = tail.at(t).at;
    b.part(new THREE.ConeGeometry(0.035, 0.16, 5), i % 2 ? TURQUOISE : MAGENTA, {
      bone: tail.at(t).bone,
      at: p,
      dir: tail.at(t).normal,
      axis: "y",
      rotation: [0, i * 21, 0],
      name: `tail painted diamond ${i}`,
    });
  }

  // Carved rosette medallions on the shoulders and haunches.
  for (const side of [1, -1]) {
    const shoulderHit = b.surface(bodyTube).around([side * 0.28, 1.15, 0.25]).at(side * 72, 8);
    if (shoulderHit) {
      b.stick(new THREE.CylinderGeometry(0.095, 0.095, 0.018, 10), SUN, shoulderHit, {
        embed: 0.35,
        name: "shoulder rosette",
      });
      b.ring(shoulderHit, { count: 8, radius: 0.082, tilt: 15 }, (item) =>
        b.spike(item, item, 0.055, 0.009, {
          color: MAGENTA,
          name: "rosette petal",
        }),
      );
    }

    const haunchHit = b.surface(bodyTube).around([side * 0.28, 1.0, -0.25]).at(side * 78, -8);
    if (haunchHit) {
      b.stick(new THREE.CylinderGeometry(0.08, 0.08, 0.016, 9), TURQUOISE, haunchHit, {
        embed: 0.3,
        name: "haunch turquoise medallion",
      });
    }
  }

  // A small painted wood collar separating eagle neck from jaguar body.
  const collar = b.surface(bodyTube).loop(body.at(0.78), { lift: 0.008 });
  b.sweep(collar, 0.018, {
    color: MAGENTA,
    sides: 6,
    caps: "none",
    name: "magenta neck collar",
  });

  // Tiny wooden studs along the collar.
  b.along(collar, 12, (at) =>
    b.part(new THREE.SphereGeometry(0.024, 6, 4), SUN, {
      frame: at,
      scale: [1, 0.65, 1],
      name: "collar sun stud",
    }),
  );

  // A bold front chest bib makes the hybrid silhouette read immediately.
  b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.15, 0.22],
      [0.09, 0.46, "sharp"],
      [0, 0.56, "sharp"],
      [-0.09, 0.46, "sharp"],
      [-0.15, 0.22],
    ],
    {
      at: [0, 1.14, 0.62],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color: belly,
      bone: body.tip,
      group: "chest ornament",
      name: "cream jaguar chest bib",
    },
  );

  // Painted wooden bead at the tail base and a sun disk on the forehead.
  b.part(new THREE.SphereGeometry(0.09, 8, 6), MAGENTA, {
    bone: hips,
    at: [0, 1.0, -0.54],
    scale: [1, 1, 0.65],
    name: "tail root bead",
  });

  b.stick(
    new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10),
    SUN,
    head.local({ forward: 0.045, up: 0.16 }),
    { spin: 0, name: "forehead sun medallion" },
  );

  // A few stylized whiskers, kept thick enough to read as carved/painted rods.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        bezier(
          head.local({ left: -s * 0.095, down: 0.02, forward: 0.17 }),
          head.local({ left: -s * (0.2 + i * 0.025), down: 0.005 + i * 0.025, forward: 0.2 }),
          head.local({ left: -s * (0.29 + i * 0.025), down: 0.015 + i * 0.035, forward: 0.19 }),
          head.local({ left: -s * (0.38 + i * 0.02), down: 0.02 + i * 0.035, forward: 0.14 }),
        ),
        [0.008, 0.002],
        {
          color: CREAM,
          bone: head,
          sides: 5,
          caps: { start: "round", end: "point" },
          name: "carved whisker",
        },
      );
    }
  }

  return b.root;
}

function magentaPaint() {
  return stripes(
    MAGENTA,
    [SUN, TURQUOISE, PURPLE],
    { size: 0.095, width: 0.28, wobble: 0.15, seed: 212 },
  );
}
```
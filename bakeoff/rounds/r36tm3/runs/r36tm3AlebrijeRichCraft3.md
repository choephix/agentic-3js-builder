```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  line,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  gradient,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije: a powerful spotted jaguar body with eagle head, hooked beak, huge spread wings, feathered tail, and carved-wood ornamental details.",
};

const WOOD = "#9b351f";
const WOOD_DARK = "#541d25";
const GOLD = "#f6c342";
const GOLD_DARK = "#a85c22";
const TURQUOISE = "#19b9a7";
const TURQUOISE_DARK = "#08716e";
const MAGENTA = "#d83279";
const PURPLE = "#5c2e83";
const CREAM = "#f8e4ae";
const WHITE = "#fff4d0";
const BLACK = "#25152b";
const BEAK = "#e59b27";
const FEATHER = "#146b72";
const EYE_IRIS = "#f4b52c";

const BODY_BASE = cel(
  furEdge(WOOD, GOLD_DARK, {
    level: -0.18,
    teeth: 0.24,
    period: 0.11,
    ink: WOOD_DARK,
    inkWidth: 0.035,
  }),
  WOOD_DARK,
  { threshold: 0.05 },
);

const BELLY = cel(CREAM, "#c87945", { threshold: 0.08 });
const TURQ = cel(TURQUOISE, TURQUOISE_DARK, { threshold: 0.1 });
const MAGENTA_PAINT = cel(MAGENTA, PURPLE, { threshold: 0.08 });
const GOLD_PAINT = cel(GOLD, GOLD_DARK, { threshold: 0.12 });

const COAT = countershade(
  spots(BODY_BASE, [MAGENTA, GOLD, TURQUOISE_DARK], {
    size: 0.19,
    amount: 0.7,
    rosette: true,
    seed: 17,
  }),
  BELLY,
  { level: -0.18, soft: 0.25 },
);

const WING_PAINT = stripes(
  cel(FEATHER, "#092f4b"),
  [TURQUOISE, MAGENTA, GOLD],
  { size: 0.16, width: 0.22, wobble: 0.25, axis: "x", seed: 9 },
);

const WOOD_GRAIN = paint((p, n) => {
  const band = Math.sin(p.y * 32 + p.z * 13 + Math.sin(p.x * 17)) * 0.5 + 0.5;
  return n.y > 0.25
    ? band > 0.68
      ? GOLD
      : WOOD
    : band > 0.78
      ? WOOD_DARK
      : WOOD;
});

const EYE = animeEye({
  iris: EYE_IRIS,
  irisLight: "#fff2a1",
  irisDark: "#7e2d45",
  ink: BLACK,
  blush: "#ef6c7c",
  size: 384,
});

const FEATHER_MARK = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 126 C8 96 5 67 19 38 C25 25 31 12 32 2 C43 24 58 43 58 67 C58 94 44 112 32 126Z"
      fill="#f6c342" stroke="#25152b" stroke-width="5"/>
    <path d="M31 113 C30 82 34 45 32 10" fill="none" stroke="#d83279" stroke-width="7"/>
    <path d="M15 81 Q31 69 51 74 M13 95 Q29 84 45 88" fill="none" stroke="#19b9a7" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

const CREST_MARK = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 56 Q22 8 38 43 Q52 2 65 41 Q82 5 92 41 Q110 16 123 57Z"
      fill="#d83279" stroke="#25152b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M13 52 Q27 35 38 47 M59 48 Q67 28 74 46 M97 50 Q108 35 116 52"
      fill="none" stroke="#f6c342" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: any,
  at: any,
  bone?: any,
  scale?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  foot: any,
  side: number,
  z: number,
  bone: any,
) {
  const root = foot.local({ left: side * 0.035, forward: z, down: 0.035 });
  const tip = foot.local({ left: side * 0.075, forward: z + 0.09, down: 0.075 });
  b.sweep([root, tip], [0.012, 0.004], {
    bone,
    color: GOLD_DARK,
    caps: { start: "round", end: "point" },
    section: { ngon: 6 },
    name: `claw_${side}_${z}`,
  });
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, broad quadruped stance, wings separated in a rest pose.

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.7, -0.7],
    [0, 0.79, -0.32],
    [0, 0.83, 0.05],
    [0, 0.86, 0.39],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.86, 0.33],
    [0, 0.94, 0.52],
    [0, 1.08, 0.67],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.12, 0.72],
    dir: [0, -0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.11, down: 0.035 }),
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    [0, 0.72, -0.65],
    [0, 0.69, -0.98],
    [0.02, 0.77, -1.28],
    [0.08, 0.94, -1.52],
    [0.1, 1.04, -1.72],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legData = [
    { side: 1, z: -0.45, name: "legHL", target: [0.34, 0.12, -0.58] as [number, number, number] },
    { side: -1, z: -0.45, name: "legHR", target: [-0.34, 0.12, -0.58] as [number, number, number] },
    { side: 1, z: 0.28, name: "legFL", target: [0.32, 0.12, 0.3] as [number, number, number] },
    { side: -1, z: 0.28, name: "legFR", target: [-0.32, 0.12, 0.3] as [number, number, number] },
  ];

  const legs: { side: number; foot: any; chain: any }[] = [];
  for (const d of legData) {
    const hipPoint = [d.side * 0.22, 0.74, d.z] as [number, number, number];
    const points = limb(
      hipPoint,
      d.target,
      [0.28, 0.27, 0.21],
      [
        [0, 0, d.z > 0 ? 1 : -1],
        [0, 0, d.z > 0 ? -1 : 1],
      ],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(d.name, points, {
      parent: hips,
      names: [`hip${d.name.slice(-2, -1)}`, `knee${d.name.slice(-1)}`, `ankle${d.name.slice(-1)}`, `paw${d.name.slice(-1)}`],
      role: "leg",
      contact: d.target,
    });
    legs.push({ side: d.side, foot: chain.tip, chain });
  }

  const wingChains: any[] = [];
  for (const side of [1, -1]) {
    const shoulder = [side * 0.22, 0.94, 0.28] as [number, number, number];
    const wingPoints = [
      shoulder,
      [side * 0.54, 1.12, 0.24],
      [side * 0.91, 1.38, 0.12],
      [side * 1.28, 1.48, -0.03],
    ];
    const wing = b.chain(`wing${side > 0 ? "L" : "R"}`, wingPoints, {
      parent: spine.tip,
      names: [
        `wingShoulder${side > 0 ? "L" : "R"}`,
        `wingElbow${side > 0 ? "L" : "R"}`,
        `wingWrist${side > 0 ? "L" : "R"}`,
        `wingTip${side > 0 ? "L" : "R"}`,
      ],
      role: "wing",
    });
    wingChains.push(wing);
  }

  // ---------------------------------------------------------------------------
  // Main carved wooden volumes.

  b.sweep(spine, (t) => 0.24 - 0.035 * t, {
    color: COAT,
    sides: 8,
    caps: "round",
    group: "body",
    name: "faceted_jaguar_body",
  });

  b.sweep(neck, [0.19, 0.15], {
    color: COAT,
    sides: 8,
    group: "body",
    name: "neck",
  });

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.025, {
    color: gradient(COAT, MAGENTA_PAINT, [0, 0.72, -0.7], [0.1, 1.04, -1.72]),
    sides: 7,
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "painted_tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.105 - 0.04 * t, {
      color: t > 0.72 ? GOLD_PAINT : COAT,
      sides: 7,
      group: "legs",
      name: `leg_${leg.side}`,
    });
  }

  // Broad pale belly and chest planes.
  b.sweep(
    [
      [0, 0.78, -0.45],
      [0, 0.81, -0.05],
      [0, 0.86, 0.3],
      [0, 0.94, 0.48],
    ],
    0.18,
    {
      color: BELLY,
      bone: spine.joints[0],
      sides: 6,
      caps: "round",
      name: "cream_belly",
    },
  );

  // Paws and toes.
  for (const leg of legs) {
    sphere(b, 0.105, GOLD_PAINT, leg.foot.at, leg.foot.bone, [1.15, 0.65, 1.35], "golden_paw");
    for (const s of [-1, 1]) {
      claw(b, leg.foot, s, 0.01, leg.foot.bone);
      claw(b, leg.foot, s, 0.065, leg.foot.bone);
    }
  }

  // Head, cheeks and muzzle.
  const skull = sphere(
    b,
    0.22,
    COAT,
    head.at,
    head,
    [1.12, 0.95, 1.18],
    "carved_jaguar_eagle_head",
  );

  sphere(b, 0.13, BELLY, head.local({ forward: 0.18, down: 0.015 }), head, [1.25, 0.8, 1.1], "cream_muzzle");
  sphere(b, 0.07, BLACK, jaw.local({ forward: 0.12, down: 0.02 }), jaw, [1.15, 0.65, 0.7], "lower_mouth");

  // Eagle beak in two hinged wooden pieces.
  b.spike(
    head.local({ forward: 0.2, up: 0.015 }),
    [0, 0.12, 1],
    0.25,
    0.105,
    {
      bone: head,
      color: BEAK,
      caps: { start: "round", end: "point" },
      name: "upper_hooked_beak",
    },
  );
  b.spike(
    jaw.local({ forward: 0.12, up: 0.005 }),
    [0, -0.08, 1],
    0.15,
    0.06,
    {
      bone: jaw,
      color: GOLD_DARK,
      caps: { start: "round", end: "point" },
      name: "lower_beak",
    },
  );

  // Jaguar ears, large and round with bright inner faces.
  for (const side of [1, -1]) {
    const ear = sphere(
      b,
      0.105,
      COAT,
      head.local({ left: side * 0.16, up: 0.16, back: 0.015 }),
      head,
      [0.9, 1.05, 0.52],
      `round_ear_${side}`,
    );
    sphere(
      b,
      0.065,
      MAGENTA_PAINT,
      head.local({ left: side * 0.16, up: 0.16, forward: 0.06 }),
      head,
      [0.9, 0.65, 0.25],
      `ear_inner_${side}`,
    );
    b.spike(
      head.local({ left: side * 0.16, up: 0.22, back: 0.01 }),
      [0, 1, -0.1],
      0.11,
      0.025,
      { bone: head, color: BLACK, name: `ear_tuft_${side}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Face decals are placed after the skull is settled.

  const headSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const hit = headSurface.around(head.at).at(side * 42, 7);
    if (hit) {
      b.decal(headSurface, EYE, {
        at: hit,
        size: [0.105, 0.135],
        lift: 0.004,
        mirror: side > 0,
        name: `painted_eye_${side}`,
        group: "face",
      });
    }
  }

  // Brow bars and cheek whisker dots.
  for (const side of [1, -1]) {
    b.sweep(
      [
        head.local({ left: side * 0.08, up: 0.105, forward: 0.17 }),
        head.local({ left: side * 0.18, up: 0.13, forward: 0.13 }),
      ],
      0.014,
      { bone: head, color: BLACK, caps: "round", name: `brow_${side}` },
    );

    for (let i = 0; i < 3; i++) {
      sphere(
        b,
        0.012,
        BLACK,
        head.local({ left: side * (0.12 + i * 0.035), down: 0.025 - i * 0.025, forward: 0.19 }),
        head,
        undefined,
        `whisker_spot_${side}_${i}`,
      );
    }
  }

  // Open jaw seam and tongue.
  b.rod(
    jaw.local({ forward: 0.03, up: 0.01 }),
    jaw.local({ forward: 0.23, up: -0.01 }),
    0.012,
    BLACK,
    { bone: jaw, name: "mouth_seam" },
  );
  b.part(new THREE.BoxGeometry(0.065, 0.018, 0.1), MAGENTA, {
    bone: jaw,
    at: jaw.local({ forward: 0.13, down: 0.025 }),
    flat: true,
    name: "tongue",
  });

  // ---------------------------------------------------------------------------
  // Huge spread eagle wings: dark arm tubes, membranes, and separate feather blades.

  for (const side of [1, -1]) {
    const wing = wingChains[side > 0 ? 0 : 1];
    const outer = [
      [side * 0.22, 0.9, 0.29],
      [side * 0.53, 0.92, 0.2],
      [side * 0.9, 1.12, 0.02],
      [side * 1.28, 1.22, -0.08],
    ];
    b.sweep(wing, [0.095, 0.032], {
      color: WING_PAINT,
      sides: 6,
      group: "wings",
      name: `wing_arm_${side}`,
    });

    b.membrane(
      wing,
      [
        outer[0],
        [side * 0.5, 0.72, 0.05],
        [side * 0.88, 0.75, -0.2],
        [side * 1.23, 0.9, -0.4],
      ],
      {
        color: TURQ,
        thickness: 0.018,
        rows: 4,
        cols: 8,
        scallop: 0.12,
        name: `turquoise_wing_membrane_${side}`,
      },
    );

    // Three broad feather blades make a readable silhouette.
    const feathers = [
      { root: [side * 0.52, 1.02, 0.15], tip: [side * 0.78, 1.54, -0.05], w: 0.2 },
      { root: [side * 0.72, 1.1, 0.03], tip: [side * 1.12, 1.62, -0.17], w: 0.22 },
      { root: [side * 0.9, 1.15, -0.06], tip: [side * 1.43, 1.43, -0.32], w: 0.22 },
      { root: [side * 1.0, 1.05, -0.13], tip: [side * 1.48, 1.18, -0.48], w: 0.18 },
    ];

    for (let i = 0; i < feathers.length; i++) {
      const f = feathers[i];
      const base = new THREE.Vector3(...f.root);
      const tip = new THREE.Vector3(...f.tip);
      const dir = tip.clone().sub(base).normalize();
      const sideVec = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      const outline: [number, number][] = [
        [0, 0],
        [f.w * 0.38, 0.08],
        [f.w * 0.55, 0.42],
        [f.w * 0.18, 0.88],
        [0, 1.0],
        [-f.w * 0.18, 0.88],
        [-f.w * 0.5, 0.42],
        [-f.w * 0.35, 0.1],
      ];
      b.extrude(outline, {
        at: base,
        x: sideVec,
        y: dir,
        thickness: [0.018, 0.006],
        bevel: 0.008,
        smoothing: 1,
        color: i % 2 ? MAGENTA_PAINT : GOLD_PAINT,
        bone: wing.tip,
        name: `primary_feather_${side}_${i}`,
        group: "feathers",
      });
      b.cards(
        [wing.at(0.42 + i * 0.1)],
        FEATHER_MARK,
        {
          size: [0.09, 0.28],
          lean: 48,
          bend: 18,
          flow: [0, -0.3, -1],
          mirror: side > 0,
          color: WHITE,
          sink: 0.08,
          name: `feather_mark_${side}_${i}`,
        },
      );
    }
  }

  // Crown crest: stepped alebrije ornament above the head.
  b.extrude(
    [
      [-0.18, 0],
      [-0.13, 0.1],
      [-0.08, 0.03],
      [-0.01, 0.2],
      [0.08, 0.03],
      [0.15, 0.13],
      [0.2, 0],
    ],
    {
      at: head.local({ back: 0.06, up: 0.12 }),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color: MAGENTA_PAINT,
      bone: head,
      name: "painted_head_crest",
      group: "ornament",
    },
  );
  b.cards(
    [head.moved(head.local({ back: 0.06, up: 0.12 }))],
    CREST_MARK,
    {
      size: [0.28, 0.13],
      lean: 90,
      flow: [1, 0, 0],
      mirror: false,
      color: WHITE,
      sink: 0.05,
      name: "crest_pattern",
    },
  );

  // ---------------------------------------------------------------------------
  // Carved beads, rosettes, and painted wood inlays.

  const bodySurface = b.surface(b.root);
  const rosetteHits = bodySurface.scatter(28, {
    rng: rng(31),
    minDist: 0.09,
    filter: (h) => h.at.y > 0.48 && h.at.y < 1.12 && h.at.z > -0.75 && h.at.z < 0.55,
  });

  for (let i = 0; i < rosetteHits.length; i++) {
    const h = rosetteHits[i];
    b.stick(
      new THREE.CylinderGeometry(0.025, 0.032, 0.012, 8),
      i % 3 === 0 ? GOLD : i % 3 === 1 ? MAGENTA : TURQUOISE,
      h,
      {
        embed: 0.35,
        spin: i * 29,
        name: `raised_rosette_${i}`,
        group: "inlay",
      },
    );
  }

  // Gold collar ring and tail bands.
  const collar = b.surface(neck).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.025, {
    color: GOLD_PAINT,
    sides: 6,
    name: "gold_neck_collar",
    group: "ornament",
  });

  b.along(tail, 7, (at, i) => {
    if (i < 1) return;
    b.sweep(
      [
        at.moved([0, -0.022, 0]),
        at.moved([0, 0.022, 0]),
      ],
      0.012,
      {
        color: i % 2 ? MAGENTA_PAINT : TURQUOISE,
        caps: "round",
        name: `tail_band_${i}`,
        group: "ornament",
      },
    );
  });

  // Tiny gold spines along the jaguar's back, echoing carved wood flame motifs.
  b.along(spine, 9, (at, i) => {
    const rise = i < 3 ? 0.055 : 0.04;
    b.spike(at, [0, 1, 0], rise, 0.018, {
      color: GOLD_PAINT,
      caps: "point",
      name: `back_spine_${i}`,
      group: "ornament",
    });
  });

  // Warm wooden feet pads make contact unmistakable and keep the lowest points near y=.01.
  for (const leg of legs) {
    b.part(new THREE.CylinderGeometry(0.07, 0.075, 0.018, 8), WOOD_GRAIN, {
      bone: leg.foot.bone,
      at: leg.foot.local({ down: 0.072 }),
      name: "wooden_paw_pad",
      flat: true,
    });
  }

  return b.root;
}
```
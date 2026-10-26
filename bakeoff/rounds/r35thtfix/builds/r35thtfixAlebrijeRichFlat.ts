import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, rng } from "../../../../src/index";
import { animeEye } from "../../../../kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A vividly painted Oaxacan alebrije combining a spotted jaguar body, eagle beak and talons, broad feathered wings, a jeweled crest, and hand-painted geometric ornaments.",
};

const INK = "#261329";
const WOOD = "#c95b32";
const WOOD_LIGHT = "#ed8b35";
const GOLD = "#f7c744";
const CREAM = "#f7df9c";
const TURQUOISE = "#159c9c";
const AQUA = "#62d5b5";
const MAGENTA = "#d82d72";
const PURPLE = "#713b91";
const BLUE = "#2867a6";
const GREEN = "#72ad45";
const DARK = "#452044";
const BEAK = "#e6a72e";
const BEAK_DARK = "#9e4d25";
const PAW = "#a84b35";
const WHITE = "#fff4d5";

const EYE = animeEye({
  iris: "#26d4c8",
  irisLight: "#b5fff0",
  irisDark: "#17677f",
  ink: INK,
  blush: "#ef6b88",
  size: 512,
});

export default function build() {
  const b = createBuilder({
    name: "alebrije-jaguar-eagle",
    detail: 1,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Small authoring helpers

  const sphere = (
    color: string,
    at: THREE.Vector3 | [number, number, number],
    scale: [number, number, number],
    bone: any,
    name: string,
    segments = 8,
    rings = 6,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, rings), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });

  const box = (
    color: string,
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const disk = (
    color: string,
    on: any,
    radius: number,
    depth: number,
    name: string,
  ) =>
    b.stick(
      new THREE.CylinderGeometry(radius, radius, depth, 8, 1, false),
      color,
      on,
      {
        embed: 0.35,
        name,
      },
    );

  const ringSpot = (on: any, radius: number, color: string, name: string) => {
    const geometry = new THREE.TorusGeometry(radius, radius * 0.17, 6, 10);
    geometry.rotateX(Math.PI / 2);
    b.stick(geometry, color, on, {
      embed: 0.22,
      name,
    });
  };

  const addCuff = (joint: any, radius: number, color: string, name: string) => {
    const items = b.ring(joint, {
      count: 8,
      radius,
      name: `${name}Ring`,
      role: "fan",
    });
    b.sweep(catmull(items.items, { closed: true }), 0.012, {
      color,
      caps: "none",
      sides: 6,
      smooth: false,
      name,
    });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a curving jaguar spine, articulated head and jaw, four legs, wings, tail, and digits.

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.34],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.84, -0.62],
    [0, 0.88, -0.34],
    [0, 0.98, 0.02],
    [0, 1.10, 0.38],
    [0, 1.16, 0.58],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "spineMid", "shoulder", "chest", "chestTip"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    spine.tip!.at,
    [0, 1.28, 0.65],
    [0, 1.43, 0.73],
    [0, 1.52, 0.77],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neckBase", "neckMid", "neckTip", "neckEnd"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.53, 0.78],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: head.local({ forward: 0.19, up: -0.01 }),
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const lowerJaw = b.joint("lowerJaw", {
    parent: head,
    at: head.local({ forward: 0.19, down: 0.035 }),
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  // A slightly open mouth makes the eagle-jaguar hybrid unmistakable.
  b.pose(lowerJaw, {
    axis: [1, 0, 0],
    deg: 12,
  });

  const tailPath = catmull([
    [0, 0.87, -0.55],
    [0, 0.80, -0.88],
    [0, 0.78, -1.18],
    [0, 0.88, -1.43],
    [0, 1.03, -1.63],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "body",
  });

  const legs: { s: number; front: boolean; chain: any }[] = [];

  const makeLeg = (s: number, front: boolean) => {
    const z = front ? 0.34 : -0.40;
    const root: [number, number, number] = [
      s * (front ? 0.31 : 0.30),
      front ? 1.03 : 0.87,
      z,
    ];
    const target: [number, number, number] = [
      s * (front ? 0.36 : 0.37),
      0.115,
      front ? 0.51 : -0.51,
    ];

    const points = limb(
      root,
      target,
      front ? [0.36, 0.35, 0.27] : [0.34, 0.34, 0.27],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const sideName = s > 0 ? "L" : "R";
    const prefix = front ? "front" : "hind";
    const chain = b.chain(`${prefix}Leg${sideName}`, points, {
      parent: front ? spine.tip : hips,
      names: [
        `${prefix}Hip${sideName}`,
        `${prefix}Knee${sideName}`,
        `${prefix}Ankle${sideName}`,
        `${prefix}Paw${sideName}`,
      ],
      role: "leg",
      contact: target,
      group: "legs",
    });

    legs.push({ s, front, chain });
    return chain;
  };

  const frontLegL = makeLeg(1, true);
  const frontLegR = makeLeg(-1, true);
  const hindLegL = makeLeg(1, false);
  const hindLegR = makeLeg(-1, false);

  const wings: { s: number; chain: any; lower: [number, number, number][] }[] = [];

  const makeWing = (s: number) => {
    const side = s > 0 ? "L" : "R";
    const points: [number, number, number][] = [
      [s * 0.30, 1.18, 0.29],
      [s * 0.61, 1.47, 0.18],
      [s * 1.00, 1.54, -0.04],
      [s * 1.30, 1.35, -0.32],
    ];

    const chain = b.chain(`wing${side}`, catmull(points), {
      parent: spine.tip!,
      names: [`wingRoot${side}`, `wingElbow${side}`, `wingWrist${side}`, `wingTip${side}`],
      role: "wing",
      group: "wings",
    });

    const lower: [number, number, number][] = [
      [s * 0.30, 1.10, 0.28],
      [s * 0.57, 1.18, 0.10],
      [s * 0.91, 1.17, -0.13],
      [s * 1.20, 1.18, -0.38],
    ];

    wings.push({ s, chain, lower });
    return chain;
  };

  const wingL = makeWing(1);
  const wingR = makeWing(-1);

  // Three extended talons on each forepaw and two shorter toes on each hind paw.
  const toeChains: any[] = [];

  const makeToe = (
    leg: any,
    s: number,
    front: boolean,
    index: number,
  ) => {
    const side = s > 0 ? "L" : "R";
    const prefix = front ? "frontToe" : "hindToe";
    const baseZ = front ? 0.50 : -0.48;
    const spread = front ? (index - 1) * 0.045 : (index - 0.5) * 0.052;
    const base: [number, number, number] = [
      s * (0.35 + spread),
      0.115,
      baseZ,
    ];
    const middle: [number, number, number] = [
      s * (0.35 + spread * 1.25),
      front ? 0.074 : 0.072,
      baseZ + (front ? 0.095 : -0.045),
    ];
    const tip: [number, number, number] = [
      s * (0.35 + spread * 1.55),
      0.035,
      baseZ + (front ? 0.19 : -0.095),
    ];

    const chain = b.chain(
      `${prefix}${side}${index}`,
      catmull([base, middle, tip]),
      {
        parent: leg.tip,
        names: [
          `${prefix}Base${side}${index}`,
          `${prefix}Mid${side}${index}`,
          `${prefix}Tip${side}${index}`,
        ],
        role: "digit",
        group: "talons",
      },
    );

    toeChains.push(chain);
    return chain;
  };

  for (const leg of [
    { chain: frontLegL, s: 1, front: true },
    { chain: frontLegR, s: -1, front: true },
    { chain: hindLegL, s: 1, front: false },
    { chain: hindLegR, s: -1, front: false },
  ]) {
    const count = leg.front ? 3 : 2;
    for (let i = 0; i < count; i++) {
      makeToe(leg.chain, leg.s, leg.front, i);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main body: broad low-poly painted wood with turquoise back, cream belly, and orange flanks.

  const bodyTube = b.sweep(spine, (t) => {
    if (t < 0.18) return 0.22;
    if (t < 0.55) return 0.285;
    return 0.25 - (t - 0.55) * 0.055;
  }, {
    color: WOOD,
    sectors: [
      [-58, 58, TURQUOISE],
      [122, 238, CREAM],
    ],
    section: "circle",
    sides: 8,
    smooth: false,
    name: "jaguarBody",
    group: "body",
  });

  const neckTube = b.sweep(neck, (t) => 0.19 - t * 0.035, {
    color: PURPLE,
    bands: [
      [0.28, AQUA],
      [0.53, MAGENTA],
      [0.77, GOLD],
    ],
    sides: 8,
    smooth: false,
    name: "paintedNeck",
    group: "head",
  });

  const tailTube = b.sweep(tail, (t) => 0.12 - t * 0.086, {
    color: WOOD_LIGHT,
    bands: [
      [0.18, TURQUOISE],
      [0.36, MAGENTA],
      [0.56, GOLD],
      [0.75, PURPLE],
      [0.88, AQUA],
    ],
    sides: 8,
    smooth: false,
    name: "stripedTail",
    group: "body",
  });

  // Shoulder and hip knobs make the wooden puppet construction visible.
  sphere(TURQUOISE, [0, 1.12, 0.38], [0.29, 0.22, 0.22], spine.tip, "shoulderBlock");
  sphere(PURPLE, [0, 0.84, -0.48], [0.25, 0.22, 0.23], hips, "hipBlock");

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, paws, cuffs, and talons.

  for (const info of legs) {
    const side = info.s > 0 ? "L" : "R";
    const prefix = info.front ? "front" : "hind";

    const legTube = b.sweep(info.chain, (t) => {
      if (t < 0.35) return 0.095;
      if (t < 0.7) return 0.076;
      return 0.058;
    }, {
      color: info.front ? WOOD_LIGHT : WOOD,
      bands: [
        [0.23, MAGENTA],
        [0.46, GOLD],
        [0.68, TURQUOISE],
        [0.83, PURPLE],
      ],
      sides: 7,
      smooth: false,
      name: `${prefix}LegPaint${side}`,
      group: "legs",
    });

    const paw = info.chain.tip.at;
    sphere(
      info.front ? PAW : WOOD_LIGHT,
      paw,
      [0.115, 0.105, 0.13],
      info.chain.tip,
      `${prefix}Paw${side}`,
      8,
      6,
    );

    sphere(
      INK,
      [paw.x, paw.y - 0.045, paw.z + (info.front ? 0.072 : -0.065)],
      [0.054, 0.022, 0.047],
      info.chain.tip,
      `${prefix}Pad${side}`,
      8,
      5,
    );

    addCuff(
      info.chain.joints[1],
      info.front ? 0.09 : 0.085,
      info.front ? GOLD : AQUA,
      `${prefix}UpperCuff${side}`,
    );

    addCuff(
      info.chain.joints[2],
      info.front ? 0.071 : 0.068,
      info.front ? TURQUOISE : MAGENTA,
      `${prefix}LowerCuff${side}`,
    );

    // A small carved diamond on each shin.
    const shin = info.chain.joints[2].at;
    b.slab(
      [
        [shin.x - info.s * 0.035, shin.y + 0.055, shin.z + 0.045],
        [shin.x, shin.y + 0.090, shin.z + 0.045],
        [shin.x + info.s * 0.035, shin.y + 0.055, shin.z + 0.045],
        [shin.x, shin.y + 0.020, shin.z + 0.045],
      ],
      {
        color: info.front ? AQUA : GOLD,
        thickness: 0.012,
        bone: info.chain.joints[2],
        name: `${prefix}ShinDiamond${side}`,
        group: "legs",
      },
    );
  }

  for (let i = 0; i < toeChains.length; i++) {
    const chain = toeChains[i];
    b.sweep(chain, [0.018, 0.006], {
      color: GOLD,
      sides: 6,
      smooth: false,
      caps: "round",
      name: `goldenTalon${i}`,
      group: "talons",
    });

    const tip = chain.tip.at;
    sphere(
      BEAK_DARK,
      tip,
      [0.011, 0.008, 0.014],
      chain.tip,
      `talonTip${i}`,
      6,
      4,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: dark carved membrane, bright feather quills, turquoise windows, and gold edging.

  const wingMembranes: any[] = [];

  for (const wing of wings) {
    const side = wing.s > 0 ? "L" : "R";

    const membrane = b.membrane(wing.chain, wing.lower, {
      color: DARK,
      thickness: 0.018,
      rows: 4,
      cols: 7,
      scallop: 0.12,
      name: `wingMembrane${side}`,
      group: "wings",
    });

    wingMembranes.push(membrane);

    // A smaller colored panel overlays the dark membrane.
    const innerLower: [number, number, number][] = [
      [wing.s * 0.39, 1.17, 0.25],
      [wing.s * 0.63, 1.29, 0.14],
      [wing.s * 0.94, 1.33, -0.045],
      [wing.s * 1.17, 1.28, -0.28],
    ];

    b.membrane(
      wing.chain.path.slice(0.08, 0.92),
      catmull(innerLower).slice(0.02, 0.96),
      {
        color: wing.s > 0 ? PURPLE : BLUE,
        thickness: 0.012,
        rows: 3,
        cols: 6,
        scallop: 0.08,
        name: `wingColorPanel${side}`,
        group: "wings",
      },
    );

    // Bold quills radiate from the wrist and outer wing.
    const featherColors = [MAGENTA, GOLD, AQUA, TURQUOISE, WOOD_LIGHT, BLUE];

    for (let i = 0; i < 6; i++) {
      const t = 0.26 + i * 0.115;
      const root = wing.chain.at(t);
      const tip: [number, number, number] = [
        wing.s * (1.27 + i * 0.045),
        1.32 - i * 0.027,
        -0.27 - i * 0.075,
      ];
      const control: [number, number, number] = [
        wing.s * (0.82 + i * 0.10),
        1.53 - i * 0.015,
        -0.07 - i * 0.055,
      ];

      b.sweep(bezier(root, control, tip), [0.045 - i * 0.003, 0.008], {
        color: featherColors[i],
        bone: wing.chain.joints[Math.min(2, Math.floor(i / 2))],
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `wingQuill${side}${i}`,
        group: "wings",
      });

      // Painted dark separator at each feather base.
      b.spike(
        root,
        root,
        0.055,
        0.017,
        {
          color: INK,
          bone: root.bone,
          name: `quillBase${side}${i}`,
          group: "wings",
        },
      );
    }

    // Gold outer edge beads.
    const outer = wing.chain.at(0.56);
    b.spike(outer, [wing.s * 1.38, 1.33, -0.42], null, 0.025, {
      color: GOLD,
      bone: wing.chain.joints[2],
      name: `wingEdgeBead${side}`,
      group: "wings",
    });

    sphere(
      MAGENTA,
      wing.chain.joints[0].at,
      [0.095, 0.105, 0.095],
      wing.chain.joints[0],
      `wingShoulderRosette${side}`,
      8,
      6,
    );
  }

  // Bright painted circles on the wing membranes.
  for (let wi = 0; wi < wingMembranes.length; wi++) {
    const surface = b.surface(wingMembranes[wi]);
    const hits = surface.scatter(9, {
      rng: rng(80 + wi),
      minDist: 0.11,
      filter: (h: any) => h.n.y > -0.2,
    });

    for (let i = 0; i < hits.length; i++) {
      disk(
        i % 2 === 0 ? GOLD : AQUA,
        hits[i],
        i % 3 === 0 ? 0.034 : 0.025,
        0.009,
        `wingPaintDot${wi}_${i}`,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Jaguar coat: large carved rosettes distributed over the body.

  const bodySurface = b.surface(bodyTube);
  const bodySpots = bodySurface.scatter(27, {
    rng: rng(44),
    minDist: 0.13,
    filter: (h: any) => h.n.y > -0.78,
  });

  for (let i = 0; i < bodySpots.length; i++) {
    const hit = bodySpots[i];
    const r = i % 4 === 0 ? 0.060 : i % 3 === 0 ? 0.048 : 0.039;

    ringSpot(hit, r, INK, `jaguarRosetteRing${i}`);

    const center = hit.moved([0, 0.006, 0]);
    disk(
      i % 3 === 0 ? MAGENTA : GOLD,
      center,
      r * 0.22,
      0.012,
      `jaguarRosetteCenter${i}`,
    );

    if (i % 2 === 0) {
      const small = hit.moved([0, 0.009, 0]);
      ringSpot(small, r * 0.52, DARK, `jaguarRosetteInner${i}`);
    }
  }

  // Carved dorsal studs run from rump to shoulders.
  b.along(bodyTube, 8, (at: any) =>
    b.spike(at, at, 0.042, 0.014, {
      color: GOLD,
      name: `dorsalStud${Math.round(at.t * 100)}`,
      group: "body",
    }),
  );

  // A handful of aqua and magenta disks decorate the cream belly.
  const bellySpots = bodySurface.scatter(10, {
    rng: rng(51),
    minDist: 0.15,
    filter: (h: any) => h.n.y < -0.18,
  });

  for (let i = 0; i < bellySpots.length; i++) {
    disk(
      i % 2 ? AQUA : MAGENTA,
      bellySpots[i],
      0.026 + (i % 3) * 0.005,
      0.010,
      `bellyPaint${i}`,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head: rounded feline-eagle skull, graphic eyes, muzzle, beak, ears, crest, and cheek ruffs.

  const skull = sphere(
    WOOD_LIGHT,
    head.at,
    [0.275, 0.255, 0.315],
    head,
    "angularSkull",
    10,
    8,
  );

  const skullSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(s * 36, 7);
    if (eyeHit) {
      b.decal(skullSurface, EYE, {
        at: eyeHit,
        size: [0.135, 0.17],
        mirror: s > 0,
        segments: 8,
        lift: 0.003,
        name: `paintedEye${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  const muzzleAt = head.local({ forward: 0.205, down: 0.018 });
  sphere(CREAM, muzzleAt, [0.15, 0.115, 0.145], head, "creamMuzzle", 8, 6);

  const noseAt = head.local({ forward: 0.315, up: 0.005 });
  sphere(INK, noseAt, [0.082, 0.058, 0.054], head, "jaguarNose", 8, 6);

  const mouthInside = head.local({ forward: 0.255, down: 0.075 });
  sphere(DARK, mouthInside, [0.105, 0.033, 0.092], lowerJaw, "openMouth", 8, 5);

  // Upper eagle beak, lower hinged beak, and a dark painted tip.
  b.spike(
    upperJaw.at,
    [0, 1.46, 1.40],
    null,
    0.105,
    {
      color: BEAK,
      bone: upperJaw,
      sides: 7,
      name: "upperEagleBeak",
      group: "face",
    },
  );

  b.sweep(
    bezier(
      lowerJaw.at,
      [0, 1.405, 1.14],
      [0, 1.375, 1.29],
    ),
    [0.067, 0.008],
    {
      color: GOLD,
      bone: lowerJaw,
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "lowerEagleBeak",
      group: "face",
    },
  );

  b.spike(
    [0, 1.455, 1.285],
    [0, 1.455, 1.405],
    null,
    0.042,
    {
      color: BEAK_DARK,
      bone: upperJaw,
      sides: 6,
      name: "beakDarkTip",
      group: "face",
    },
  );

  // Forehead diamond, layered like painted wood inlay.
  b.slab(
    [
      [-0.062, 1.585, 1.035],
      [0, 1.66, 1.045],
      [0.062, 1.585, 1.035],
      [0, 1.515, 1.045],
    ],
    {
      color: TURQUOISE,
      thickness: 0.015,
      bone: head,
      name: "foreheadDiamond",
      group: "face",
    },
  );

  b.slab(
    [
      [-0.027, 1.585, 1.054],
      [0, 1.625, 1.054],
      [0.027, 1.585, 1.054],
      [0, 1.548, 1.054],
    ],
    {
      color: GOLD,
      thickness: 0.010,
      bone: head,
      name: "foreheadDiamondInset",
      group: "face",
    },
  );

  // Eagle-like pointed ears with bright inner wood.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.075, 1.66, 0.72],
        [s * 0.245, 1.73, 0.72],
        [s * 0.145, 1.965, 0.70],
      ],
      {
        color: DARK,
        thickness: 0.034,
        bone: head,
        name: `earOuter${s > 0 ? "L" : "R"}`,
        group: "head",
      },
    );

    b.slab(
      [
        [s * 0.105, 1.70, 0.742],
        [s * 0.205, 1.745, 0.742],
        [s * 0.145, 1.89, 0.735],
      ],
      {
        color: MAGENTA,
        thickness: 0.018,
        bone: head,
        name: `earInner${s > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
  }

  // Layered fan of painted feathers behind the skull.
  const crestXs = [-0.22, -0.145, -0.07, 0, 0.07, 0.145, 0.22];
  const crestColors = [MAGENTA, GOLD, AQUA, TURQUOISE, AQUA, GOLD, MAGENTA];

  for (let i = 0; i < crestXs.length; i++) {
    const x = crestXs[i];

    b.extrude(
      [
        [0, 0],
        [0.105, 0.035],
        [0.082, 0.18],
        [0.018, 0.345, "sharp"],
        [-0.065, 0.205],
        [-0.105, 0.045],
      ],
      {
        at: [x, 1.59, 0.54],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.004,
        color: DARK,
        bone: head,
        name: `crestDark${i}`,
        group: "crest",
      },
    );

    b.extrude(
      [
        [0, 0.025],
        [0.072, 0.047],
        [0.054, 0.145],
        [0.012, 0.278, "sharp"],
        [-0.042, 0.16],
        [-0.071, 0.05],
      ],
      {
        at: [x, 1.602, 0.558],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: crestColors[i],
        bone: head,
        name: `crestColor${i}`,
        group: "crest",
      },
    );
  }

  // Cheek ruffs: broad jaguar triangles, painted as alternating warm and cool blades.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    b.slab(
      [
        [s * 0.175, 1.34, 0.895],
        [s * 0.335, 1.405, 0.90],
        [s * 0.235, 1.475, 0.90],
        [s * 0.345, 1.555, 0.90],
        [s * 0.185, 1.61, 0.90],
        [s * 0.115, 1.475, 0.90],
      ],
      {
        color: DARK,
        thickness: 0.032,
        bone: head,
        name: `cheekRuffOuter${side}`,
        group: "face",
      },
    );

    b.slab(
      [
        [s * 0.19, 1.37, 0.925],
        [s * 0.285, 1.415, 0.925],
        [s * 0.22, 1.475, 0.925],
        [s * 0.295, 1.535, 0.925],
        [s * 0.20, 1.57, 0.925],
        [s * 0.155, 1.475, 0.925],
      ],
      {
        color: s > 0 ? MAGENTA : TURQUOISE,
        thickness: 0.014,
        bone: head,
        name: `cheekRuffColor${side}`,
        group: "face",
      },
    );
  }

  // Painted whiskers, six fine wooden rods.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 1.43 + i * 0.035;
      b.sweep(
        bezier(
          [s * 0.055, y, 1.115],
          [s * (0.14 + i * 0.012), y + 0.012, 1.13],
          [s * (0.255 + i * 0.025), y + 0.025, 1.095 + i * 0.018],
        ),
        [0.006, 0.002],
        {
          color: CREAM,
          bone: head,
          sides: 5,
          smooth: false,
          caps: { start: "round", end: "point" },
          name: `whisker${s > 0 ? "L" : "R"}${i}`,
          group: "face",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Small painted motifs around the head and tail.

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Side cheek buttons.
    const cheek = head.local({
      left: s * 0.205,
      forward: 0.135,
      up: -0.005,
    });

    sphere(
      GOLD,
      cheek,
      [0.035, 0.035, 0.018],
      head,
      `cheekButton${side}`,
      7,
      5,
    );

    // Three tiny magenta beads below each ear.
    for (let i = 0; i < 3; i++) {
      const bead = head.local({
        left: s * (0.17 + i * 0.035),
        forward: 0.04,
        up: 0.08 - i * 0.035,
      });

      sphere(
        i === 1 ? GOLD : MAGENTA,
        bead,
        [0.018, 0.018, 0.018],
        head,
        `earBead${side}${i}`,
        6,
        4,
      );
    }
  }

  // Tail tip feather fan and a final gold carved knob.
  const tailEnd = tail.tip!.at;

  for (let i = 0; i < 3; i++) {
    const s = i - 1;
    const tip: [number, number, number] = [
      s * 0.12,
      1.13 + Math.abs(s) * 0.025,
      -1.72 - Math.abs(s) * 0.035,
    ];

    b.sweep(
      bezier(
        tailEnd,
        [s * 0.035, 1.08 + Math.abs(s) * 0.02, -1.68],
        tip,
      ),
      [0.031, 0.006],
      {
        color: [MAGENTA, GOLD, TURQUOISE][i],
        bone: tail.tip!,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `tailFeather${i}`,
        group: "tail",
      },
    );
  }

  sphere(
    GOLD,
    [0, 1.065, -1.66],
    [0.052, 0.052, 0.052],
    tail.tip,
    "tailGoldButton",
    7,
    5,
  );

  // A row of small colored squares along the tail's upper side.
  b.along(tailTube, 6, (at: any) =>
    disk(
      at.t < 0.35 ? AQUA : at.t < 0.7 ? MAGENTA : GOLD,
      at,
      0.021,
      0.009,
      `tailPaintMark${Math.round(at.t * 100)}`,
    ),
  );

  // Shoulder rosette rings and bold wooden collar marks.
  for (const s of [1, -1]) {
    const shoulderHit = b.surface(bodyTube).around([s * 0.28, 1.10, 0.36]).at(s * 62, 10);
    if (shoulderHit) {
      ringSpot(shoulderHit, 0.065, INK, `shoulderRosette${s > 0 ? "L" : "R"}`);
      disk(GOLD, shoulderHit.moved([0, 0.008, 0]), 0.014, 0.010, `shoulderDot${s > 0 ? "L" : "R"}`);
    }
  }

  // A pair of vertical painted bars on the neck, visible between crest and shoulders.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.027, 0],
        [0.027, 0],
        [0.022, 0.14],
        [0, 0.205, "sharp"],
        [-0.022, 0.14],
      ],
      {
        at: head.local({ left: s * 0.185, forward: -0.055, up: -0.02 }),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.002,
        color: s > 0 ? GOLD : AQUA,
        bone: head,
        name: `neckPaintBar${s > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
  }

  // A few intentionally blocky wooden seams at the hip and shoulder.
  box(
    INK,
    [0, 1.005, 0.31],
    [0.34, 0.018, 0.025],
    spine.joints[2],
    "shoulderSeam",
  );

  box(
    GOLD,
    [0, 0.77, -0.47],
    [0.28, 0.016, 0.026],
    hips,
    "hipSeam",
  );

  // The returned root contains the complete rigged, painted wooden creature.
  return b.root;
}

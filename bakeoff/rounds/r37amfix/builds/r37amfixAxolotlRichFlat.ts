import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "chibi axolotl",
  description:
    "A cheerful chibi axolotl with a chunky lavender body, tiny splayed feet, a broad tail, shiny bead eyes, and six fan-shaped frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = "#b985c9";
  const BODY_LIGHT = "#d8a9d8";
  const BELLY = "#f4d6df";
  const INK = "#321c3d";
  const EYE_WHITE = "#fff4ef";
  const PUPIL = "#24162d";
  const HIGHLIGHT = "#ffffff";
  const GILL = "#f26f9c";
  const GILL_LIGHT = "#ffabc0";
  const GILL_DARK = "#bd3f73";
  const PAW = "#9b5fae";
  const MOUTH = "#64284e";
  const GOLD = "#ffd27e";

  const unitSphere = () => new THREE.SphereGeometry(1, 10, 7);
  const smallSphere = () => new THREE.SphereGeometry(1, 8, 6);

  function blob(
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone?: any,
    name?: string,
  ) {
    return b.part(unitSphere(), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });
  }

  function bead(
    at: [number, number, number],
    radius: number,
    color: string,
    bone?: any,
    name?: string,
  ) {
    return b.part(smallSphere(), color, {
      at,
      bone,
      scale: [radius, radius, radius],
      flat: true,
      name,
    });
  }

  function finBlade(
    at: [number, number, number],
    side: number,
    width: number,
    height: number,
    color: string,
    bone: any,
    name: string,
  ) {
    return b.extrude(
      [
        [0, 0],
        [width * 0.72, height * 0.08],
        [width, height * 0.44],
        [width * 0.7, height],
        [width * 0.22, height * 0.68],
        [0, height * 0.22],
      ],
      {
        at,
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        smoothing: 1,
        color,
        bone,
        name,
      },
    );
  }

  function gillFilament(
    base: [number, number, number],
    tip: [number, number, number],
    bone: any,
    name: string,
  ) {
    const mid: [number, number, number] = [
      (base[0] + tip[0]) * 0.52,
      (base[1] + tip[1]) * 0.52 + 0.025,
      (base[2] + tip[2]) * 0.52,
    ];
    const path = catmull([base, mid, tip]);
    const tube = b.sweep(path, (t: number) => 0.018 * (1 - t) + 0.006, {
      bone,
      color: GILL_LIGHT,
      sides: 6,
      caps: "point",
      name,
    });
    const end = path.at(1);
    b.spike(end, path.tangentAt(1), 0.035, 0.006, {
      bone,
      color: GILL_DARK,
      name: `${name}-tip`,
    });
    return tube;
  }

  // ---------------------------------------------------------------------------
  // Skeleton: one root, a soft body chain, a tapered tail, four readable legs.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.39, -0.28],
    dir: [0, 0.02, 1],
    role: "spine",
  });

  const bodyPath = catmull([
    [0, 0.39, -0.28],
    [0, 0.42, 0.02],
    [0, 0.47, 0.29],
    [0, 0.51, 0.47],
  ]);

  const body = b.chain("spine", bodyPath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.39, -0.28],
    [0, 0.36, -0.55],
    [0, 0.31, -0.88],
    [0, 0.25, -1.17],
    [0, 0.20, -1.39],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const head = b.joint("head", {
    parent: body.joints[body.joints.length - 1],
    at: [0, 0.54, 0.51],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.46, 0.71],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const legTargets = [
    { side: 1, row: "front", root: [0.27, 0.39, 0.25] as [number, number, number], knee: [0.39, 0.20, 0.31] as [number, number, number], foot: [0.47, 0.075, 0.38] as [number, number, number] },
    { side: -1, row: "front", root: [-0.27, 0.39, 0.25] as [number, number, number], knee: [-0.39, 0.20, 0.31] as [number, number, number], foot: [-0.47, 0.075, 0.38] as [number, number, number] },
    { side: 1, row: "back", root: [0.25, 0.37, -0.25] as [number, number, number], knee: [0.39, 0.19, -0.38] as [number, number, number], foot: [0.48, 0.075, -0.46] as [number, number, number] },
    { side: -1, row: "back", root: [-0.25, 0.37, -0.25] as [number, number, number], knee: [-0.39, 0.19, -0.38] as [number, number, number], foot: [-0.48, 0.075, -0.46] as [number, number, number] },
  ];

  const legs: any[] = [];
  for (const item of legTargets) {
    const s = item.side;
    const chain = b.chain(
      `leg${item.row}${s > 0 ? "L" : "R"}`,
      [item.root, item.knee, item.foot],
      {
        parent: hips,
        names: [
          `hip${item.row}${s > 0 ? "L" : "R"}`,
          `knee${item.row}${s > 0 ? "L" : "R"}`,
          `ankle${item.row}${s > 0 ? "L" : "R"}`,
        ],
        role: "leg",
        contact: item.foot,
      },
    );
    legs.push({ ...item, chain });
  }

  // ---------------------------------------------------------------------------
  // Main body and tail. The slightly flattened elliptical sections make it read
  // as a soft aquatic larva rather than a generic lizard.
  // ---------------------------------------------------------------------------

  const bodyTube = b.sweep(body, (t: number) => {
    const r = 0.245 + 0.045 * Math.sin(Math.PI * t);
    return [r, r * 0.78];
  }, {
    color: BODY,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "soft-body",
    sectors: [
      [112, 248, BELLY],
      [-54, 54, BODY_LIGHT],
    ],
  });

  b.sweep(tail, (t: number) => {
    const r = 0.145 * (1 - t) + 0.018;
    return [r * 1.12, r * 0.72];
  }, {
    color: BODY,
    sides: 7,
    caps: "round",
    name: "tapered-tail",
    sectors: [
      [112, 248, BELLY],
      [-55, 55, BODY_LIGHT],
    ],
  });

  // Broad translucent-looking tail fin, kept as opaque flat-color primitive work.
  b.extrude(
    [
      [0, 0],
      [0.58, 0.02],
      [0.49, 0.10],
      [0.30, 0.18],
      [0.03, 0.23],
      [-0.20, 0.16],
      [-0.43, 0.08],
    ],
    {
      at: [0, 0.25, -0.79],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      smoothing: 1,
      color: BODY_LIGHT,
      bone: tail.joints[1],
      name: "tail-fin",
    },
  );

  // Pale belly patch assembled from overlapping simple forms.
  blob([0, 0.345, 0.01], [0.205, 0.055, 0.32], BELLY, body.joints[1], "belly-patch");
  blob([0, 0.40, 0.29], [0.25, 0.075, 0.22], BELLY, body.joints[2], "chest-patch");

  // ---------------------------------------------------------------------------
  // Head: oversized, broad, and unmistakably axolotl-like.
  // ---------------------------------------------------------------------------

  blob([0, 0.56, 0.54], [0.42, 0.34, 0.38], BODY, head, "big-rounded-head");
  blob([0, 0.48, 0.77], [0.29, 0.18, 0.18], BELLY, jaw, "cream-muzzle");

  // Squared cheek pads give the silhouette a cute, blocky puppet quality.
  blob([0.29, 0.50, 0.61], [0.14, 0.16, 0.20], BODY_LIGHT, head, "cheekL");
  blob([-0.29, 0.50, 0.61], [0.14, 0.16, 0.20], BODY_LIGHT, head, "cheekR");

  // Large bead eyes with warm iris rings and tiny catchlights.
  for (const s of [1, -1]) {
    const x = s * 0.165;
    bead([x, 0.655, 0.825], 0.083, EYE_WHITE, head, `eyeWhite${s > 0 ? "L" : "R"}`);
    bead([x, 0.655, 0.892], 0.052, GOLD, head, `iris${s > 0 ? "L" : "R"}`);
    bead([x, 0.655, 0.928], 0.034, PUPIL, head, `pupil${s > 0 ? "L" : "R"}`);
    bead([x - s * 0.012, 0.681, 0.956], 0.012, HIGHLIGHT, head, `eye-glint${s > 0 ? "L" : "R"}`);

    // Tiny brow ridges are simple dark-purple cylinders/sweeps.
    b.sweep(
      catmull([
        [x - s * 0.095, 0.755, 0.845],
        [x, 0.785, 0.878],
        [x + s * 0.085, 0.75, 0.86],
      ]),
      0.012,
      { color: INK, bone: head, sides: 6, caps: "round", name: `brow${s > 0 ? "L" : "R"}` },
    );

    // Two nostrils sit high on the pale muzzle.
    bead([x * 0.72, 0.535, 0.922], 0.012, INK, jaw, `nostril${s > 0 ? "L" : "R"}`);
  }

  // Smiling open mouth: dark inner smile plus a lower pink lip.
  b.sweep(
    bezier(
      [-0.17, 0.465, 0.945],
      [-0.08, 0.425, 0.982],
      [0.08, 0.425, 0.982],
      [0.17, 0.465, 0.945],
    ),
    0.014,
    { color: MOUTH, bone: jaw, sides: 6, caps: "round", name: "happy-mouth" },
  );
  b.sweep(
    bezier(
      [-0.10, 0.445, 0.972],
      [0, 0.415, 0.986],
      [0.10, 0.445, 0.972],
    ),
    0.009,
    { color: GILL_DARK, bone: jaw, sides: 6, caps: "round", name: "lower-lip" },
  );

  // Small cheek freckles emphasize the face.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      bead(
        [s * (0.255 + (i % 2) * 0.035), 0.47 + i * 0.028, 0.835 + (i % 2) * 0.015],
        0.009,
        GILL_DARK,
        head,
        `freckle${s > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Four short splayed legs and chunky toes.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const s = leg.side;
    b.sweep(leg.chain, (t: number) => 0.065 * (1 - t) + 0.046, {
      color: PAW,
      sides: 6,
      caps: "round",
      skin: "smooth",
      name: `leg-${leg.row}-${s > 0 ? "L" : "R"}`,
    });

    blob(leg.foot, [0.105, 0.065, 0.125], PAW, leg.chain.tip, `soft-foot-${leg.row}-${s}`);

    const toeBase: [number, number, number] = [
      leg.foot[0],
      0.065,
      leg.foot[2] + (leg.row === "front" ? 0.07 : -0.055),
    ];
    for (let j = 0; j < 3; j++) {
      const spread = (j - 1) * 0.045;
      const toeTip: [number, number, number] = [
        leg.foot[0] + s * (j - 1) * 0.035,
        0.035,
        toeBase[2] + (leg.row === "front" ? 0.09 : -0.075),
      ];
      b.rod(toeBase, toeTip, 0.018, {
        color: PAW,
        bone: leg.chain.tip,
        caps: "round",
        sides: 6,
        name: `toe-${leg.row}-${s}-${j}`,
      });
      bead(
        [toeTip[0] + spread * 0.3, toeTip[1], toeTip[2]],
        0.021,
        GILL_LIGHT,
        leg.chain.tip,
        `toe-pad-${leg.row}-${s}-${j}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Signature external gills: three pink stalks on each side, each with a
  // broad flat frill and multiple tapering filaments.
  // ---------------------------------------------------------------------------

  const gillRows = [
    { z: 0.39, y: 0.66, out: 0.30, rise: 0.16, w: 0.19, h: 0.22 },
    { z: 0.50, y: 0.70, out: 0.34, rise: 0.22, w: 0.22, h: 0.28 },
    { z: 0.61, y: 0.67, out: 0.31, rise: 0.13, w: 0.18, h: 0.25 },
  ];

  for (const s of [1, -1]) {
    for (let i = 0; i < gillRows.length; i++) {
      const g = gillRows[i];
      const base: [number, number, number] = [s * 0.335, g.y, g.z];
      const crown: [number, number, number] = [
        s * (0.335 + g.out),
        g.y + g.rise,
        g.z - 0.025,
      ];

      // Firm central stalk.
      b.sweep(
        catmull([
          base,
          [s * 0.43, g.y + g.rise * 0.35, g.z - 0.012],
          crown,
        ]),
        [0.034, 0.012],
        {
          color: GILL,
          bone: head,
          sides: 7,
          caps: "round",
          name: `gill-stalk-${s}-${i}`,
        },
      );

      // A wide, low-poly frill blade behind the stalk.
      finBlade(
        [s * 0.40, g.y + g.rise * 0.18, g.z - 0.022],
        s,
        g.w,
        g.h,
        GILL,
        head,
        `gill-frill-${s}-${i}`,
      );

      // Three feathery filaments fan away from each stalk.
      const offsets = [-0.075, 0.0, 0.072];
      for (let k = 0; k < offsets.length; k++) {
        const filamentBase: [number, number, number] = [
          s * (0.39 + k * 0.018),
          g.y + g.rise * (0.20 + k * 0.16),
          g.z + offsets[k] * 0.35,
        ];
        const filamentTip: [number, number, number] = [
          s * (0.56 + (k === 1 ? 0.035 : 0)),
          g.y + g.rise + 0.08 + (k === 1 ? 0.045 : 0),
          g.z + offsets[k],
        ];
        gillFilament(filamentBase, filamentTip, head, `gill-filament-${s}-${i}-${k}`);
      }

      // Dark root bead separates each gill from the cheek.
      bead(base, 0.037, GILL_DARK, head, `gill-root-${s}-${i}`);
    }
  }

  // Tiny dorsal spots and tail freckles, placed as independent readable facets.
  const spots: Array<[number, number, number, number]> = [
    [0.17, 0.64, 0.29, 0.028],
    [-0.18, 0.65, 0.22, 0.024],
    [0.22, 0.56, -0.02, 0.022],
    [-0.24, 0.57, -0.18, 0.027],
    [0.11, 0.50, -0.53, 0.020],
    [-0.12, 0.48, -0.76, 0.017],
    [0.08, 0.39, -1.02, 0.014],
    [-0.07, 0.34, -1.18, 0.012],
  ];
  for (let i = 0; i < spots.length; i++) {
    const [x, y, z, r] = spots[i];
    bead([x, y, z], r, BODY_LIGHT, hips, `body-spot-${i}`);
  }

  // A few softly raised dorsal ridges finish the silhouette.
  for (let i = 0; i < 5; i++) {
    const z = -0.72 + i * 0.20;
    const y = 0.53 - Math.abs(z + 0.25) * 0.035;
    b.spike(
      [0, y, z],
      [0, 0.7, -0.2],
      0.045 - i * 0.004,
      0.025,
      {
        color: BODY_LIGHT,
        bone: i < 2 ? hips : tail.joints[Math.min(i, tail.joints.length - 1)],
        name: `dorsal-nub-${i}`,
      },
    );
  }

  return b.root;
}

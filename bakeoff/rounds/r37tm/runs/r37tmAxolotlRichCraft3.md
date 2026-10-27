```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  countershade,
  gradient,
} from "agentic-3js-builder";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "chibi axolotl",
  description:
    "A cute low-poly axolotl puppet with a plump spotted body, huge shiny eyes, tiny feet, a broad tail, and dramatic frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = cel("#e98cae", "#b85b82");
  const PALE = cel("#ffd8d0", "#e9a6ae");
  const BELLY = furEdge(PALE, PINK, {
    by: "normal",
    level: -0.18,
    teeth: 0.12,
    period: 0.08,
    along: [0, 0, 1],
    ink: "#8e3c62",
    inkWidth: 0.025,
  });
  const DARK_PINK = cel("#b83f72", "#76284c");
  const GILL = cel("#ff8eae", "#c94e7d");
  const GILL_TIP = cel("#ffb8c7", "#df6b91");
  const EYE_INK = INK;
  const MOUTH = "#5d203f";
  const SPOT = "#c35c83";
  const PAW = cel("#f2a5b5", "#c96d8b");
  const WHITE = "#fff8ed";
  const BLACK = "#241426";
  const IRIS = "#713eaa";

  const coat = countershade(BELLY, PALE, { level: -0.2, soft: 0.28 });
  const spottedCoat = paint((p, n) => {
    const stripe =
      Math.sin(p.z * 31 + Math.sin(p.x * 9) * 1.5) > 0.82 &&
      p.y > 0.22;
    if (stripe) return SPOT;
    return n.y < -0.15 ? PALE : coat;
  });

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: one spine root, a tail, a head, a jaw, and four short resting legs.

  const hips = b.joint("hips", {
    at: [0, 0.30, -0.20],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.30, -0.48],
    [0, 0.34, -0.20],
    [0, 0.36, 0.06],
    [0, 0.40, 0.25],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "spineMid", "spineFront"],
    role: "spine",
    group: "body",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.47, 0.34],
    dir: [0, 0.04, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.39, 0.48],
    dir: [0, -0.13, 1],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.30, -0.35],
    [0, 0.28, -0.62],
    [0, 0.24, -0.92],
    [0, 0.18, -1.22],
    [0, 0.13, -1.48],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "body",
  });

  const legData = [
    {
      side: 1,
      name: "frontL",
      root: [0.19, 0.31, 0.18] as [number, number, number],
      knee: [0.25, 0.14, 0.25] as [number, number, number],
      foot: [0.27, 0.055, 0.29] as [number, number, number],
    },
    {
      side: -1,
      name: "frontR",
      root: [-0.19, 0.31, 0.18] as [number, number, number],
      knee: [-0.25, 0.14, 0.25] as [number, number, number],
      foot: [-0.27, 0.055, 0.29] as [number, number, number],
    },
    {
      side: 1,
      name: "hindL",
      root: [0.20, 0.30, -0.25] as [number, number, number],
      knee: [0.29, 0.14, -0.34] as [number, number, number],
      foot: [0.30, 0.055, -0.39] as [number, number, number],
    },
    {
      side: -1,
      name: "hindR",
      root: [-0.20, 0.30, -0.25] as [number, number, number],
      knee: [-0.29, 0.14, -0.34] as [number, number, number],
      foot: [-0.30, 0.055, -0.39] as [number, number, number],
    },
  ];

  const legs = legData.map((d) =>
    b.chain(
      d.name,
      [d.root, d.knee, d.foot],
      {
        parent: hips,
        names: [`hip${d.name.endsWith("L") ? "L" : "R"}`, `knee${d.name.endsWith("L") ? "L" : "R"}${d.name.startsWith("front") ? "F" : "H"}`, `ankle${d.name.endsWith("L") ? "L" : "R"}${d.name.startsWith("front") ? "F" : "H"}`],
        role: "leg",
        contact: d.foot,
        group: "legs",
      },
    ),
  );

  // -----------------------------------------------------------------------------------------------
  // Main soft puppet silhouette.

  const body = b.sweep(spine, (t) => 0.18 + 0.035 * Math.sin(t * Math.PI), {
    color: spottedCoat,
    sides: 8,
    smooth: false,
    caps: "round",
    group: "body",
    name: "plump-body",
  });

  b.sweep(tail, (t) => 0.15 * (1 - t) + 0.018, {
    color: gradient(spottedCoat, PALE, tailPath.at(0.62), tailPath.at(1)),
    sides: 7,
    smooth: false,
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "tapered-tail",
  });

  // Tail fin: a broad, simple low-poly fin gives the axolotl a strong silhouette.
  b.extrude(
    [
      [0, 0],
      [0.08, 0.10],
      [0.22, 0.22],
      [0.40, 0.31],
      [0.67, 0.35],
      [0.90, 0.25],
      [1.12, 0.08],
      [1.26, 0, "sharp"],
      [0.98, -0.07],
      [0.72, -0.13],
      [0.40, -0.12],
      [0.18, -0.07],
    ],
    {
      at: tail.at(0.18).at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: cel("#ec91ad", "#b64f76"),
      bone: tail.joints[1],
      group: "tail",
      name: "tail-fin",
    },
  );

  // A small line of dorsal finlets along the tail.
  b.along(tail, 6, (at) =>
    b.spike(at, at, 0.07 * (1 - at.t * 0.55), 0.025, {
      color: GILL,
      group: "tail",
      name: "tail-finlet",
    }),
  );

  // Stubby legs and toes.
  legs.forEach((leg, i) => {
    b.sweep(leg, [0.065, 0.047], {
      color: PAW,
      sides: 6,
      smooth: false,
      caps: "round",
      group: "legs",
      name: `leg-${i}`,
    });

    const foot = leg.at(1);
    b.part(new THREE.SphereGeometry(0.065, 8, 5), PAW, {
      bone: leg.tip,
      at: foot.at,
      scale: [1.15, 0.58, 1.35],
      group: "legs",
      name: `soft-foot-${i}`,
    });

    for (let toe = -1; toe <= 1; toe++) {
      const x = foot.at.x + toe * 0.034;
      const z = foot.at.z + (i < 2 ? 0.046 : -0.052);
      b.spike(
        [x, 0.048, z],
        [0, 0, i < 2 ? 1 : -1],
        0.075,
        0.014,
        {
          color: PAW,
          caps: "point",
          group: "legs",
          name: `toe-${i}-${toe}`,
        },
      );
    }
  });

  // -----------------------------------------------------------------------------------------------
  // Oversized chibi head, cheeks, muzzle, jaw, and mouth.

  const skull = b.part(
    new THREE.SphereGeometry(0.25, 14, 10),
    spottedCoat,
    {
      bone: head,
      at: [0, 0.48, 0.40],
      scale: [1.08, 0.95, 1.05],
      group: "head",
      name: "round-head",
    },
  );

  const cheekL = b.part(
    new THREE.SphereGeometry(0.13, 9, 7),
    PALE,
    {
      bone: head,
      at: [0.115, 0.405, 0.555],
      scale: [1.05, 0.78, 0.72],
      group: "face",
      name: "cheek-L",
    },
  );
  const cheekR = b.part(
    new THREE.SphereGeometry(0.13, 9, 7),
    PALE,
    {
      bone: head,
      at: [-0.115, 0.405, 0.555],
      scale: [1.05, 0.78, 0.72],
      group: "face",
      name: "cheek-R",
    },
  );

  b.part(new THREE.SphereGeometry(0.11, 9, 6), PALE, {
    bone: jaw,
    at: [0, 0.38, 0.57],
    scale: [1.20, 0.44, 0.88],
    group: "face",
    name: "lower-jaw",
  });

  b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK_PINK, {
    bone: head,
    at: [0, 0.438, 0.665],
    scale: [1.15, 0.72, 0.72],
    group: "face",
    name: "button-nose",
  });

  b.sweep(
    catmull([
      [-0.075, 0.395, 0.657],
      [0, 0.382, 0.681],
      [0.075, 0.395, 0.657],
    ]),
    0.009,
    {
      color: MOUTH,
      bone: jaw,
      sides: 5,
      caps: "round",
      group: "face",
      name: "smiling-mouth",
    },
  );

  // Tiny lower lip highlights.
  b.part(new THREE.SphereGeometry(0.014, 6, 4), PALE, {
    bone: jaw,
    at: [-0.048, 0.375, 0.678],
    group: "face",
    name: "lip-highlight-L",
  });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), PALE, {
    bone: jaw,
    at: [0.048, 0.375, 0.678],
    group: "face",
    name: "lip-highlight-R",
  });

  // -----------------------------------------------------------------------------------------------
  // Huge expressive anime eyes, seated on the actual skull surface.

  const eyeTexture = animeEye({
    iris: IRIS,
    irisLight: "#d99cff",
    irisDark: "#3b1c71",
    ink: EYE_INK,
    blush: "#f47f9c",
    brow: true,
    size: 384,
  });

  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSurface.around([0, 0.49, 0.40]).at(s * 32, 8);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.105, 0.145],
        dir: hit.n,
        up: [0, 1, 0],
        mirror: s > 0,
        lift: 0.004,
        segments: 8,
        group: "face",
        name: s > 0 ? "big-eye-L" : "big-eye-R",
      });
    }
  }

  // Freckles on the pale cheeks, attached by surface hits rather than floating in front.
  const cheekSurface = b.surface([cheekL, cheekR]);
  const freckles = cheekSurface.scatter(14, {
    rng: rng(91),
    minDist: 0.025,
    filter: (h) => h.n.z > 0.25,
  });
  for (const h of freckles) {
    b.stick(
      new THREE.SphereGeometry(0.009, 5, 4),
      SPOT,
      h,
      { embed: 0.35, group: "face", name: "cheek-freckle" },
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Frilly pink external gills: six broad, serrated feather blades plus darker support stalks.

  const gillBlade = [
    [0, 0],
    [0.035, 0.045],
    [0.075, 0.11],
    [0.13, 0.165],
    [0.185, 0.18],
    [0.225, 0.135],
    [0.255, 0.19, "sharp"] as [number, number, "sharp"],
    [0.285, 0.12],
    [0.31, 0.165, "sharp"] as [number, number, "sharp"],
    [0.30, 0.055],
    [0.255, 0.09, "sharp"] as [number, number, "sharp"],
    [0.20, 0.035],
    [0.13, -0.005],
    [0.06, -0.012],
  ];

  for (const s of [1, -1]) {
    const outward = [s, 0, 0] as [number, number, number];
    const planeX = [0, 0, -s] as [number, number, number];

    for (let k = 0; k < 3; k++) {
      const base: [number, number, number] = [
        s * (0.205 + k * 0.022),
        0.53 + k * 0.045,
        0.285 - k * 0.035,
      ];

      b.rod(
        base,
        [
          base[0] + s * (0.025 + k * 0.012),
          base[1] + 0.18 + k * 0.015,
          base[2] - 0.045 - k * 0.025,
        ],
        0.018,
        {
          color: DARK_PINK,
          caps: "round",
          group: "gills",
          name: `gill-stalk-${s}-${k}`,
        },
      );

      b.extrude(gillBlade, {
        at: base,
        x: planeX,
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 0,
        color: k === 1 ? GILL_TIP : GILL,
        bone: head,
        group: "gills",
        name: `frilly-gill-${s}-${k}`,
      });

      // A few pronounced triangular lobes along each frill edge.
      for (let j = 0; j < 3; j++) {
        const p: [number, number, number] = [
          base[0] + s * (0.105 + j * 0.055),
          base[1] + 0.055 + j * 0.04,
          base[2] - 0.02,
        ];
        b.spike(p, outward, 0.065 - j * 0.008, 0.018, {
          color: GILL_TIP,
          group: "gills",
          name: `gill-lobe-${s}-${k}-${j}`,
        });
      }
    }

    // A rounded gill root collar makes the frills visibly grow from the skull.
    b.part(new THREE.SphereGeometry(0.055, 8, 6), DARK_PINK, {
      bone: head,
      at: [s * 0.225, 0.52, 0.30],
      scale: [0.75, 1.25, 0.75],
      group: "gills",
      name: `gill-root-${s}`,
    });
  }

  // A small pair of pale head spots behind the eyes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.027, 7, 5), PALE, {
      bone: head,
      at: [s * 0.19, 0.66, 0.35],
      scale: [1.0, 0.7, 0.35],
      group: "head",
      name: `head-spot-${s}`,
    });
  }

  // -----------------------------------------------------------------------------------------------
  // Surface-seated decorative spots on the body and a warm glowing gill accent.

  const bodySurface = b.surface(body);
  const spots = bodySurface.scatter(22, {
    rng: rng(12),
    minDist: 0.065,
    filter: (h) => h.n.y > -0.25 && h.at.z < 0.22,
  });

  for (const h of spots) {
    b.stick(
      new THREE.SphereGeometry(0.018, 6, 4),
      SPOT,
      h,
      {
        embed: 0.48,
        scale: [1.3, 0.55, 1],
        group: "body",
        name: "body-spot",
      },
    );
  }

  // Small luminous pink tips make the signature gills pop under showcase lighting.
  for (const s of [1, -1]) {
    const glowPart = b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      "#ffb7cf",
      {
        bone: head,
        at: [s * 0.49, 0.73, 0.19],
        group: "gills",
        name: `gill-glow-${s}`,
      },
    );
    glow(glowPart, 1.3);
  }

  return b.root;
}
```
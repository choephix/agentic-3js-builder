```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A brightly painted Oaxacan alebrije: a spotted jaguar body with an eagle head, hooked beak, spread feathered wings, patterned tail, claws, and carved-wood ornament.",
};

const GOLD = "#d99b25";
const SUN = "#f4c83d";
const ORANGE = "#e76525";
const RED = "#c93528";
const TURQUOISE = "#20a9a1";
const BLUE = "#2369a8";
const DEEP_BLUE = "#193c72";
const PURPLE = "#713d91";
const MAGENTA = "#b73570";
const GREEN = "#4c9a48";
const CREAM = "#f3d99c";
const PALE = "#fff0c2";
const BROWN = "#6b351f";
const DARK = "#241727";
const BLACK = "#17131c";
const WHITE = "#fff8df";

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: THREE.Vector3 | [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function ball(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  bone?: any,
  scale?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function cone(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  color: string,
  at: any,
  bone?: any,
  dir: [number, number, number] = [0, 1, 0],
  name?: string,
) {
  return b.part(new THREE.ConeGeometry(radius, height, 7), color, {
    at,
    bone,
    dir,
    name,
    flat: true,
  });
}

function stripe(
  b: ReturnType<typeof createBuilder>,
  center: any,
  axis: [number, number, number],
  length: number,
  color: string,
  bone?: any,
) {
  return b.rod(center, center, 0.012, {
    color,
    bone,
    extend: length / 2,
    caps: "flat",
    dir: axis,
  });
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact jaguar torso, four planted legs, neck, jaw, tail,
  // and two broad resting wings.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.78, -0.25],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [-0.02, 0.78, -0.62],
    [0, 0.82, -0.32],
    [0, 0.88, 0.02],
    [0, 0.96, 0.31],
    [0, 1.03, 0.48],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["rump", "spine", "chest", "shoulder", "neckBase"],
    role: "spine",
    count: 5,
  });

  const neckPath = catmull([
    [0, 1.03, 0.45],
    [0, 1.20, 0.53],
    [0, 1.37, 0.58],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip ?? spine.joints[spine.joints.length - 1],
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
    count: 3,
  });

  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 1.42, 0.61],
    dir: [0, 0.02, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.35, 0.76],
    dir: [0, -0.20, 0.98],
    role: "jaw",
    group: "face",
  });

  const legTargets: [number, number, number][] = [
    [0.30, 0.13, -0.53],
    [-0.30, 0.13, -0.53],
    [0.28, 0.13, 0.34],
    [-0.28, 0.13, 0.34],
  ];
  const legRoots: [number, number, number][] = [
    [0.24, 0.76, -0.35],
    [-0.24, 0.76, -0.35],
    [0.24, 0.88, 0.28],
    [-0.24, 0.88, 0.28],
  ];
  const legNames = [
    ["hipL", "kneeL", "ankleL", "pawL"],
    ["hipR", "kneeR", "ankleR", "pawR"],
    ["shoulderL", "elbowL", "wristL", "talonL"],
    ["shoulderR", "elbowR", "wristR", "talonR"],
  ];
  const legs: any[] = [];
  for (let i = 0; i < 4; i++) {
    const left = legRoots[i][0] > 0;
    const hind = i < 2;
    const pts = limb(
      legRoots[i],
      legTargets[i],
      hind ? [0.27, 0.27, 0.20] : [0.25, 0.25, 0.19],
      hind
        ? [
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 0, -1],
            [0, 0, 1],
          ],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(`leg${left ? "L" : "R"}${hind ? "H" : "F"}`, pts, {
      parent: hips,
      names: legNames[i],
      role: "leg",
      contact: legTargets[i],
      count: 4,
    });
    legs.push(chain);
  }

  const tailPath = catmull([
    [0, 0.76, -0.55],
    [0, 0.69, -0.87],
    [0.04, 0.73, -1.18],
    [0.12, 0.88, -1.44],
    [0.20, 1.06, -1.60],
    [0.25, 1.18, -1.68],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    count: 6,
  });

  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const wingPath = catmull([
      [s * 0.30, 1.02, 0.26],
      [s * 0.54, 1.16, 0.25],
      [s * 0.82, 1.37, 0.16],
      [s * 1.12, 1.46, 0.03],
      [s * 1.36, 1.33, -0.05],
    ]);
    wingChains.push(
      b.chain(`wing${s > 0 ? "L" : "R"}`, wingPath, {
        parent: spine.joints[3],
        names: [
          `wingRoot${s > 0 ? "L" : "R"}`,
          `wingMid${s > 0 ? "L" : "R"}`,
          `wingTip${s > 0 ? "L" : "R"}`,
          `wingFeather${s > 0 ? "L" : "R"}`,
          `wingEnd${s > 0 ? "L" : "R"}`,
        ],
        role: "wing",
        count: 5,
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Main carved wooden silhouette.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.28 - 0.055 * Math.abs(t - 0.42), {
    bone: spine,
    color: ORANGE,
    section: { ngon: 8 },
    caps: "round",
    name: "paintedJaguarBody",
  });

  b.sweep(neck, [0.22, 0.17], {
    bone: neck,
    color: GOLD,
    section: { ngon: 8 },
    caps: "round",
    name: "paintedNeck",
  });

  b.sweep(tail, (t) => 0.17 * (1 - t) + 0.035, {
    bone: tail,
    color: ORANGE,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "paintedTail",
  });

  for (let i = 0; i < legs.length; i++) {
    b.sweep(legs[i], (t: number) => (i < 2 ? 0.105 : 0.09) * (1 - 0.28 * t), {
      bone: legs[i],
      color: GOLD,
      section: { ngon: 7 },
      caps: "round",
      name: `legFur${i}`,
    });
  }

  // Belly and cheek color fields, built as broad surface patches.
  const belly = b.surface(body);
  for (const p of [
    [0, 0.61, -0.38],
    [0, 0.62, -0.08],
    [0, 0.68, 0.20],
  ]) {
    const h = belly.nearest(p);
    if (h) b.stick(new THREE.SphereGeometry(0.16, 8, 5), CREAM, h, { embed: 0.46 });
  }

  // ---------------------------------------------------------------------------
  // Jaguar legs, paws, toe pads, and painted ankle cuffs.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legs.length; i++) {
    const s = legTargets[i][0] > 0 ? 1 : -1;
    const p = legTargets[i];
    const bone = legs[i].tip ?? legs[i].joints[legs[i].joints.length - 1];

    ball(b, 0.125, BROWN, [p[0], 0.12, p[2]], bone, [1.15, 0.55, 1.35], `paw${i}`);
    ball(b, 0.055, PALE, [p[0], 0.105, p[2] + 0.025], bone, [1.3, 0.24, 1.15], `pawPad${i}`);

    for (let j = -1; j <= 1; j++) {
      const toeX = p[0] + j * 0.052;
      const toeZ = p[2] + 0.075;
      b.sweep(
        bezier(
          [toeX, 0.115, toeZ],
          [toeX, 0.09, toeZ + 0.045],
          [toeX + s * 0.012, 0.072, toeZ + 0.095],
        ),
        [0.035, 0.006],
        { bone, color: CREAM, caps: { start: "round", end: "point" }, name: `toe${i}_${j}` },
      );
    }

    const cuffAt = legs[i].at(0.62);
    b.ring(cuffAt, { count: 8, radius: 0.088, fromDeg: 0, toDeg: 360 }, (r: any) =>
      b.part(new THREE.SphereGeometry(0.018, 6, 4), RED, { frame: r, name: `anklePaint${i}` }),
    );
  }

  // ---------------------------------------------------------------------------
  // Eagle head: angular skull, cream throat, brow ridges, beak and nostrils.
  // ---------------------------------------------------------------------------

  const skull = ball(
    b,
    0.27,
    GOLD,
    [0, 1.46, 0.66],
    head,
    [0.92, 1.05, 1.12],
    "eagleJaguarSkull",
  );
  const skullSurface = b.surface(skull);

  // Cream throat and muzzle planes.
  ball(b, 0.16, CREAM, [0, 1.34, 0.74], jaw, [1.18, 0.72, 0.72], "creamThroat");
  ball(b, 0.13, PALE, [0, 1.43, 0.85], head, [1.35, 0.76, 0.72], "muzzleBase");

  // Huge alert eyes, dark rims, amber irises, white glints.
  for (const s of [1, -1]) {
    const eyeAt = [s * 0.105, 1.51, 0.82] as [number, number, number];
    ball(b, 0.073, BLACK, eyeAt, head, [1.0, 1.0, 0.48], `eyeRim${s}`);
    ball(b, 0.052, SUN, [s * 0.106, 1.512, 0.842], head, [1.0, 1.0, 0.42], `eyeGold${s}`);
    ball(b, 0.025, BLACK, [s * 0.106, 1.512, 0.863], head, [0.72, 1.0, 0.30], `eyePupil${s}`);
    ball(b, 0.012, WHITE, [s * 0.088, 1.543, 0.873], head, [0.8, 0.65, 0.3], `eyeSpark${s}`);

    b.sweep(
      bezier(
        [s * 0.17, 1.59, 0.79],
        [s * 0.10, 1.625, 0.83],
        [s * 0.035, 1.60, 0.82],
      ),
      [0.022, 0.012],
      { bone: head, color: DARK, caps: "round", name: `brow${s}` },
    );

    // Three painted cheek rosettes per side.
    for (let j = 0; j < 3; j++) {
      const y = 1.39 + j * 0.055;
      const z = 0.77 + j * 0.035;
      ball(b, 0.027, j === 1 ? TURQUOISE : RED, [s * (0.205 - j * 0.012), y, z], head, [0.45, 1, 0.2], `cheekMark${s}_${j}`);
      ball(b, 0.010, CREAM, [s * (0.216 - j * 0.012), y, z + 0.012], head, [0.5, 1, 0.2], `cheekDot${s}_${j}`);
    }
  }

  // Beak is a separate upper and lower jaw, opened slightly for rigging.
  b.sweep(
    bezier(
      [0, 1.48, 0.83],
      [0, 1.47, 1.00],
      [0, 1.43, 1.13],
    ),
    [0.12, 0],
    { bone: head, color: RED, caps: { start: "round", end: "point" }, name: "upperHookedBeak" },
  );
  b.sweep(
    bezier(
      [0, 1.39, 0.83],
      [0, 1.35, 0.96],
      [0, 1.37, 1.07],
    ),
    [0.085, 0],
    { bone: jaw, color: ORANGE, caps: { start: "round", end: "point" }, name: "lowerBeak" },
  );
  ball(b, 0.029, BLACK, [0.038, 1.485, 0.965], head, [0.45, 0.55, 0.42], "nostrilL");
  ball(b, 0.029, BLACK, [-0.038, 1.485, 0.965], head, [0.45, 0.55, 0.42], "nostrilR");
  b.rod([0, 1.40, 0.87], [0, 1.39, 0.94], 0.009, { bone: jaw, color: DARK, name: "mouthLine" });

  // Jaguar ears with bright inner ear and small painted spikes.
  for (const s of [1, -1]) {
    const ear = b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.12, 0.22],
        [0.02, 0.30],
        [-0.04, 0.14],
      ],
      {
        at: [s * 0.18, 1.60, 0.57],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.065,
        bevel: 0.012,
        color: ORANGE,
        bone: head,
        name: `ear${s}`,
      },
    );
    b.stick(new THREE.ConeGeometry(0.045, 0.13, 6), MAGENTA, ear.moved([0.02, 0.08, 0.034]), {
      embed: 0.15,
      bone: head,
      name: `earInner${s}`,
    });
    cone(b, 0.025, 0.10, TURQUOISE, [s * 0.18, 1.78, 0.57], head, [0, 1, 0], `earTip${s}`);
  }

  // Crown of carved feathers and a forehead diamond.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.065;
    const c = [RED, TURQUOISE, BLUE, MAGENTA, RED][i];
    b.sweep(
      bezier(
        [x, 1.62, 0.59],
        [x * 1.08, 1.76 + (i % 2) * 0.025, 0.60],
        [x * 1.18, 1.88 + (i % 2) * 0.04, 0.56],
      ),
      [0.035, 0],
      { bone: head, color: c, caps: { start: "round", end: "point" }, name: `crownFeather${i}` },
    );
  }
  b.extrude(
    [
      [0, 0],
      [0.07, 0.06],
      [0, 0.14],
      [-0.07, 0.06],
    ],
    {
      at: [0, 1.58, 0.91],
      x: [1, 0, 0],
      thickness: 0.018,
      color: TURQUOISE,
      bone: head,
      name: "foreheadDiamond",
    },
  );

  // ---------------------------------------------------------------------------
  // Spread wings: colorful membranes plus distinct carved primary feathers.
  // ---------------------------------------------------------------------------

  for (let wi = 0; wi < wingChains.length; wi++) {
    const s = wi === 0 ? 1 : -1;
    const wing = wingChains[wi];

    const lowerEdge = catmull([
      [s * 0.32, 0.98, 0.23],
      [s * 0.59, 1.01, 0.10],
      [s * 0.90, 1.13, -0.04],
      [s * 1.28, 1.12, -0.15],
    ]);
    b.membrane(wing.path.slice(0, 0.82), lowerEdge, {
      color: TURQUOISE,
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.12,
      bone: wing,
      name: `wingMembrane${s}`,
    });

    // Leading edge dark rail.
    b.sweep(wing, [0.048, 0.018], {
      bone: wing,
      color: DEEP_BLUE,
      section: { ngon: 6 },
      caps: "round",
      name: `wingLeadingEdge${s}`,
    });

    for (let j = 0; j < 7; j++) {
      const t = j / 6;
      const base = wing.at(t).at;
      const tip = new THREE.Vector3(
        s * (0.55 + j * 0.14),
        1.25 + Math.sin(t * Math.PI) * 0.23 - j * 0.015,
        -0.02 - j * 0.065,
      );
      const featherColor = [BLUE, RED, SUN, MAGENTA, BLUE, ORANGE, PURPLE][j];
      b.sweep(
        bezier(
          base,
          [base.x + s * 0.08, base.y + 0.08, base.z - 0.02],
          [tip.x - s * 0.08, tip.y + 0.04, tip.z + 0.02],
          tip,
        ),
        [0.055 - j * 0.004, 0.008],
        {
          bone: wing,
          color: featherColor,
          caps: { start: "round", end: "point" },
          name: `primaryFeather${s}_${j}`,
        },
      );
      ball(b, 0.018, CREAM, tip, wing.tip ?? wing.joints[wing.joints.length - 1], [1, 0.7, 1], `featherDot${s}_${j}`);
    }

    // Three painted eye-spots on each wing.
    for (let j = 0; j < 3; j++) {
      const at = wing.at(0.32 + j * 0.17).at;
      ball(b, 0.075, RED, at, wing.at(0.32 + j * 0.17).bone, [1.0, 0.28, 0.55], `wingEyeOuter${s}_${j}`);
      ball(b, 0.042, SUN, [at.x, at.y + 0.006, at.z + 0.012], wing.at(0.32 + j * 0.17).bone, [1.0, 0.3, 0.55], `wingEyeInner${s}_${j}`);
      ball(b, 0.015, BLACK, [at.x, at.y + 0.010, at.z + 0.020], wing.at(0.32 + j * 0.17).bone, [1, 0.3, 0.5], `wingEyePupil${s}_${j}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Tail bands, tail plume, and alebrije surface ornament.
  // ---------------------------------------------------------------------------

  b.sweep(tail, [0.18, 0.15], {
    bone: tail,
    color: ORANGE,
    bands: [
      [0.18, TURQUOISE],
      [0.34, RED],
      [0.50, SUN],
      [0.67, BLUE],
      [0.82, MAGENTA],
    ],
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "tailColorBands",
  });

  for (let i = 0; i < 7; i++) {
    const t = 0.68 + i * 0.045;
    const at = tail.at(t).at;
    const s = i % 2 === 0 ? 1 : -1;
    b.sweep(
      bezier(
        at,
        [at.x + s * 0.07, at.y + 0.08, at.z - 0.03],
        [at.x + s * 0.11, at.y + 0.11, at.z - 0.08],
      ),
      [0.032, 0.004],
      { bone: tail.at(t).bone, color: [SUN, RED, TURQUOISE, CREAM][i % 4], caps: { start: "round", end: "point" }, name: `tailPlume${i}` },
    );
  }

  // Jagged painted rings along the torso.
  for (let i = 0; i < 5; i++) {
    const t = 0.12 + i * 0.18;
    const cp = spine.at(t);
    b.ring(cp, { count: 9, radius: 0.255, fromDeg: 20, toDeg: 340 }, (r: any) => {
      if (r.i % 3 === 0) {
        return b.part(new THREE.ConeGeometry(0.026, 0.07, 5), [BLUE, RED, TURQUOISE][i % 3], {
          frame: r,
          name: `bodyScallop${i}_${r.i}`,
        });
      }
      return undefined as any;
    });
  }

  // Dozens of small carved rosettes on the body surface.
  const spotHits = b.surface(body).scatter(34, {
    rng: rng(41),
    minDist: 0.095,
    filter: (h: any) => h.n.y > -0.55,
  });
  spotHits.forEach((h: any, i: number) => {
    const col = [TURQUOISE, BLUE, MAGENTA, SUN, CREAM][i % 5];
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 7), col, h, {
      embed: 0.32,
      name: `bodyRosette${i}`,
    });
    if (i % 2 === 0) {
      const inner = h.moved([0, 0.008, 0]);
      b.stick(new THREE.SphereGeometry(0.012, 6, 4), DARK, inner, {
        embed: 0.2,
        name: `bodyRosetteCore${i}`,
      });
    }
  });

  // Painted slashes on the neck and cheek, like hand-brushed wood grain.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const a = [s * (0.18 + i * 0.018), 1.17 + i * 0.045, 0.57] as [number, number, number];
      b.sweep(
        bezier(a, [a[0] + s * 0.025, a[1] + 0.018, a[2] + 0.025], [a[0] + s * 0.045, a[1] + 0.035, a[2] + 0.035]),
        [0.012, 0.005],
        { bone: neck.joints[1], color: [RED, BLUE, MAGENTA, CREAM][i], caps: { start: "round", end: "point" }, name: `neckBrush${s}_${i}` },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Chest ornament, wooden medallion, and tiny decorative studs.
  // ---------------------------------------------------------------------------

  b.extrude(
    [
      [0, 0],
      [0.14, 0.03],
      [0.12, 0.19],
      [0, 0.28],
      [-0.12, 0.19],
      [-0.14, 0.03],
    ],
    {
      at: [0, 0.97, 0.55],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: BLUE,
      bone: spine.tip ?? spine.joints[3],
      name: "chestMedallion",
    },
  );
  ball(b, 0.065, SUN, [0, 1.12, 0.575], spine.joints[3], [1, 1, 0.22], "medallionSun");
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      ball(
        b,
        0.014,
        i % 2 ? RED : CREAM,
        [s * (0.09 + i * 0.035), 1.01 + i * 0.022, 0.565],
        spine.joints[3],
        [1, 0.8, 0.25],
        `chestStud${s}_${i}`,
      );
    }
  }

  // A few wood-carved dark seams emphasize the silhouette.
  b.rod([-0.22, 0.73, -0.42], [0.22, 0.73, -0.42], 0.012, {
    color: BROWN,
    bone: hips,
    name: "rumpCarving",
  });
  b.rod([-0.19, 1.08, 0.43], [0.19, 1.08, 0.43], 0.010, {
    color: BROWN,
    bone: spine.joints[3],
    name: "shoulderCarving",
  });

  return b.root;
}
```
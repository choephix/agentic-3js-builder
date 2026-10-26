```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";
import { animeEye } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description: "A brightly painted Oaxacan alebrije combining a spotted jaguar body with an eagle's wings, beak, talons, and feather crest.",
};

const WOOD = "#d87326";
const WOOD_DARK = "#8e2f24";
const GOLD = "#f4b52c";
const CREAM = "#f7e0a0";
const TURQUOISE = "#19a9a2";
const CYAN = "#36d6ca";
const MAGENTA = "#bd2e78";
const PURPLE = "#542c86";
const SCARLET = "#d73726";
const GREEN = "#4e9a45";
const INK = "#321626";
const BLACK = "#17121a";
const CLAW = "#f4d68b";
const BEAK = "#e99d28";
const EYE = animeEye({ iris: "#16c6bd", irisLight: "#b5fff1", irisDark: "#126b78", size: 256 });

function sphere(
  b: ReturnType<typeof createBuilder>,
  at: any,
  scale: [number, number, number],
  color: string,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  at: any,
  size: [number, number, number],
  color: string,
  bone?: any,
  rotation?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    rotation,
    flat: true,
    name,
  });
}

function stripe(
  b: ReturnType<typeof createBuilder>,
  a: any,
  c: any,
  radius: number,
  color: string,
  bone?: any,
  name?: string,
) {
  return b.rod(a, c, radius, { color, bone, section: { ngon: 5 }, caps: "flat", name });
}

function feather(
  b: ReturnType<typeof createBuilder>,
  base: any,
  tip: any,
  width: number,
  color: string,
  bone?: any,
  name?: string,
) {
  const d = new THREE.Vector3(tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]).normalize();
  const side = new THREE.Vector3(-d.z, 0, d.x).normalize();
  const p0 = new THREE.Vector3(...base);
  const p1 = new THREE.Vector3(...tip);
  const mid = p0.clone().lerp(p1, 0.52);
  const outline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [width * 0.55, 0.11, "sharp"],
    [width * 0.38, 0.58, "sharp"],
    [0, 1, "sharp"],
    [-width * 0.38, 0.58, "sharp"],
    [-width * 0.55, 0.11, "sharp"],
  ];
  return b.extrude(outline, {
    at: mid,
    x: side,
    y: d,
    thickness: 0.014,
    bevel: 0.003,
    color,
    bone,
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: a compact jaguar torso, four grounded legs, long tail, and wings.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.83, -0.02], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.83, -0.18],
      [0, 0.91, 0.1],
      [0, 0.98, 0.34],
      [0, 1.04, 0.55],
    ]),
    {
      parent: hips,
      names: ["pelvis", "ribcage", "shoulders", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.04, 0.55],
      [0, 1.16, 0.67],
      [0, 1.27, 0.72],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.31, 0.76],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.22, 0.84],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.82, -0.2],
      [0, 0.75, -0.54],
      [0.03, 0.69, -0.88],
      [-0.02, 0.77, -1.18],
      [0.1, 0.91, -1.42],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    { s: 1, z: 0.28, names: ["hipL", "kneeL", "ankleL", "pawL"] },
    { s: -1, z: 0.28, names: ["hipR", "kneeR", "ankleR", "pawR"] },
    { s: 1, z: -0.18, names: ["rearHipL", "rearKneeL", "rearAnkleL", "rearPawL"] },
    { s: -1, z: -0.18, names: ["rearHipR", "rearKneeR", "rearAnkleR", "rearPawR"] },
  ];

  const legs: any[] = [];
  for (const leg of legData) {
    const x = leg.s * 0.2;
    const pts = [
      [x, 0.83, leg.z],
      [leg.s * 0.28, 0.53, leg.z + (leg.z > 0 ? 0.07 : -0.04)],
      [leg.s * 0.24, 0.25, leg.z + (leg.z > 0 ? 0.03 : -0.07)],
      [leg.s * 0.24, 0.105, leg.z + (leg.z > 0 ? 0.05 : -0.08)],
    ];
    const chain = b.chain(leg.names[0], pts, {
      parent: hips,
      names: leg.names,
      role: "leg",
      contact: pts[3] as [number, number, number],
    });
    legs.push({ chain, s: leg.s, z: leg.z });
  }

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.28, 1.01, 0.43],
      [0.62, 1.18, 0.36],
      [1.02, 1.27, 0.18],
      [1.38, 1.18, -0.04],
    ]),
    { parent: spine.joints[2], names: ["wingShoulderL", "wingArmL", "wingHandL", "wingTipL"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.28, 1.01, 0.43],
      [-0.62, 1.18, 0.36],
      [-1.02, 1.27, 0.18],
      [-1.38, 1.18, -0.04],
    ]),
    { parent: spine.joints[2], names: ["wingShoulderR", "wingArmR", "wingHandR", "wingTipR"], role: "wing" },
  );

  // ---------------------------------------------------------------------------
  // Main painted wood volumes.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, [0.28, 0.32, 0.25, 0.21], {
    color: WOOD,
    section: { ngon: 8 },
    caps: "round",
    name: "jaguarBody",
  });

  b.sweep(neck, [0.19, 0.17, 0.15], {
    color: WOOD_DARK,
    section: { ngon: 7 },
    caps: "round",
    name: "paintedNeck",
  });

  const headPart = sphere(b, [0, 1.31, 0.76], [0.3, 0.27, 0.31], WOOD, head, "jaguarHead");
  sphere(b, [0, 1.23, 0.91], [0.22, 0.16, 0.18], CREAM, jaw, "creamMuzzle");
  sphere(b, [0, 1.22, 1.045], [0.105, 0.07, 0.055], BLACK, jaw, "nose");

  b.sweep(jaw ? [[0, 1.22, 0.84], [0, 1.18, 0.98]] : [], 0.025, {
    color: INK,
    bone: jaw,
    caps: "flat",
    name: "openMouth",
  });

  // Four chunky feline legs.
  for (const leg of legs) {
    b.sweep(leg.chain, [0.105, 0.09, 0.07], {
      color: WOOD_DARK,
      section: { ngon: 6 },
      caps: "round",
      name: `${leg.chain.joints[0].name}wood`,
    });
    const x = leg.s;
    const z = leg.z + (leg.z > 0 ? 0.05 : -0.08);
    box(b, [x * 0.24, 0.085, z], [0.18, 0.11, 0.24], CREAM, leg.chain.tip, [0, 0, 0], `${leg.chain.tip.name}paw`);
    for (let i = -1; i <= 1; i++) {
      b.spike(
        [x * (0.24 + i * 0.045), 0.09, z + 0.1],
        [0, -0.1, 1],
        0.105,
        0.018,
        { color: CLAW, bone: leg.chain.tip, name: `${leg.chain.tip.name}claw${i}` },
      );
    }
  }

  // Tail, with turquoise and cream ornamental bands.
  const tailTube = b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.035, {
    color: WOOD_DARK,
    section: { ngon: 7 },
    caps: "round",
    bands: [
      [0.28, GOLD],
      [0.48, TURQUOISE],
      [0.69, MAGENTA],
      [0.86, CREAM],
      [1, PURPLE],
    ],
    name: "ringedTail",
  });

  // ---------------------------------------------------------------------------
  // Eagle wings: broad membranes plus layered graphic feathers.
  // ---------------------------------------------------------------------------

  const wingSkinL = b.membrane(
    wingL,
    [
      [0.3, 0.98, 0.4],
      [0.72, 0.84, 0.08],
      [1.1, 0.78, -0.24],
      [1.38, 1.18, -0.04],
    ],
    { color: TURQUOISE, thickness: 0.018, rows: 3, cols: 7, scallop: 0.1, name: "leftWingMembrane" },
  );
  const wingSkinR = b.membrane(
    wingR,
    [
      [-0.3, 0.98, 0.4],
      [-0.72, 0.84, 0.08],
      [-1.1, 0.78, -0.24],
      [-1.38, 1.18, -0.04],
    ],
    { color: TURQUOISE, thickness: 0.018, rows: 3, cols: 7, scallop: 0.1, name: "rightWingMembrane" },
  );

  b.sweep(wingL, [0.085, 0.06, 0.025, 0.008], {
    color: WOOD_DARK,
    section: { ngon: 6 },
    caps: "point",
    name: "leftWingBones",
  });
  b.sweep(wingR, [0.085, 0.06, 0.025, 0.008], {
    color: WOOD_DARK,
    section: { ngon: 6 },
    caps: "point",
    name: "rightWingBones",
  });

  for (const s of [1, -1]) {
    const wing = s > 0 ? wingL : wingR;
    const colors = [GOLD, SCARLET, CREAM, MAGENTA, PURPLE, GOLD];
    const baseX = s * 0.72;
    for (let i = 0; i < 7; i++) {
      const x0 = s * (0.5 + i * 0.115);
      const x1 = s * (0.88 + i * 0.105);
      feather(
        b,
        [x0, 1.12 + i * 0.02, 0.25 - i * 0.06],
        [x1, 1.32 + (i % 2) * 0.06, -0.13 - i * 0.13],
        0.18,
        colors[i % colors.length],
        wing.joints[Math.min(2, wing.joints.length - 1)],
        `flightFeather${s > 0 ? "L" : "R"}${i}`,
      );
      stripe(
        b,
        [x0, 1.115 + i * 0.02, 0.29 - i * 0.06],
        [x1, 1.305 + (i % 2) * 0.06, -0.1 - i * 0.13],
        0.012,
        INK,
        wing.joints[Math.min(2, wing.joints.length - 1)],
        `featherInk${s > 0 ? "L" : "R"}${i}`,
      );
    }
    // Bright shoulder rosette and wing bars.
    sphere(b, [s * 0.38, 1.1, 0.43], [0.15, 0.12, 0.045], GOLD, spine.joints[2], `shoulderMedallion${s}`);
    for (let j = 0; j < 3; j++) {
      stripe(
        b,
        [s * (0.42 + j * 0.1), 1.19 + j * 0.02, 0.42 - j * 0.04],
        [s * (0.73 + j * 0.1), 1.28 + j * 0.015, 0.27 - j * 0.1],
        0.018,
        j % 2 ? MAGENTA : CREAM,
        wing.joints[0],
        `wingBar${s}${j}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Face: ears, eagle beak, painted eyes, brows, cheek ruffs.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const ear = b.extrude(
      [
        [0, 0, "sharp"],
        [0.17, 0.03, "sharp"],
        [0.14, 0.2, "sharp"],
        [0.03, 0.28, "sharp"],
        [-0.02, 0.12, "sharp"],
      ],
      {
        at: [s * 0.18, 1.48, 0.69],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.006,
        color: WOOD_DARK,
        bone: head,
        name: `catEar${s}`,
      },
    );
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.1, 0.02, "sharp"],
        [0.08, 0.13, "sharp"],
        [0.02, 0.18, "sharp"],
      ],
      {
        at: [s * 0.18, 1.49, 0.7],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.05,
        color: MAGENTA,
        bone: head,
        name: `earInner${s}`,
      },
    );

    const eyeAt = [s * 0.125, 1.36, 0.94];
    b.decal(headPart, EYE, {
      at: eyeAt,
      dir: [0, 0.18, 1],
      up: [0, 1, 0],
      size: [0.105, 0.14],
      lift: 0.006,
      mirror: s > 0,
      bone: head,
      name: `paintedEye${s}`,
    });

    stripe(
      b,
      [s * 0.08, 1.46, 0.91],
      [s * 0.21, 1.48, 0.95],
      0.018,
      INK,
      head,
      `brow${s}`,
    );

    // Jaguar cheek ruff: three triangular painted tufts per side.
    for (let i = 0; i < 3; i++) {
      feather(
        b,
        [s * (0.2 + i * 0.018), 1.29 - i * 0.045, 0.86 + i * 0.025],
        [s * (0.32 + i * 0.02), 1.22 - i * 0.055, 0.78 + i * 0.02],
        0.085,
        i % 2 ? GOLD : CREAM,
        head,
        `cheekRuff${s}${i}`,
      );
    }
  }

  // Eagle beak: upper hooked gold beak and lower red jaw.
  const beak = b.sweep(
    catmull([
      [0, 1.29, 0.96],
      [0, 1.31, 1.12],
      [0, 1.25, 1.24],
    ]),
    [0.13, 0.09, 0],
    {
      color: BEAK,
      bone: head,
      section: { ngon: 6 },
      caps: "point",
      name: "hookedEagleBeak",
    },
  );
  b.sweep(
    [
      [0, 1.22, 0.94],
      [0, 1.19, 1.08],
      [0, 1.18, 1.14],
    ],
    [0.075, 0.025],
    { color: SCARLET, bone: jaw, section: { ngon: 6 }, caps: "point", name: "lowerBeak" },
  );
  stripe(b, [-0.09, 1.295, 1.09], [0.09, 1.295, 1.09], 0.012, INK, head, "beakSeam");

  // Crown crest: alternating alebrije spikes.
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.065;
    b.spike(
      [x, 1.49 + (i % 2) * 0.02, 0.69 + Math.abs(i - 3) * 0.012],
      [x * 0.7, 1.72 + (i % 3) * 0.035, 0.62 - Math.abs(i - 3) * 0.025],
      null,
      0.045,
      { color: [GOLD, MAGENTA, TURQUOISE, CREAM][i % 4], bone: head, name: `crownFeather${i}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Jaguar rosettes, belly markings, and painted wood ornament.
  // ---------------------------------------------------------------------------

  const coatSurface = b.surface(body);
  const spotRng = rng(44);
  const spots = coatSurface.scatter(28, {
    rng: spotRng,
    minDist: 0.08,
    filter: (h: any) => h.n.y > -0.45,
  });

  for (let i = 0; i < spots.length; i++) {
    const h = spots[i];
    const c = i % 3 === 0 ? INK : i % 3 === 1 ? WOOD_DARK : PURPLE;
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), c, h, {
      embed: 0.35,
      name: `jaguarRosette${i}`,
    });
    if (i % 3 === 0) {
      b.ring(h, { count: 5, radius: 0.045, fromDeg: 0, toDeg: 360 }, (p: any) =>
        b.spike(p, p, 0.014, 0.006, { color: GOLD, name: `rosettePetal${i}` }),
      );
    }
  }

  const belly = b.sweep(
    catmull([
      [0, 0.76, -0.05],
      [0, 0.87, 0.2],
      [0, 0.93, 0.43],
    ]),
    [0.18, 0.2, 0.13],
    { color: CREAM, shift: [0, -0.12], section: { ngon: 7 }, bone: [hips, spine], name: "creamBelly" },
  );

  // Long graphic stripes on the torso, like brush-painted wood bands.
  for (const z of [-0.34, -0.2, -0.05, 0.12, 0.29]) {
    stripe(b, [-0.23, 0.98, z], [0.23, 0.98, z + 0.025], 0.014, z < 0 ? TURQUOISE : GOLD, hips, "torsoPaintStripe");
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      stripe(
        b,
        [s * (0.25 + i * 0.015), 0.56, 0.29 - i * 0.06],
        [s * (0.3 + i * 0.01), 0.96, 0.34 - i * 0.03],
        0.012,
        i % 2 ? GOLD : MAGENTA,
        hips,
        `legPaint${s}${i}`,
      );
    }
  }

  // Decorative collar with a central wooden sun medallion.
  const collar = b.sweep(
    catmull([
      [-0.18, 1.11, 0.6],
      [0, 1.16, 0.69],
      [0.18, 1.11, 0.6],
    ]),
    0.025,
    { color: GOLD, bone: neck.joints[1], caps: "round", name: "goldCollar" },
  );
  sphere(b, [0, 1.11, 0.62], [0.095, 0.095, 0.035], GOLD, neck.joints[1], "sunMedallion");
  sphere(b, [0, 1.11, 0.66], [0.055, 0.055, 0.018], SCARLET, neck.joints[1], "sunCenter");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike(
      [Math.sin(a) * 0.065, 1.11 + Math.cos(a) * 0.065, 0.665],
      [Math.sin(a) * 0.105, 1.11 + Math.cos(a) * 0.105, 0.665],
      null,
      0.012,
      { color: GOLD, bone: neck.joints[1], name: `sunRay${i}` },
    );
  }

  // Small painted beads along the tail.
  b.along(tailTube, 8, (at: any) => {
    b.stick(new THREE.SphereGeometry(0.035, 7, 5), [GOLD, CREAM, MAGENTA, TURQUOISE][at.i % 4], at, {
      embed: 0.25,
      name: `tailBead${at.i}`,
    });
  });

  // A few bright studs on wing roots and hips.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      sphere(
        b,
        [s * (0.27 + i * 0.025), 0.91 + i * 0.045, 0.43 - i * 0.025],
        [0.026, 0.026, 0.026],
        [GOLD, CREAM, MAGENTA, CYAN, SCARLET][i],
        spine.joints[2],
        `wingRootStud${s}${i}`,
      );
    }
  }

  return b.root;
}
```
import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  createBuilder,
  frame,
  limb,
  mottle,
  rng,
  spots,
  stripes,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A squat, friendly axolotl puppet with enormous eyes, webbed feet, a finned tail, and six frilly pink external gills.",
};

const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const BODY_FIELD = spots(
  mottle("#8acbbb", "#c5ead8", { size: 0.22, contrast: 1.15, seed: 17 }),
  ["#5e9e9e", "#6fafaa", "#8bbcb2"],
  { size: 0.16, amount: 0.22, rosette: true, seed: 31 },
);

const BODY_PAINT = cel(
  furEdge(BODY_FIELD, "#f3d8dc", {
    level: -0.16,
    teeth: 0.16,
    period: 0.065,
    ink: "#5e788b",
    inkWidth: 0.018,
  }),
  "#557d8e",
);

const TAIL_FIELD = stripes(
  BODY_FIELD,
  ["#6d9fae", "#78abb1", "#8cb9b7"],
  { size: 0.18, width: 0.23, wobble: 0.18, seed: 44 },
);

const TAIL_PAINT = cel(TAIL_FIELD, "#526f88");

const HEAD_FIELD = spots(
  mottle("#a9ded2", "#d8eee0", { size: 0.20, contrast: 1.2, seed: 53 }),
  ["#76b6b1", "#8bc9bd"],
  { size: 0.14, amount: 0.16, rosette: false, seed: 63 },
);

const HEAD_PAINT = cel(
  furEdge(HEAD_FIELD, "#f4d9de", {
    level: -0.13,
    teeth: 0.14,
    period: 0.055,
    ink: "#6b8294",
    inkWidth: 0.016,
  }),
  "#678898",
);

const LIMB_PAINT = cel(
  mottle("#86c8bd", "#b8e2d1", { size: 0.13, contrast: 1.1, seed: 71 }),
  "#507d8e",
);

const BELLY_PAINT = cel("#f4d9dc", "#c58ca2");
const TOE_PAINT = cel("#e7b8c8", "#a85f80");
const WEB_PAINT = cel("#f3bdcd", "#c87999");

const GILL_STEM = cel("#e66f9d", "#a63f70");
const GILL_LIGHT = cel("#ff9fbe", "#c75180");
const GILL_DARK = cel("#bb4e7d", "#733253");
const FIN_PAINT = cel("#93c8c8", "#568c9d");
const NOSE_PAINT = cel("#713a68", "#3f254c");
const PAD_PAINT = cel("#c57999", "#80405d");

const EYE_TEXTURE = animeEye({
  iris: "#4aa7bd",
  irisLight: "#a8f3e5",
  irisDark: "#287184",
  ink: INK,
  blush: "#ff8bad",
  brow: true,
  size: 512,
});

const MOUTH_TEXTURE = svg(
  `<svg viewBox="0 0 180 72" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 28 Q53 63 90 34 Q127 63 162 28"
      fill="none" stroke="#41213e" stroke-width="8" stroke-linecap="round"/>
    <path d="M57 48 Q90 68 123 48 Q111 69 90 69 Q69 69 57 48Z"
      fill="#ef779c" stroke="#7e355f" stroke-width="4"/>
    <path d="M78 57 Q90 61 102 57" fill="none" stroke="#ffb4c8" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CHEEK_TEXTURE = svg(
  `<svg viewBox="0 0 128 72" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="64" cy="36" rx="49" ry="25" fill="#ff8dab" opacity=".82"/>
    <path d="M33 40 l-10 10 M49 44 l-7 12 M95 40 l10 10 M79 44 l7 12"
      stroke="#dc587f" stroke-width="6" stroke-linecap="round" opacity=".65"/>
  </svg>`,
  { size: 192 },
);

const HEART_TEXTURE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 54 C24 45 8 37 8 22 C8 11 22 8 32 19 C42 8 56 11 56 22 C56 37 40 45 32 54Z"
      fill="#ff91af" stroke="#7f416d" stroke-width="4"/>
    <path d="M20 19 Q25 14 29 19" fill="none" stroke="#ffd6df" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const GILL_TEXTURE = svg(
  `<svg viewBox="0 0 96 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 154 C45 128 27 110 18 84 C10 61 18 26 48 6 C78 26 86 61 78 84 C69 110 51 128 48 154Z"
      fill="#f58dae" stroke="#8d3e6c" stroke-width="5" stroke-linejoin="round"/>
    <path d="M48 143 C48 111 48 73 48 18"
      fill="none" stroke="#ffd1df" stroke-width="6" stroke-linecap="round"/>
    <path d="M45 87 C34 71 27 58 24 39 M51 87 C62 71 69 58 72 39"
      fill="none" stroke="#c65182" stroke-width="4" stroke-linecap="round"/>
    <path d="M43 116 C33 103 25 91 21 76 M53 116 C63 103 71 91 75 76"
      fill="none" stroke="#c65182" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

type ChainRecord = ReturnType<typeof createBuilder>["root"];

export default function build() {
  const b = createBuilder({
    name: "chibi-axolotl",
    detail: 1,
    paintSize: 1024,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first. The axolotl rests low to the ground, with every appendage separated and readable.

  const hips = b.joint("hips", {
    at: [0, 0.38, -0.18],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const spinePath = catmull([
    [0, 0.38, -0.18],
    [0, 0.40, 0.02],
    [0, 0.45, 0.25],
    [0, 0.51, 0.47],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spineTip"],
    role: "spine",
    group: "skeleton",
  });

  const tailPath = catmull([
    [0, 0.38, -0.18],
    [0, 0.34, -0.49],
    [0, 0.25, -0.84],
    [0, 0.15, -1.17],
    [0, 0.075, -1.43],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "skeleton",
  });

  const headCenter = point(0, 0.57, 0.59);
  const head = b.joint("head", {
    parent: spine.tip,
    at: headCenter,
    dir: [0, 0, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.475, 0.78],
    aim: [0, 0.415, 1.04],
    role: "jaw",
    group: "face",
  });

  const legRecords: Array<{
    side: number;
    kind: "front" | "hind";
    chain: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
  }> = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const frontRoot = point(side * 0.19, 0.405, 0.22);
    const frontFoot = point(side * 0.37, 0.065, 0.36);
    const frontPoints = limb(
      frontRoot,
      frontFoot,
      [0.225, 0.215],
      [0, 0, 1],
    );

    const frontChain = b.chain(`foreleg${sideName}`, frontPoints, {
      parent: hips,
      names: [`shoulder${sideName}`, `elbow${sideName}`, `wrist${sideName}`],
      role: "leg",
      contact: [side * 0.37, 0, 0.36],
      group: "limbs",
    });

    legRecords.push({
      side,
      kind: "front",
      chain: frontChain,
      foot: frontFoot,
    });

    const hindRoot = point(side * 0.205, 0.355, -0.25);
    const hindFoot = point(side * 0.39, 0.065, -0.48);
    const hindPoints = limb(
      hindRoot,
      hindFoot,
      [0.235, 0.225],
      [0, 0, -1],
    );

    const hindChain = b.chain(`hindleg${sideName}`, hindPoints, {
      parent: hips,
      names: [`hip${sideName}`, `knee${sideName}`, `ankle${sideName}`],
      role: "leg",
      contact: [side * 0.39, 0, -0.48],
      group: "limbs",
    });

    legRecords.push({
      side,
      kind: "hind",
      chain: hindChain,
      foot: hindFoot,
    });
  }

  const toeRecords: Array<{
    side: number;
    kind: "front" | "hind";
    index: number;
    chain: ReturnType<typeof b.chain>;
  }> = [];

  for (const leg of legRecords) {
    const sideName = leg.side > 0 ? "L" : "R";
    const kindName = leg.kind === "front" ? "F" : "H";
    const footBone = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];

    if (!footBone) throw new Error("Axolotl foot chain did not produce a tip joint");

    for (let i = 0; i < 3; i++) {
      const across = (i - 1) * 0.034;
      const toeRoot = leg.foot.clone().add(point(across, 0.005, 0.01));
      const toeMiddle = toeRoot.clone().add(
        point((i - 1) * 0.008, -0.002, 0.042),
      );
      const toeTip = toeRoot.clone().add(
        point((i - 1) * 0.016, -0.003, 0.105 - Math.abs(i - 1) * 0.012),
      );

      const baseName = `toe${kindName}${sideName}${i + 1}`;
      const toeChain = b.chain(
        `digit${kindName}${sideName}${i + 1}`,
        [toeRoot, toeMiddle, toeTip],
        {
          parent: footBone,
          names: [`${baseName}`, `${baseName}Mid`, `${baseName}Tip`],
          role: "digit",
          group: "digits",
        },
      );

      toeRecords.push({
        side: leg.side,
        kind: leg.kind,
        index: i,
        chain: toeChain,
      });
    }
  }

  const gillRecords: Array<{
    side: number;
    index: number;
    points: THREE.Vector3[];
    chain: ReturnType<typeof b.chain>;
  }> = [];

  const gillProfiles = [
    [
      [0.30, 0.68, 0.53],
      [0.45, 0.77, 0.42],
      [0.66, 0.86, 0.30],
    ],
    [
      [0.32, 0.64, 0.51],
      [0.49, 0.68, 0.47],
      [0.70, 0.67, 0.48],
    ],
    [
      [0.29, 0.60, 0.55],
      [0.44, 0.56, 0.63],
      [0.60, 0.49, 0.72],
    ],
  ] as const;

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let i = 0; i < gillProfiles.length; i++) {
      const points = gillProfiles[i].map(
        ([x, y, z]) => point(side * x, y, z),
      );

      const name = `gill${sideName}${i + 1}`;
      const gillChain = b.chain(name, catmull(points), {
        parent: head,
        names: [`${name}Root`, `${name}Mid`, `${name}Tip`],
        role: "fan",
        group: "gills",
      });

      gillRecords.push({
        side,
        index: i,
        points,
        chain: gillChain,
      });
    }
  }

  // A barely open resting jaw gives the face a friendly salamander smile.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // -------------------------------------------------------------------------------------------------------------
  // Main volumes.

  const bodyPath = catmull([
    hips.at,
    spine.at(0.30).at,
    spine.at(0.67).at,
    spine.at(1).at,
  ]);

  const bodyTube = b.sweep(
    bodyPath,
    (t) => 0.172 + 0.046 * Math.sin(Math.PI * t),
    {
      bone: [hips, spine],
      color: BODY_PAINT,
      sides: 10,
      smooth: false,
      caps: "round",
      group: "body",
      name: "rounded_body",
    },
  );

  const tailTube = b.sweep(
    tail,
    (t) => 0.142 * (1 - t) + 0.024,
    {
      color: TAIL_PAINT,
      sides: 8,
      smooth: false,
      caps: "round",
      group: "tail",
      name: "tapered_tail",
    },
  );

  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 10),
    HEAD_PAINT,
    {
      bone: head,
      at: headCenter,
      scale: [0.405, 0.292, 0.335],
      flat: true,
      group: "head",
      name: "broad_skull",
    },
  );

  const upperMuzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY_PAINT,
    {
      bone: head,
      at: [0, 0.515, 0.855],
      scale: [0.285, 0.145, 0.185],
      flat: true,
      group: "face",
      name: "soft_upper_muzzle",
    },
  );

  const jawPath = catmull([
    jaw.at,
    [0, 0.445, 0.91],
    [0, 0.415, 1.035],
  ]);

  const lowerJawTube = b.sweep(
    jawPath,
    (t) => 0.108 - 0.055 * t,
    {
      bone: jaw,
      color: BELLY_PAINT,
      sides: 8,
      smooth: false,
      caps: "round",
      group: "face",
      name: "separate_lower_jaw",
    },
  );

  const upperLip = b.sweep(
    catmull([
      [-0.15, 0.505, 0.965],
      [0, 0.525, 1.005],
      [0.15, 0.505, 0.965],
    ]),
    [0.032, 0.018],
    {
      bone: head,
      color: BELLY_PAINT,
      sides: 6,
      smooth: false,
      caps: "round",
      group: "face",
      name: "upper_lip",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Tail sail and belly fin.

  const finEdge = catmull([
    tailPath.at(0.04).clone().add(point(0, 0.115, 0)),
    tailPath.at(0.27).clone().add(point(0, 0.108, 0)),
    tailPath.at(0.55).clone().add(point(0, 0.075, 0)),
    tailPath.at(0.80).clone().add(point(0, 0.043, 0)),
    tailPath.at(0.98).clone().add(point(0, 0.016, 0)),
  ]);

  b.membrane(
    tailTube.line(0, 0.006).slice(0.04, 0.98),
    finEdge,
    {
      bone: tail,
      color: FIN_PAINT,
      thickness: 0.012,
      rows: 4,
      cols: 10,
      scallop: 0.13,
      group: "tail",
      name: "dorsal_tail_fin",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs, paws, webbing, and separated toes.

  for (const leg of legRecords) {
    const sideName = leg.side > 0 ? "L" : "R";
    const kindName = leg.kind === "front" ? "front" : "hind";
    const footBone = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];

    if (!footBone) throw new Error("Axolotl leg has no foot bone");

    b.sweep(
      leg.chain,
      leg.kind === "front"
        ? (t) => 0.052 - 0.015 * t
        : (t) => 0.066 - 0.020 * t,
      {
        color: LIMB_PAINT,
        section: "box",
        smooth: false,
        caps: "round",
        group: "limbs",
        name: `${kindName}_leg_${sideName}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      LIMB_PAINT,
      {
        bone: footBone,
        at: leg.foot,
        scale: leg.kind === "front"
          ? [0.078, 0.048, 0.085]
          : [0.092, 0.055, 0.100],
        flat: true,
        group: "limbs",
        name: `${kindName}_palm_${sideName}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      PAD_PAINT,
      {
        bone: footBone,
        at: leg.foot.clone().add(point(0, -0.012, 0.035)),
        scale: leg.kind === "front"
          ? [0.042, 0.012, 0.037]
          : [0.052, 0.014, 0.044],
        flat: true,
        group: "limbs",
        name: `${kindName}_pad_${sideName}`,
      },
    );
  }

  for (const toe of toeRecords) {
    const sideName = toe.side > 0 ? "L" : "R";
    const kindName = toe.kind === "front" ? "F" : "H";

    b.sweep(
      toe.chain,
      [0.014, 0.0045],
      {
        color: TOE_PAINT,
        section: { ngon: 6 },
        smooth: false,
        caps: "round",
        group: "digits",
        name: `toe_${kindName}${sideName}_${toe.index + 1}`,
      },
    );
  }

  for (const side of [1, -1]) {
    for (const kind of ["front", "hind"] as const) {
      const toes = toeRecords
        .filter((toe) => toe.side === side && toe.kind === kind)
        .sort((a, b) => a.index - b.index);

      for (let i = 0; i < toes.length - 1; i++) {
        b.membrane(toes[i].chain, toes[i + 1].chain, {
          color: WEB_PAINT,
          thickness: 0.006,
          rows: 2,
          cols: 3,
          scallop: 0.25,
          skin: "smooth",
          group: "digits",
          name: `web_${kind}_${side > 0 ? "L" : "R"}_${i + 1}`,
        });
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Face: eyes first, then cheeks, heart mark, nose, and smiling mouth.

  const headSurface = b.surface(skull);
  const muzzleSurface = b.surface(upperMuzzle);

  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(headCenter).at(side * 22, 8);

    if (eyeHit) {
      b.decal(headSurface, EYE_TEXTURE, {
        at: eyeHit,
        size: [0.145, 0.197],
        mirror: side > 0,
        up: [0, 1, 0],
        lift: 0.004,
        segments: 8,
        group: "face",
        name: `large_eye_${side > 0 ? "L" : "R"}`,
      });
    }

    const cheekHit = headSurface.around(headCenter).at(side * 30, -18);

    if (cheekHit) {
      b.decal(headSurface, CHEEK_TEXTURE, {
        at: cheekHit,
        size: [0.108, 0.061],
        mirror: side > 0,
        up: [0, 1, 0],
        lift: 0.003,
        segments: 6,
        group: "face",
        name: `blushing_cheek_${side > 0 ? "L" : "R"}`,
      });
    }

    const nostrilHit = muzzleSurface.around(upperMuzzle.at).at(side * 12, 7);

    if (nostrilHit) {
      b.stick(
        new THREE.SphereGeometry(0.016, 8, 5),
        NOSE_PAINT,
        nostrilHit,
        {
          embed: 0.5,
          group: "face",
          name: `nostril_${side > 0 ? "L" : "R"}`,
        },
      );
    }
  }

  const heartHit = headSurface.around(headCenter).at(0, 34);

  if (heartHit) {
    b.decal(headSurface, HEART_TEXTURE, {
      at: heartHit,
      size: [0.067, 0.067],
      up: [0, 1, 0],
      lift: 0.003,
      segments: 5,
      group: "face",
      name: "forehead_heart",
    });
  }

  const mouthHit = muzzleSurface.around(upperMuzzle.at).at(0, -9);

  if (mouthHit) {
    b.decal(muzzleSurface, MOUTH_TEXTURE, {
      at: mouthHit,
      size: [0.225, 0.090],
      up: [0, 1, 0],
      lift: 0.004,
      segments: 8,
      group: "face",
      name: "smiling_mouth",
    });
  }

  // Tiny mouth-corner beads reinforce the open-jaw hinge without hiding the decal.
  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.014, 7, 5),
      NOSE_PAINT,
      {
        bone: jaw,
        at: [side * 0.094, 0.442, 1.020],
        flat: true,
        group: "face",
        name: `mouth_corner_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // External frilly gills. Each has a smooth stalk, scalloped membrane, branch-like rays, and translucent-looking
  // illustrated cards so the silhouette reads from every angle.

  for (const gill of gillRecords) {
    const sideName = gill.side > 0 ? "L" : "R";
    const gillName = `gill_${sideName}_${gill.index + 1}`;

    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      GILL_DARK,
      {
        bone: head,
        at: gill.points[0],
        scale: [0.052, 0.047, 0.052],
        flat: true,
        group: "gills",
        name: `${gillName}_base`,
      },
    );

    b.sweep(
      gill.chain,
      [0.030, 0.011],
      {
        color: GILL_STEM,
        sides: 7,
        smooth: false,
        caps: "round",
        group: "gills",
        name: `${gillName}_stalk`,
      },
    );

    const upperEdge = catmull(
      gill.points.map((p, i) =>
        p.clone().add(
          point(
            0,
            i === 0 ? 0.047 : i === 1 ? 0.060 : 0.027,
            0,
          ),
        ),
      ),
    );

    const lowerEdge = catmull(
      gill.points.map((p, i) =>
        p.clone().add(
          point(
            0,
            i === 0 ? -0.043 : i === 1 ? -0.060 : -0.027,
            0,
          ),
        ),
      ),
    );

    b.membrane(upperEdge, lowerEdge, {
      bone: gill.chain.joints[0],
      color: GILL_LIGHT,
      thickness: 0.008,
      rows: 3,
      cols: 5,
      scallop: 0.30,
      group: "gills",
      name: `${gillName}_frill`,
    });

    const branchTs = [0.20, 0.38, 0.56, 0.74];

    for (let k = 0; k < branchTs.length; k++) {
      const t = branchTs[k];
      const cp = gill.chain.at(t);
      const outward = new THREE.Vector3(
        gill.side * 0.60,
        0.26 + 0.20 * Math.sin(k * 1.7 + gill.index),
        -0.18,
      ).normalize();

      const inward = new THREE.Vector3(
        gill.side * 0.50,
        -0.24 - 0.13 * Math.cos(k * 1.3 + gill.index),
        -0.12,
      ).normalize();

      b.spike(
        cp,
        outward,
        0.090 - k * 0.008,
        0.010,
        {
          color: k % 2 ? GILL_LIGHT : GILL_DARK,
          group: "gills",
          name: `${gillName}_ray_upper_${k + 1}`,
        },
      );

      b.spike(
        cp,
        inward,
        0.076 - k * 0.006,
        0.009,
        {
          color: k % 2 ? GILL_DARK : GILL_LIGHT,
          group: "gills",
          name: `${gillName}_ray_lower_${k + 1}`,
        },
      );
    }

    const cardFrames = [0.22, 0.42, 0.63, 0.81].map((t) => {
      const cp = gill.chain.at(t);
      const facing = new THREE.Vector3(
        gill.side,
        0.10 + 0.18 * Math.sin(t * 8 + gill.index),
        -0.08,
      ).normalize();
      return frame(cp, facing);
    });

    b.cards(cardFrames, GILL_TEXTURE, {
      size: [0.067, 0.125],
      lean: 58,
      bend: 22,
      flow: [0, 0.78, -0.18],
      cross: true,
      vary: 0.22,
      spin: 12,
      sink: 0.11,
      mirror: gill.side < 0,
      color: GILL_LIGHT,
      rng: rng(500 + gill.index + (gill.side > 0 ? 0 : 50)),
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Surface-painted freckles and soft belly buttons. These are seated with live hits so they follow the low-poly
  // body rather than floating beside it.

  const bodySurface = b.surface([bodyTube, tailTube]);

  const freckleHits = bodySurface.scatter(24, {
    rng: rng(811),
    minDist: 0.085,
    filter: (hit) => hit.n.y > -0.34 && hit.at.y > 0.18,
  });

  for (let i = 0; i < freckleHits.length; i++) {
    const hit = freckleHits[i];

    b.stick(
      new THREE.SphereGeometry(
        0.013 + (i % 3) * 0.002,
        7,
        5,
      ),
      i % 4 === 0 ? GILL_DARK : "#5b9b99",
      hit,
      {
        embed: 0.48,
        group: "skin_detail",
        name: `raised_freckle_${i + 1}`,
      },
    );
  }

  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.105;
    const bellyHit = bodyTube.at(t, 180, 0.006);

    b.stick(
      new THREE.SphereGeometry(0.018, 7, 5),
      BELLY_PAINT,
      bellyHit,
      {
        embed: 0.38,
        group: "skin_detail",
        name: `belly_bead_${i + 1}`,
      },
    );
  }

  // A few small pink gill-base freckles make the six fans feel rooted in the head.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const p = gillProfiles[i][0];
      b.part(
        new THREE.SphereGeometry(0.012 + i * 0.002, 7, 5),
        GILL_LIGHT,
        {
          bone: head,
          at: [side * (p[0] - 0.025), p[1] - 0.018, p[2] + 0.012],
          flat: true,
          group: "gills",
          name: `gill_root_dot_${side > 0 ? "L" : "R"}_${i + 1}`,
        },
      );
    }
  }

  return b.root;
}

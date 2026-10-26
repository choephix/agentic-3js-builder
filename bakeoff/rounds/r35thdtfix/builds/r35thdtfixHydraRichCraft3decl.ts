import * as THREE from "three";
import {
  catmull,
  bezier,
  createBuilder,
  countershade,
  furEdge,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import { limb } from "../../../../src/index";
import { animeEye, cel, INK as TOON_INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A hulking five-headed hydra in a dark God of War-inspired style, with armored scales, glowing war-painted eyes, open jaws, horns, dorsal spines, scars, heavy legs, and a barbed tail.",
};

const INK = "#120f15";
const MOUTH = "#180b12";
const CLAW = "#d2c7ae";
const BONE = cel("#d8c49c", "#69594c", { threshold: 0.16 });
const BONE_DARK = "#806b58";
const BRONZE = cel("#9b6734", "#3e241b", { threshold: 0.2 });
const BRONZE_HI = "#d28a42";
const SCARLET = cel("#9a202b", "#3b0c15", { threshold: 0.05 });
const EMBER = "#ff4a20";
const EYE_IRIS = "#ff541f";
const EYE_GLOW = "#ff9b38";

const SCALE_BASE = scales(["#393b41", "#494b50", "#292b31"], "#111319", {
  size: 0.085,
  width: 0.13,
  seed: 17,
});

const COAT = cel(
  countershade(SCALE_BASE, "#17151c", {
    level: -0.24,
    soft: 0.24,
  }),
  "#0b0c11",
  { threshold: 0.12 },
);

const NECK_COAT = cel(
  countershade(
    scales(["#32343a", "#44464b"], "#101117", {
      size: 0.072,
      width: 0.15,
      seed: 29,
    }),
    "#17141a",
    { level: -0.2, soft: 0.24 },
  ),
  "#090a0f",
  { threshold: 0.1 },
);

const BELLY = cel(
  countershade("#40343a", "#201820", {
    level: -0.04,
    soft: 0.18,
  }),
  "#100d13",
);

const EYE_TEXTURE = animeEye({
  iris: EYE_IRIS,
  irisLight: "#ffc15b",
  irisDark: "#77151d",
  ink: TOON_INK,
  blush: "#a72e35",
  brow: true,
  size: 512,
});

const RUNE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
    <path d="M48 4 L65 26 L52 47 L77 72 L48 136 L40 91 L20 75 L38 55 L28 35 Z"
      fill="#a91e28" stroke="#250d15" stroke-width="7" stroke-linejoin="round"/>
    <path d="M49 20 L49 108 M31 74 L62 70" stroke="#ef7650" stroke-width="5" stroke-linecap="round"/>
    <path d="M62 91 L46 112" stroke="#59131b" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SCAR_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 56">
    <path d="M8 41 C42 6 65 48 96 18 S148 7 170 35 S215 48 252 12"
      fill="none" stroke="#b72731" stroke-width="13" stroke-linecap="round"/>
    <path d="M10 39 C42 8 65 45 96 16 S148 8 170 33 S215 46 250 10"
      fill="none" stroke="#f17351" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  color: string | any,
  at: any,
  scale: [number, number, number],
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

function addBrow(
  b: ReturnType<typeof createBuilder>,
  head: any,
  side: number,
  name: string,
) {
  const a = head.local({
    left: side * 0.045,
    up: 0.125,
    forward: 0.205,
  });
  const c = head.local({
    left: side * 0.145,
    up: 0.155,
    forward: 0.18,
  });
  b.rod(a, c, 0.022, INK, {
    bone: head,
    caps: "round",
    name,
  });
}

function addHorn(
  b: ReturnType<typeof createBuilder>,
  head: any,
  side: number,
  index: number,
) {
  const base = head.local({
    left: side * 0.14,
    up: 0.13,
    back: 0.005,
  });
  const c1 = head.local({
    left: side * 0.19,
    up: 0.25,
    back: 0.01,
  });
  const c2 = head.local({
    left: side * 0.22,
    up: 0.37,
    back: 0.095,
  });
  const tip = head.local({
    left: side * 0.185,
    up: 0.49,
    back: 0.19,
  });

  b.sweep(
    bezier(base, c1, c2, tip),
    [0.052, 0.008],
    {
      bone: head,
      color: BONE,
      caps: { start: "round", end: "point" },
      section: { ngon: 7 },
      name: `horn${index}_${side > 0 ? "L" : "R"}`,
    },
  );
}

function addHeadDetails(
  b: ReturnType<typeof createBuilder>,
  item: any,
  index: number,
) {
  const head = item.head;
  const jaw = item.jaw;
  const skull = sphere(
    b,
    COAT,
    head.at,
    item.scale,
    head,
    `skull_${item.key}`,
  );
  const skullSurface = b.surface(skull);

  const eyeParts: any[] = [];
  for (const side of [1, -1]) {
    const eyePoint = head.local({
      left: side * 0.13,
      up: 0.015,
      forward: 0.255,
    });

    const eyeHit =
      skullSurface.around(head.at).at(side * 38, 5) ??
      skullSurface.nearest(eyePoint);

    const eye = b.decal(skullSurface, EYE_TEXTURE, {
      at: eyeHit,
      dir: eyeHit.n,
      up: [0, 1, 0],
      size: [0.105, 0.14],
      segments: [5, 7],
      lift: 0.004,
      mirror: side > 0,
      name: `eye_${item.key}_${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    glow(eye, 1.65);
    eyeParts.push(eye);
    addBrow(b, head, side, `brow_${item.key}_${side > 0 ? "L" : "R"}`);
  }

  const runePoint =
    skullSurface.around(head.at).at(0, 58) ??
    skullSurface.nearest(head.local({ up: 0.22, forward: 0.08 }));

  const rune = b.decal(skullSurface, RUNE_TEXTURE, {
    at: runePoint,
    dir: runePoint.n,
    up: [0, 1, 0],
    size: [0.105, 0.16],
    segments: [4, 7],
    lift: 0.003,
    name: `foreheadRune_${item.key}`,
    group: "warpaint",
  });
  glow(rune, 0.45);

  const upperPath = catmull([
    head.local({ forward: 0.08, down: 0.005 }),
    head.local({ forward: 0.26, down: 0.015 }),
    head.local({ forward: 0.47, down: 0.02 }),
  ]);

  const upperJaw = b.sweep(
    upperPath,
    (t) => [0.145 - t * 0.06, 0.12 - t * 0.055],
    {
      bone: head,
      color: COAT,
      section: { ngon: 7 },
      caps: { start: "round", end: "flat" },
      name: `upperJaw_${item.key}`,
      group: "jaw",
    },
  );

  const mouthPath = catmull([
    head.local({ forward: 0.16, down: 0.035 }),
    head.local({ forward: 0.31, down: 0.055 }),
    head.local({ forward: 0.455, down: 0.045 }),
  ]);

  b.sweep(mouthPath, [0.083, 0.018], {
    bone: head,
    color: MOUTH,
    section: { ngon: 5 },
    caps: "flat",
    name: `mouthVoid_${item.key}`,
    group: "jaw",
  });

  const lowerPath = catmull([
    jaw.at,
    jaw.local({ forward: 0.17, down: 0.02 }),
    jaw.local({ forward: 0.37, down: 0.015 }),
  ]);

  const lowerJaw = b.sweep(
    lowerPath,
    (t) => [0.115 - t * 0.05, 0.075 - t * 0.035],
    {
      bone: jaw,
      color: NECK_COAT,
      section: { ngon: 7 },
      caps: { start: "round", end: "flat" },
      name: `lowerJaw_${item.key}`,
      group: "jaw",
    },
  );

  const nose = sphere(
    b,
    "#1b1517",
    head.local({ forward: 0.47, down: 0.012 }),
    [0.095, 0.065, 0.06],
    head,
    `nose_${item.key}`,
  );

  for (const side of [1, -1]) {
    sphere(
      b,
      INK,
      head.local({
        left: side * 0.048,
        forward: 0.505,
        up: 0.016,
      }),
      [0.019, 0.013, 0.012],
      head,
      `nostril_${item.key}_${side > 0 ? "L" : "R"}`,
    );
  }

  for (let tooth = 1; tooth <= 5; tooth++) {
    const t = tooth / 6;
    const upperTooth = upperJaw.at(t, 180, 0.006);
    b.spike(upperTooth, upperTooth, 0.11, 0.023, {
      color: BONE,
      caps: "point",
      name: `upperFang_${item.key}_${tooth}`,
      group: "fangs",
    });

    const lowerTooth = lowerJaw.at(t, 0, 0.006);
    b.spike(lowerTooth, lowerTooth, 0.075, 0.018, {
      color: BONE_DARK,
      caps: "point",
      name: `lowerFang_${item.key}_${tooth}`,
      group: "fangs",
    });
  }

  addHorn(b, head, 1, index);
  addHorn(b, head, -1, index);

  const crownBase = head.local({ up: 0.18, back: 0.01 });
  b.spike(
    crownBase,
    [0, 0.96, -0.22],
    0.19,
    0.05,
    {
      color: BONE,
      bone: head,
      caps: "point",
      name: `crownHorn_${item.key}`,
      group: "horns",
    },
  );

  const cheekAngles = [
    [72, 0],
    [-72, 0],
    [92, -12],
    [-92, -12],
  ] as const;

  for (let i = 0; i < cheekAngles.length; i++) {
    const [azimuth, elevation] = cheekAngles[i];
    const hit =
      skullSurface.around(head.at).at(azimuth, elevation) ??
      skullSurface.nearest(
        head.local({
          left: azimuth > 0 ? 0.2 : -0.2,
          down: 0.02,
          forward: 0.04,
        }),
      );

    b.stick(
      new THREE.ConeGeometry(0.048, i < 2 ? 0.14 : 0.11, 6),
      BONE,
      hit,
      {
        embed: 0.36,
        spin: i * 23,
        name: `cheekPlate_${item.key}_${i}`,
        group: "horns",
      },
    );
  }

  const scaleHits = skullSurface.scatter(9, {
    rng: rng(1500 + index),
    minDist: 0.045,
    filter: (h: any) => h.n.z < 0.65 && h.n.y < 0.7,
  });

  for (let i = 0; i < scaleHits.length; i++) {
    b.stick(
      new THREE.ConeGeometry(0.032, 0.026, 5),
      BONE_DARK,
      scaleHits[i],
      {
        embed: 0.45,
        spin: i * 37,
        name: `headScale_${item.key}_${i}`,
        group: "scales",
      },
    );
  }

  const jawRimA = head.local({ left: -0.15, forward: 0.19, down: 0.03 });
  const jawRimB = head.local({ left: 0.15, forward: 0.19, down: 0.03 });
  b.rod(jawRimA, jawRimB, 0.015, BONE_DARK, {
    bone: head,
    name: `jawRim_${item.key}`,
    group: "jaw",
  });
}

export default function build() {
  const b = createBuilder({
    name: "five-headed-hydra",
    detail: 1,
    paintSize: 2048,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted spine, a curling tail, five neck chains, five head hinges, and four planted legs.

  const hips = b.joint("hips", {
    at: [0, 0.98, -0.38],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const bodyPath = catmull([
    hips.at,
    [0, 1.02, -0.02],
    [0, 1.12, 0.42],
    [0, 1.22, 0.78],
  ]);

  const body = b.chain("spine", bodyPath, {
    parent: hips,
    names: ["spine1", "spine2", "chest", "chestTip"],
    role: "spine",
    group: "skeleton",
  });

  const tailPath = catmull([
    hips.at,
    [0, 0.92, -0.72],
    [0.02, 0.83, -1.08],
    [0.14, 0.78, -1.42],
    [0.35, 0.86, -1.7],
    [0.48, 1.0, -1.93],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: [
      "tail1",
      "tail2",
      "tail3",
      "tail4",
      "tail5",
      "tailTip",
    ],
    role: "tail",
    group: "skeleton",
  });

  const neckSpecs = [
    {
      key: "C",
      base: [0, 1.24, 0.7],
      mid: [0, 1.78, 0.86],
      end: [0, 2.58, 1.08],
      dir: [0, 0.02, 1],
      scale: [0.32, 0.34, 0.37] as [number, number, number],
    },
    {
      key: "L1",
      base: [0.16, 1.25, 0.69],
      mid: [0.32, 1.68, 0.85],
      end: [0.43, 2.38, 1.02],
      dir: [0.12, 0.02, 1],
      scale: [0.29, 0.31, 0.34] as [number, number, number],
    },
    {
      key: "R1",
      base: [-0.16, 1.25, 0.69],
      mid: [-0.32, 1.68, 0.85],
      end: [-0.43, 2.38, 1.02],
      dir: [-0.12, 0.02, 1],
      scale: [0.29, 0.31, 0.34] as [number, number, number],
    },
    {
      key: "L2",
      base: [0.28, 1.22, 0.64],
      mid: [0.63, 1.54, 0.77],
      end: [0.82, 2.17, 0.91],
      dir: [0.22, 0.02, 1],
      scale: [0.27, 0.29, 0.32] as [number, number, number],
    },
    {
      key: "R2",
      base: [-0.28, 1.22, 0.64],
      mid: [-0.63, 1.54, 0.77],
      end: [-0.82, 2.17, 0.91],
      dir: [-0.22, 0.02, 1],
      scale: [0.27, 0.29, 0.32] as [number, number, number],
    },
  ];

  const necks: any[] = [];

  for (const spec of neckSpecs) {
    const neckPath = catmull([spec.base, spec.mid, spec.end]);
    const neck = b.chain(`neck${spec.key}`, neckPath, {
      parent: body.tip ?? body.joints[body.joints.length - 1],
      names: [
        `neck${spec.key}1`,
        `neck${spec.key}2`,
        `neck${spec.key}Tip`,
      ],
      role: "neck",
      group: "skeleton",
    });

    const head = b.joint(`head${spec.key}`, {
      parent: neck.tip ?? neck.joints[neck.joints.length - 1],
      at: neck.at(1),
      dir: spec.dir,
      role: "head",
      group: "skeleton",
    });

    const jaw = b.joint(`jaw${spec.key}`, {
      parent: head,
      at: head.local({
        forward: 0.14,
        down: 0.045,
      }),
      dir: spec.dir,
      role: "jaw",
      group: "skeleton",
    });

    necks.push({
      key: spec.key,
      neck,
      head,
      jaw,
      scale: spec.scale,
    });
  }

  // Open all five lower jaws in the rest pose.
  for (const item of necks) {
    b.pose(item.jaw, {
      axis: [1, 0, 0],
      deg: 17,
    });
  }

  const legs: any[] = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const frontRoot = [side * 0.27, 1.03, 0.43];
    const frontTarget = [side * 0.48, 0.115, 0.5];
    const frontPoints = limb(
      frontRoot,
      frontTarget,
      [0.39, 0.35, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );

    const frontLeg = b.chain(`legF${sideName}`, frontPoints, {
      parent: body.jointAt(0.78),
      names: [
        `hipF${sideName}`,
        `kneeF${sideName}`,
        `ankleF${sideName}`,
        `footF${sideName}`,
      ],
      role: "leg",
      contact: frontTarget,
      group: "skeleton",
    });

    const rearRoot = [side * 0.29, 0.98, -0.25];
    const rearTarget = [side * 0.5, 0.115, -0.56];
    const rearPoints = limb(
      rearRoot,
      rearTarget,
      [0.42, 0.36, 0.25],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );

    const rearLeg = b.chain(`legH${sideName}`, rearPoints, {
      parent: body.jointAt(0.2),
      names: [
        `hipH${sideName}`,
        `kneeH${sideName}`,
        `ankleH${sideName}`,
        `footH${sideName}`,
      ],
      role: "leg",
      contact: rearTarget,
      group: "skeleton",
    });

    legs.push({
      side,
      front: frontLeg,
      rear: rearLeg,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Main body, tail, necks, and the armored skin.

  const bodyTube = b.sweep(
    body,
    (t) => [0.29 + 0.08 * t, 0.255 + 0.07 * t],
    {
      color: COAT,
      section: { ngon: 8 },
      smooth: false,
      sectors: [[122, 238, BELLY]],
      name: "armoredBody",
      group: "body",
    },
  );

  const tailTube = b.sweep(
    tail,
    (t) => 0.135 * (1 - t) + 0.027,
    {
      color: COAT,
      bands: [
        [0.72, NECK_COAT],
        [0.9, SCARLET],
      ],
      section: { ngon: 7 },
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "barbedTail",
      group: "tail",
    },
  );

  const neckTubes: any[] = [];

  for (const item of necks) {
    const tube = b.sweep(
      item.neck,
      (t) => [0.145 - 0.045 * t, 0.135 - 0.048 * t],
      {
        color: NECK_COAT,
        bands: [
          [0.12, SCARLET],
          [0.18, NECK_COAT],
        ],
        sectors: [[120, 240, BELLY]],
        section: { ngon: 7 },
        smooth: false,
        name: `neckTube_${item.key}`,
        group: "neck",
      },
    );

    neckTubes.push(tube);
  }

  // Raised dorsal spines along the torso and curling tail.
  for (let i = 1; i <= 9; i++) {
    const t = 0.1 + (i / 10) * 0.78;
    const at = bodyTube.at(t, 0, 0.008);
    b.spike(at, at, 0.16 + 0.055 * Math.sin(t * Math.PI), 0.042, {
      color: BONE,
      caps: "point",
      name: `bodySpine_${i}`,
      group: "spines",
    });
  }

  for (let i = 1; i <= 8; i++) {
    const t = 0.14 + (i / 9) * 0.78;
    const at = tailTube.at(t, 0, 0.006);
    b.spike(at, at, 0.125 - 0.008 * i, 0.031 - 0.002 * i, {
      color: BONE_DARK,
      caps: "point",
      name: `tailSpine_${i}`,
      group: "spines",
    });
  }

  for (let n = 0; n < neckTubes.length; n++) {
    const tube = neckTubes[n];
    for (let i = 1; i <= 4; i++) {
      const t = 0.14 + (i / 5) * 0.67;
      const at = tube.at(t, 0, 0.007);
      b.spike(at, at, 0.105 - i * 0.009, 0.029, {
        color: BONE_DARK,
        caps: "point",
        name: `neckSpine_${necks[n].key}_${i}`,
        group: "spines",
      });
    }
  }

  // Bronze armor collars around the five neck roots.
  for (let i = 0; i < necks.length; i++) {
    const neckSurface = b.surface(neckTubes[i]);
    const collar = neckSurface.loop(necks[i].neck.at(0.16), {
      lift: 0.012,
    });

    b.sweep(collar, 0.018, {
      color: BRONZE,
      caps: "none",
      section: { ngon: 6 },
      name: `bronzeCollar_${necks[i].key}`,
      group: "armor",
    });

    const collar2 = neckSurface.loop(necks[i].neck.at(0.22), {
      lift: 0.01,
    });

    b.sweep(collar2, 0.009, {
      color: BRONZE_HI,
      caps: "none",
      section: { ngon: 6 },
      name: `collarHighlight_${necks[i].key}`,
      group: "armor",
    });
  }

  // Raised scale plates scattered over the body and necks.
  const bodySurface = b.surface(bodyTube);
  const bodyPlates = bodySurface.scatter(46, {
    rng: rng(2301),
    minDist: 0.105,
    filter: (h: any) => h.n.y > -0.52 && h.n.z < 0.84,
  });

  for (let i = 0; i < bodyPlates.length; i++) {
    b.stick(
      new THREE.ConeGeometry(
        0.043 + (i % 3) * 0.006,
        0.026 + (i % 2) * 0.006,
        6,
      ),
      i % 5 === 0 ? BRONZE_DARK : BONE_DARK,
      bodyPlates[i],
      {
        embed: 0.47,
        spin: i * 31,
        name: `bodyScale_${i}`,
        group: "scales",
      },
    );
  }

  for (let n = 0; n < neckTubes.length; n++) {
    const neckSurface = b.surface(neckTubes[n]);
    const plates = neckSurface.scatter(8, {
      rng: rng(2400 + n),
      minDist: 0.07,
      filter: (h: any) => h.n.y > -0.25,
    });

    for (let i = 0; i < plates.length; i++) {
      b.stick(
        new THREE.ConeGeometry(0.032, 0.023, 6),
        i % 4 === 0 ? BRONZE_HI : BONE_DARK,
        plates[i],
        {
          embed: 0.47,
          spin: i * 47,
          name: `neckScale_${necks[n].key}_${i}`,
          group: "scales",
        },
      );
    }
  }

  // Broad bronze plates sit on the shoulders and ribs.
  const armorHits = bodySurface.scatter(15, {
    rng: rng(3301),
    minDist: 0.13,
    filter: (h: any) => Math.abs(h.n.x) > 0.58 && h.n.y > -0.15,
  });

  for (let i = 0; i < armorHits.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.067, 0.067, 0.018, 6),
      i % 3 === 0 ? BRONZE_HI : BRONZE,
      armorHits[i],
      {
        embed: 0.38,
        spin: i * 19,
        name: `ribArmor_${i}`,
        group: "armor",
      },
    );
  }

  // A pair of luminous red scars cut across the left flank and chest.
  const scarA = bodySurface.nearest([0.315, 1.23, 0.37]);
  const scarB = bodySurface.nearest([-0.325, 1.27, 0.52]);

  const scarPartA = b.decal(bodySurface, SCAR_TEXTURE, {
    at: scarA,
    dir: scarA.n,
    up: [0, 1, 0],
    size: [0.37, 0.082],
    segments: [9, 3],
    lift: 0.006,
    name: "leftFlankScar",
    group: "scars",
  });

  const scarPartB = b.decal(bodySurface, SCAR_TEXTURE, {
    at: scarB,
    dir: scarB.n,
    up: [0, 1, 0],
    size: [0.3, 0.07],
    segments: [8, 3],
    lift: 0.006,
    mirror: true,
    name: "rightChestScar",
    group: "scars",
  });

  glow(scarPartA, 0.18);
  glow(scarPartB, 0.18);

  // -------------------------------------------------------------------------------------------------------------
  // Five heads, their faces, jaws, horns, eyes, war paint, and cheek armor.

  for (let i = 0; i < necks.length; i++) {
    addHeadDetails(b, necks[i], i);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Four heavy legs with angular knee armor, feet, and separated claws.

  for (const item of legs) {
    for (const leg of [item.front, item.rear]) {
      const side = item.side;
      const isFront = leg.name.includes("F");
      const tube = b.sweep(
        leg,
        (t) => {
          if (t < 0.35) return [0.095, 0.105];
          if (t < 0.7) return [0.078, 0.085];
          return [0.068, 0.074];
        },
        {
          color: COAT,
          section: { ngon: 6 },
          smooth: false,
          sectors: [[118, 242, BELLY]],
          name: `${leg.name}_tube`,
          group: "legs",
        },
      );

      const knee = leg.joints[1];
      sphere(
        b,
        BONE_DARK,
        knee.at,
        [0.13, 0.12, 0.12],
        knee,
        `${leg.name}_kneeArmor`,
      );

      const shin = leg.joints[2];
      b.part(
        new THREE.BoxGeometry(0.135, 0.18, 0.105),
        BRONZE,
        {
          bone: shin,
          at: shin.at,
          dir: shin.axis,
          scale: [1, 1, 1],
          flat: true,
          name: `${leg.name}_shinPlate`,
          group: "armor",
        },
      );

      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      sphere(
        b,
        NECK_COAT,
        foot.at,
        [0.12, 0.09, 0.16],
        foot,
        `${leg.name}_paw`,
      );

      const clawDirections = [
        new THREE.Vector3(side * 0.34, 0, 1).normalize(),
        new THREE.Vector3(side * 0.05, 0, 1).normalize(),
        new THREE.Vector3(-side * 0.28, 0, 1).normalize(),
      ];

      for (let i = 0; i < clawDirections.length; i++) {
        b.spike(foot.at, clawDirections[i], isFront ? 0.145 : 0.16, 0.026, {
          bone: foot,
          color: CLAW,
          caps: "point",
          name: `${leg.name}_claw_${i}`,
          group: "claws",
        });
      }

      // A small bronze ring around each ankle makes the silhouette feel forged.
      const legSurface = b.surface(tube);
      const ankleLoop = legSurface.loop(leg.at(0.73), {
        lift: 0.008,
      });

      b.sweep(ankleLoop, 0.012, {
        color: BRONZE,
        caps: "none",
        section: { ngon: 6 },
        name: `${leg.name}_ankleRing`,
        group: "armor",
      });
    }
  }

  // Heavy tail-end barb, kept above the floor in the neutral pose.
  const tailTip = tailTube.at(1, 0, 0.008);
  b.spike(tailTip, tailTip, 0.17, 0.05, {
    color: BONE,
    caps: "point",
    name: "tailTipBarb",
    group: "tail",
  });

  // A few thick lower jaw plates emphasize the open, hinged mouth silhouettes.
  for (const item of necks) {
    const jaw = item.jaw;
    const plateA = jaw.local({ left: -0.09, forward: 0.17, down: 0.02 });
    const plateB = jaw.local({ left: 0.09, forward: 0.17, down: 0.02 });

    b.rod(plateA, plateB, 0.017, BONE_DARK, {
      bone: jaw,
      name: `lowerJawPlate_${item.key}`,
      group: "jaw",
    });
  }

  return b.root;
}

const BRONZE_DARK = "#51311f";

import { BoxGeometry, PlaneGeometry } from "three";
import type { Texture } from "three";
import type { Chain } from "../src/skeleton";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { cellPaint, pixelArt } from "../kits/pixel";
import { paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Hit } from "../src/surface";

export const meta = {
  name: "NES Yeti",
  description:
    "A hulking 8-bit NES yeti in 3D: chunky blue-shadowed snow fur, a leathery mask and jaw, tusks, huge feet, outstretched clawed hands, frost and icicles.",
  builtBy: "GPT-6 Astra",
};

type V3 = [number, number, number];

// One NES texel is four centimetres in model space. The same scale drives paint cells and sprites.
const TEXEL = 0.04;
const BLACK = "#101425";
const DEEP = "#1b2340";
const NAVY = "#293a66";
const BLUE = "#4f78a5";
const FROST = "#83b6d2";
const SHADOW = "#b1c8d8";
const WHITE = "#f1f0df";
const FACE = "#252033";
const FACE_LIT = "#4c3b4d";
const MOUTH = "#702c48";
const TONGUE = "#bd4d67";
const TUSK = "#ead9aa";

const FUR = [DEEP, NAVY, BLUE, SHADOW, WHITE] as const;
const FACE_RAMP = [BLACK, FACE, FACE_LIT] as const;
const ICE = [BLUE, FROST, SHADOW, WHITE] as const;
const CLAW = [BLACK, DEEP, NAVY] as const;

const fur = (tone = 0) =>
  cellPaint(
    TEXEL,
    (c) => {
      const n = c.n.y;
      const fleck = c.random(17) * 0.16 - 0.08;
      const vertical = c.axis === 1 ? 0.06 : 0;
      const v = 0.53 + tone + 0.25 * n + fleck + vertical;
      if (n > 0.7 && c.random(23) < 0.18) return c.pick([SHADOW, WHITE], 0.25 + 0.55 * n);
      if (n < -0.35) return c.pick([DEEP, NAVY, BLUE], 0.3 + 0.25 * (n + 1));
      return c.pick(FUR, v);
    },
    { dither: true },
  );

const LEG_FUR = fur(-0.05);
const HEAD_FUR = fur(0.06);
const ICE_PAINT = cellPaint(TEXEL, (c) => c.pick(ICE, 0.42 + 0.42 * c.n.y + 0.12 * (c.random(5) - 0.5)), {
  dither: true,
});
const FACE_PAINT = cellPaint(TEXEL, (c) => c.pick(FACE_RAMP, 0.35 + 0.28 * c.n.y + 0.12 * (c.random(9) - 0.5)), {
  dither: true,
});
const TUSK_PAINT = cellPaint(TEXEL, (c) => c.pick([TUSK, SHADOW, WHITE], 0.54 + 0.22 * c.n.y), {
  dither: true,
});

const SPRITE_KEY: Record<string, string> = {
  B: BLACK,
  D: DEEP,
  N: NAVY,
  F: FACE,
  L: FACE_LIT,
  W: WHITE,
  I: FROST,
  R: MOUTH,
  T: TONGUE,
  C: TUSK,
};

function sprite(rows: readonly string[]) {
  return pixelArt(rows, SPRITE_KEY);
}

const FUR_LOCK = sprite([
  "...NN...",
  "..NBBN..",
  ".NBBBBN.",
  "NBBBBBBN",
  "NBNBBNBN",
  "DBBBBBBD",
  "DBBWWBBD",
  "DDDDDDDD",
]);
const FUR_LONG = sprite([
  "....N....",
  "...NNN...",
  "..NBBBN..",
  ".NBBBBBN.",
  "NBBBBBBBN",
  "NBNBBNBNN",
  "DBBBBBBDD",
  "DBBWWBBDD",
  "DDDDDDDDD",
  "DDDDDDDDD",
]);
const EYE_L = sprite(["NNW", "NBN", "NNN"]);
const EYE_R = sprite(["WNN", "NBN", "NNN"]);
const NOSE = sprite([
  "DDDDDDDD",
  "DFFFFFFD",
  "DFLLLLFD",
  "DFFBBFFD",
  "DFFBBFFD",
  "DLLLLLFD",
  "DDDDDDDD",
]);
const MOUTH_FLOOR = sprite([
  "CCCCCCCCCCCC",
  "CRTTTTTTRCCC",
  "CCTTTTTTTTCC",
  "CCRRRRRRRRCC",
  "CCCCCCCCCCCC",
]);
const MOUTH_ROOF = sprite([
  "DDDDDDDDDDDD",
  "DCCRRRRCCCDD",
  "DCRRRRRRRCCD",
  "DDDDDDDDDDDD",
]);
const ICE_CARD = sprite([
  "IIII",
  "IIII",
  ".II.",
  ".II.",
  "..I.",
  "..I.",
  "...I",
  "...I",
]);

function stairs(rows: readonly number[]) {
  const right: [number, number][] = [];
  rows.forEach((half, i) => right.push([half * TEXEL, i * TEXEL], [half * TEXEL, (i + 1) * TEXEL]));
  const loop = [...right, ...[...right].reverse().map(([x, y]) => [-x, y] as [number, number])];
  return loop.filter(([x, y], i) => {
    const [px, py] = loop[(i + loop.length - 1) % loop.length];
    return x !== px || y !== py;
  });
}

const EAR = stairs([3, 4, 4, 3, 3, 2, 1, 1]);

export default function build() {
  const b = createBuilder({ name: "nesYeti", paintSize: 1024 });

  // Skeleton first: compact spine and neck, a separate jaw, four long limbs, then fingers.
  const hips = b.joint("hips", { at: [0, 1.12, -0.12], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.12],
      [0, 1.3, 0.02],
      [0, 1.5, 0.18],
      [0, 1.64, 0.3],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const neckPath = catmull([
    [0, 1.62, 0.28],
    [0, 1.79, 0.34],
    [0, 1.93, 0.38],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.94, 0.4],
    dir: [0, -0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.12, 0.06]),
    aim: head.local([0, -0.2, 0.48]),
    role: "jaw",
    group: "jaw",
  });

  const armChains: { side: 1 | -1; chain: Chain; group: string }[] = [];
  for (const [side, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulder = [side * 0.48, 1.58, 0.22] as V3;
    const arm = b.chain(
      `arm${tag}`,
      polyline([
        shoulder,
        [side * 0.72, 1.44, 0.28],
        [side * 0.98, 1.25, 0.34],
        [side * 1.16, 1.13, 0.42],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`],
        role: "arm",
        group: `arm${tag}`,
      },
    );
    armChains.push({ side, chain: arm, group: `arm${tag}` });

    const radii = [0.2, 0.18, 0.15, 0.19];
    b.sweep(arm, radii, {
      section: { ngon: 6 },
      color: LEG_FUR,
      caps: { start: "round", end: "round" },
      group: `arm${tag}`,
      name: "arm",
    });

    // Three separated block fingers per hand, extended in a readable rest pose.
    const palm = arm.joints[2];
    for (const [finger, dz] of [
      ["thumb", 0.1],
      ["index", 0.0],
      ["middle", -0.1],
    ] as const) {
      const root: V3 = [side * 1.17, 1.1 + (finger === "thumb" ? 0.08 : 0), 0.42 + dz];
      const tip: V3 = [side * 1.43, 1.03 + (finger === "thumb" ? 0.08 : 0), 0.54 + dz * 1.2];
      const digit = b.chain(`digit${finger}${tag}`, polyline([root, tip]), {
        parent: palm,
        names: [`${finger}Tip${tag}`],
        role: "digit",
        group: `hand${tag}`,
      });
      b.sweep(digit, [0.055, 0.038], {
        section: "box",
        color: LEG_FUR,
        caps: { start: "flat", end: "flat" },
        group: `hand${tag}`,
        name: "finger",
      });
      b.spike(tip, [side * 0.24, -0.06, 0.12], 0.1, 0.035, {
        bone: digit.joints[0],
        section: { ngon: 4 },
        color: CLAW[1],
        group: `hand${tag}`,
        name: "claw",
      });
    }
  }

  const legChains: { side: 1 | -1; chain: Chain; group: string }[] = [];
  for (const [side, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const [kind, z, parent] of [
      ["front", 0.28, spine.joints[1]],
      ["hind", -0.35, hips],
    ] as const) {
      const group = `${kind}Leg${tag}`;
      const leg = b.chain(
        `${kind}Leg${tag}`,
        polyline([
          [side * 0.38, 1.05, z],
          [side * 0.43, 0.72, z + (kind === "front" ? 0.03 : -0.03)],
          [side * 0.46, 0.34, z + 0.02],
          [side * 0.47, 0.18, z + 0.12],
        ]),
        {
          parent,
          names: [`${kind}Hip${tag}`, `${kind}Knee${tag}`, `${kind}Ankle${tag}`],
          role: "leg",
          contact: [side * 0.47, 0, z + 0.24],
          group,
        },
      );
      legChains.push({ side, chain: leg, group });
      b.sweep(leg, [0.24, 0.21, 0.18, 0.17], {
        section: "box",
        color: LEG_FUR,
        caps: { start: "round", end: "flat" },
        group,
        name: "leg",
      });
      const foot = leg.joints[2];
      b.part(new BoxGeometry(0.48, 0.28, 0.7), LEG_FUR, {
        bone: foot,
        at: [side * 0.47, 0.14, z + 0.2],
        group,
        name: "hugeFoot",
      });
      for (const dx of [-0.12, 0, 0.12])
        b.spike(
          [side * 0.47 + dx, 0.18, z + 0.5],
          [0, -0.02, 1],
          0.13,
          0.035,
          { bone: foot, section: { ngon: 4 }, color: CLAW[1], group, name: "toeClaw" },
        );
    }
  }

  // Chunky barrel and high shoulder mass, each section intentionally faceted.
  const body = b.loft(
    [
      { at: [0, 1.06, -0.52], w: 0.68, h: 0.66 },
      { at: [0, 1.18, -0.28], w: 0.94, h: 0.9 },
      { at: [0, 1.34, 0.02], w: 1.06, h: 1.02 },
      { at: [0, 1.52, 0.26], w: 1.0, h: 1.02 },
      { at: [0, 1.63, 0.45], w: 0.78, h: 0.8 },
    ],
    {
      bone: [hips, spine, neck],
      section: { ngon: 8 },
      color: fur(),
      group: "body",
      name: "barrel",
    },
  );

  // White crown and side fur frame the separate dark face.
  const skull = b.loft(
    [
      { at: [0, 1.78, 0.28], w: 0.72, h: 0.62 },
      { at: [0, 1.94, 0.38], w: 0.74, h: 0.67 },
      { at: [0, 2.08, 0.52], w: 0.62, h: 0.54 },
      { at: [0, 2.08, 0.65], w: 0.48, h: 0.42 },
    ],
    { bone: head, section: { ngon: 8 }, color: HEAD_FUR, group: "head", name: "skullFur" },
  );
  b.loft(
    [
      { at: [0, 1.82, 0.48], w: 0.58, h: 0.5 },
      { at: [0, 1.84, 0.7], w: 0.56, h: 0.46 },
      { at: [0, 1.87, 0.88], w: 0.46, h: 0.34 },
    ],
    { bone: head, section: "box", color: FACE_PAINT, caps: { start: "flat", end: "flat" }, group: "face", name: "leatherFace" },
  );

  // Pixel eyes and a broad square nose on the front plane.
  const eyeTextures: Record<number, Texture> = { 1: EYE_L, [-1]: EYE_R };
  for (const side of [1, -1] as const) {
    b.part(new PlaneGeometry(3 * TEXEL, 3 * TEXEL), "#ffffff", {
      texture: eyeTextures[side],
      bone: head,
      at: [side * 0.27, 1.98, 0.82],
      dir: [side * 0.35, 0.05, 1],
      axis: "z",
      up: [0, 1, 0],
      group: "face",
      name: "pixelEye",
    });
  }
  b.part(new PlaneGeometry(8 * TEXEL, 7 * TEXEL), "#ffffff", {
    texture: NOSE,
    bone: head,
    at: [0, 1.87, 0.895],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    group: "face",
    name: "squareNose",
  });

  // A broad separate lower jaw carries its own mouth roof/floor and opens on a hinge.
  b.loft(
    [
      { at: head.local([0, -0.1, 0.08]), w: 0.5, h: 0.2 },
      { at: head.local([0, -0.16, 0.28]), w: 0.45, h: 0.18 },
      { at: head.local([0, -0.2, 0.48]), w: 0.32, h: 0.14 },
    ],
    { bone: jaw, section: "box", color: FACE_PAINT, caps: { start: "flat", end: "flat" }, group: "jaw", name: "lowerJaw" },
  );
  b.part(new PlaneGeometry(12 * TEXEL, 5 * TEXEL), "#ffffff", {
    texture: MOUTH_FLOOR,
    bone: jaw,
    at: head.local([0, -0.1, 0.28]),
    dir: head.dir([0, 1, 0]),
    axis: "z",
    up: head.dir([0, 0, 1]),
    group: "jaw",
    name: "mouthFloor",
  });
  b.part(new PlaneGeometry(12 * TEXEL, 4 * TEXEL), "#ffffff", {
    texture: MOUTH_ROOF,
    bone: head,
    at: [0, 1.82, 0.68],
    dir: [0, -1, 0],
    axis: "z",
    up: [0, 0, 1],
    group: "face",
    name: "mouthRoof",
  });

  // Twin lower tusks and shorter upper fangs, all square-section and pixel-quantised.
  for (const side of [1, -1] as const) {
    b.sweep(
      catmull([
        [side * 0.2, 1.72, 0.62],
        [side * 0.28, 1.57, 0.75],
        [side * 0.31, 1.48, 0.92],
        [side * 0.24, 1.54, 1.02],
      ]),
      [0.085, 0.055, 0.025, 0],
      { bone: jaw, section: { ngon: 4 }, color: TUSK_PAINT, caps: { start: "flat", end: "point" }, group: "jaw", name: "lowerTusk" },
    );
    b.spike([side * 0.18, 1.78, 0.72], [side * 0.05, -1, 0.12], 0.14, 0.045, {
      bone: head,
      section: { ngon: 4 },
      color: TUSK_PAINT,
      group: "face",
      name: "upperTusk",
    });
  }

  // Stepped ears and icy blue inner pixels on hinge joints.
  for (const [side, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ear = b.joint(`ear${tag}`, {
      parent: head,
      at: [side * 0.36, 2.12, 0.31],
      dir: [side * 0.7, 0.55, -0.15],
      role: "hinge",
      group: "head",
    });
    const inner = paint((_p, _n, s) => (s[1] < 0.08 || s[1] > 0.25 ? NAVY : s[0] > 0 ? FROST : FACE_LIT));
    b.extrude(EAR, {
      at: ear,
      x: [side, 0, 0],
      y: [0.15 * side, 1, -0.15],
      thickness: 0.055,
      color: inner,
      bone: ear,
      group: "head",
      name: "steppedEar",
    });
  }

  // Pixel hair cards make the silhouette shaggy without abandoning chunky primitives.
  const bodyHits = b.surface(body).scatter(105, {
    rng: rng(41),
    minDist: 0.16,
    filter: (h: Hit) => h.at.y > 1.18 && h.n.y > -0.3,
  });
  b.cards(bodyHits, [FUR_LOCK, FUR_LONG], {
    size: [0.16, 0.32],
    lean: 54,
    bend: 12,
    vary: 0.18,
    spin: 18,
    cross: true,
    rng: rng(42),
    color: HEAD_FUR,
    group: "furCards",
    name: "bodyShag",
  });
  const headHits = b.surface(skull).scatter(36, {
    rng: rng(43),
    minDist: 0.13,
    filter: (h: Hit) => h.at.z < 0.7 && h.n.y > -0.25,
  });
  b.cards(headHits, FUR_LOCK, {
    size: [0.14, 0.25],
    lean: 48,
    vary: 0.15,
    spin: 20,
    cross: true,
    rng: rng(44),
    color: HEAD_FUR,
    group: "furCards",
    name: "headShag",
  });
  for (const arm of armChains)
    b.cards(
      [0.25, 0.5, 0.75].map((t) => arm.chain.at(t)),
      FUR_LOCK,
      {
        size: [0.13, 0.22],
        lean: 42,
        flow: [0, -1, 0],
        vary: 0.12,
        rng: rng(51 + arm.side),
        color: LEG_FUR,
        group: arm.group,
        name: "armTuft",
      },
    );

  // Blue frost follows upward-facing body hits; long icicles hang under belly and jaw.
  const frostHits = bodyHits.filter((h) => h.n.y > 0.55).slice(0, 18);
  b.cards(frostHits, ICE_CARD, {
    size: [0.1, 0.2],
    lean: 92,
    flow: [0, -1, 0],
    vary: 0.14,
    rng: rng(61),
    color: ICE_PAINT,
    group: "frost",
    name: "frostPixels",
  });
  const icicleHits = b.surface(body).scatter(22, {
    rng: rng(62),
    minDist: 0.2,
    filter: (h: Hit) => h.n.y < -0.62 && h.at.z > -0.3,
  });
  for (const [i, hit] of icicleHits.entries())
    b.spike(hit, [0, -1, 0], 0.12 + (i % 4) * 0.045, 0.045, {
      color: ICE_PAINT,
      section: { ngon: 4 },
      group: "frost",
      name: "bellyIcicle",
    });

  // Open the jaw slightly for the required readable rest pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}

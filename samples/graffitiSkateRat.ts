import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { gradient, noise, paint, spots, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, INK } from "../kits/toon";

export const meta = {
  name: "Graffiti Skate Rat",
  description: "A cocky street rat standing on a skateboard, holding a spray can.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "graffitiSkateRat" });

  // ---------- palette (toon cel paints, loud spray colours) ----------
  const FUR = cel("#9a8d7d");
  const FUR_DARK = cel("#6e6257");
  const BELLY = cel("#f2e3c8");
  const TAIL = cel("#c99a92");
  const HOODIE = cel(
    paint((p, _n, s) => {
      const stripe = (
        (((s[0] / 0.055 + Math.sin(p.y * 40) * 0.15) % 1) + 1) % 1 < 0.35 ? "#c40e63" : "#ff2e88"
      ) as string;
      if (Math.sin(p.x * 110 + Math.sin(p.y * 34)) > 0.72 && p.y < 0.7) return "#7a1150";
      if (noise(p, 0.03, 3) > 0.8) return "#ffd7ea";
      return stripe;
    }),
  );
  const SLEEVE = cel("#00c2d1");
  const HOOD = cel("#7a1150");
  const SHORTS = cel(
    spots("#2e5bff", ["#ffde00", "#ff2e88", "#00c2d1", "#ffffff"], {
      size: 0.035,
      amount: 0.45,
      seed: 11,
    }),
  );
  const CAP = cel("#1d1d24");
  const BRIM = cel("#ffde00");
  const SHOE = cel("#f5f2ea");
  const SHOE_RED = cel("#ff2e2e");
  const GRIP = cel("#17171c");
  const DECK = cel("#e8a04c");
  const WHEEL_Y = cel("#e8ff2e");
  const WHEEL_P = cel("#ff2e88");
  const STEEL = cel("#8a8f9a");
  const CAN = cel(stripes("#c0c4cc", "#ff2e88", { size: 0.03, axis: "y", width: 0.5 }));
  const POCKET = cel("#7a1150");
  const PINK_IN = cel("#ff9ec6");
  const NOSE = cel("#e0455a");

  // ---------- spray-tag textures ----------
  const tagRat = svg(
    `<svg viewBox="0 0 128 64"><g transform="rotate(-8 64 32)"><text x="64" y="44" font-family="sans-serif" font-weight="900" font-size="38" text-anchor="middle" fill="#ffffff" stroke="#22112f" stroke-width="6" paint-order="stroke">RAT!</text></g><circle cx="14" cy="52" r="3" fill="#00c2d1"/><circle cx="112" cy="12" r="4" fill="#ffde00"/></svg>`,
    { size: 256 },
  );
  const tagStar = svg(
    `<svg viewBox="0 0 64 64"><polygon points="32,2 39,22 60,22 43,34 49,55 32,42 15,55 21,34 4,22 25,22" fill="#ffde00" stroke="#22112f" stroke-width="5"/><text x="32" y="40" font-family="sans-serif" font-weight="900" font-size="22" text-anchor="middle" fill="#ff2e88">Z</text></svg>`,
    { size: 128 },
  );
  const tagCrown = svg(
    `<svg viewBox="0 0 64 48"><polygon points="6,42 10,14 22,26 32,6 42,26 54,14 58,42" fill="#ffde00" stroke="#22112f" stroke-width="4"/><rect x="6" y="40" width="52" height="6" fill="#ff2e88" stroke="#22112f" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const tagDeck = svg(
    `<svg viewBox="0 0 256 64"><g transform="rotate(-4 128 32)"><text x="128" y="45" font-family="sans-serif" font-weight="900" font-size="40" text-anchor="middle" fill="#ffffff" stroke="#ff2e88" stroke-width="7" paint-order="stroke">SKATE</text></g></svg>`,
    { size: 512 },
  );
  const EYE = animeEye({ iris: "#ff2e88" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.54, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.54, 0],
      [0, 0.66, 0.01],
      [0, 0.78, 0.02],
    ],
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.8, 0.02], dir: [0, 0.4, 1], role: "neck" });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.88, 0.04],
    dir: [0, 0.15, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.838, 0.1],
    dir: [0, -0.25, 1],
    role: "jaw",
  });

  // arms held out from the body (rest pose); legs splayed onto the board
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.chain(
      `arm${S}`,
      [
        [s * 0.17, 0.74, 0.02],
        [s * 0.31, 0.63, 0.06],
        [s * 0.37, 0.56, 0.14],
      ],
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.chain(
      `leg${S}`,
      [
        [s * 0.09, 0.52, 0],
        [s * 0.13, 0.32, 0.06],
        [s * 0.24, 0.17, 0],
      ],
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`],
        role: "leg",
        contact: [s * 0.24, 0.115, 0],
      },
    );
  }
  const tail = b.chain(
    "tail",
    [
      [0, 0.52, -0.09],
      [-0.12, 0.4, -0.3],
      [-0.3, 0.28, -0.28],
      [-0.34, 0.22, -0.05],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const board = b.joint("board", { parent: hips, at: [0, 0.105, 0] });

  // ---------- torso: oversized tagged hoodie ----------
  const hoodie = b.loft(
    [
      { at: [0, 0.5, 0], w: 0.34, h: 0.24 },
      { at: [0, 0.62, 0.01], w: 0.36, h: 0.26 },
      { at: [0, 0.74, 0.02], w: 0.32, h: 0.24 },
      { at: [0, 0.82, 0.02], w: 0.24, h: 0.18 },
    ],
    { bone: [hips, spine.joints[0], chest], color: HOODIE },
  );
  // belly patch peeking below the hoodie hem
  b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, {
    bone: hips,
    at: [0, 0.46, 0.05],
    scale: [0.1, 0.07, 0.075],
  });
  // hood lump behind the neck
  b.part(new THREE.SphereGeometry(1, 12, 8), HOOD, {
    bone: chest,
    at: [0, 0.79, -0.13],
    scale: [0.1, 0.075, 0.055],
  });
  // hoodie pocket + drawstrings
  b.part(new THREE.BoxGeometry(0.16, 0.09, 0.03), POCKET, {
    bone: chest,
    at: [0, 0.56, 0.135],
  });
  for (const s of [1, -1]) {
    b.capsule([s * 0.035, 0.66, 0.125], [s * 0.035, 0.58, 0.13], 0.006, { color: SHOE });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), BRIM, {
      bone: chest,
      at: [s * 0.035, 0.575, 0.13],
    });
  }
  // sleeves over the upper arms
  for (const s of [1, -1]) {
    b.capsule([s * 0.17, 0.74, 0.02], [s * 0.26, 0.665, 0.045], 0.062, { color: SLEEVE });
  }
  // tags stuck on the hoodie
  b.decal(hoodie, tagRat, {
    at: [0.01, 0.68, 0.16],
    dir: [0, 0, 1],
    size: [0.2, 0.1],
  });
  b.decal(hoodie, tagStar, {
    at: [-0.11, 0.6, 0.14],
    dir: [0, 0, 1],
    size: [0.06, 0.06],
  });
  b.decal(hoodie, tagStar, {
    at: [0.12, 0.62, -0.14],
    dir: [0, 0, -1],
    size: [0.07, 0.07],
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FUR, {
    bone: head,
    at: [0, 0.885, 0.06],
    scale: [0.088, 0.08, 0.085],
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.885, 0.06]).at(s * 38, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.055, 0.075], mirror: s > 0 });
  }
  // big round ears with pink inners
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), FUR_DARK, {
      bone: head,
      at: [s * 0.075, 0.985, 0.02],
      scale: [0.052, 0.06, 0.022],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK_IN, {
      bone: head,
      at: [s * 0.075, 0.982, 0.038],
      scale: [0.032, 0.04, 0.01],
    });
  }
  // long snout + nose
  b.frustumBox([0, 0.872, 0.1], [0, 0.862, 0.235], [0.095, 0.075], [0.06, 0.055], {
    bone: head,
    color: FUR,
  });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.868, 0.24],
    scale: [1.1, 0.8, 0.7],
  });
  // whiskers (rooted inside the snout)
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.capsule([s * 0.02, 0.862 - i * 0.006, 0.2], [s * 0.13, 0.872 + (i - 1) * 0.012, 0.24], 0.0016, {
        bone: head,
        color: INK,
      });
    }
  }
  // separate lower jaw with buck teeth
  b.frustumBox([0, 0.842, 0.06], [0, 0.83, 0.2], [0.07, 0.03], [0.05, 0.025], {
    bone: jaw,
    color: FUR_DARK,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.016, 0.02, 0.008), SHOE, {
      bone: jaw,
      at: [s * 0.011, 0.845, 0.228],
    });
  }
  // backwards cap: dome + brim pointing back + button
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.078, 0.012],
      [0.05, 0.045],
      [0.012, 0.06],
      [0, 0.062],
    ],
    { at: [0, 0.945, 0.03], bone: head, smoothing: 1, color: CAP },
  );
  b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.07, -0.09],
      [0, -0.11],
      [-0.07, -0.09],
    ],
    {
      at: [0, 0.948, -0.03],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.012,
      smoothing: 1,
      bone: head,
      color: BRIM,
    },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 5), SHOE_RED, {
    bone: head,
    at: [0, 1.008, 0.03],
  });

  // ---------- arms, hands, spray can ----------
  for (const s of [1, -1]) {
    b.capsule([s * 0.26, 0.665, 0.045], [s * 0.31, 0.63, 0.06], 0.038, { color: FUR });
    b.capsule([s * 0.31, 0.63, 0.06], [s * 0.37, 0.56, 0.14], 0.032, { color: FUR });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), FUR, {
      at: [s * 0.37, 0.555, 0.15],
    });
  }
  // spray can clutched in the right hand (model's right = -X)
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 12), CAN, {
    at: [-0.37, 0.6, 0.155],
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.024, 0.025, 10), CAP, {
    at: [-0.37, 0.667, 0.155],
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 6), SHOE, {
    at: [-0.37, 0.685, 0.155],
  });
  const canBody = b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 12), CAN, {
    at: [-0.37, 0.6, 0.155],
  });
  b.decal(canBody, tagStar, { at: [-0.37, 0.6, 0.18], dir: [0, 0, 1], size: [0.035, 0.035] });

  // ---------- baggy shorts + legs + sneakers ----------
  const shorts = b.loft(
    [
      { at: [0, 0.56, 0], w: 0.3, h: 0.24 },
      { at: [0, 0.46, 0], w: 0.3, h: 0.24 },
      { at: [0, 0.38, 0.01], w: 0.27, h: 0.22 },
    ],
    { bone: [hips, spine.joints[0]], color: SHORTS },
  );
  b.decal(shorts, tagCrown, {
    at: [0.09, 0.47, 0.13],
    dir: [0, 0, 1],
    size: [0.07, 0.05],
  });
  for (const s of [1, -1]) {
    b.capsule([s * 0.1, 0.44, 0.01], [s * 0.13, 0.32, 0.06], 0.05, { color: FUR });
    b.capsule([s * 0.13, 0.32, 0.06], [s * 0.24, 0.16, 0], 0.038, { color: FUR });
    // high-top sneaker pointing forward
    b.part(new THREE.BoxGeometry(0.08, 0.035, 0.2), SHOE, {
      at: [s * 0.24, 0.122, 0.03],
    });
    b.part(new THREE.BoxGeometry(0.075, 0.07, 0.11), SHOE_RED, {
      at: [s * 0.24, 0.17, -0.01],
    });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), SHOE, {
      at: [s * 0.24, 0.135, 0.12],
      scale: [1, 0.55, 1],
    });
    for (let i = 0; i < 3; i++) {
      b.capsule(
        [s * 0.24 - 0.032, 0.185 + i * 0.016, 0.02 + i * 0.012],
        [s * 0.24 + 0.032, 0.185 + i * 0.016, 0.02 + i * 0.012],
        0.005,
        { color: SHOE },
      );
    }
  }

  // ---------- long curling tail ----------
  b.sweep(tail, (t) => 0.034 * (1 - t) + 0.006, {
    color: gradient(TAIL, FUR_DARK, [0, 0.52, -0.09], [-0.34, 0.22, -0.05]),
    bands: [[0.9, FUR_DARK]],
  });

  // ---------- skateboard on its own joint ----------
  const deckOutline: [number, number][] = [
    [-0.4, -0.085],
    [-0.4, 0.085],
    [0.4, 0.085],
    [0.4, -0.085],
  ];
  b.extrude(deckOutline, {
    at: [0, 0.095, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    smoothing: 2,
    bone: board,
    color: DECK,
  });
  const grip = b.extrude(deckOutline, {
    at: [0, 0.106, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.005,
    smoothing: 2,
    bone: board,
    color: GRIP,
  });
  b.decal(grip, tagDeck, {
    at: [0, 0.12, 0],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.4, 0.1],
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.07, 0.03, 0.15), STEEL, {
      bone: board,
      at: [sx * 0.28, 0.062, 0],
    });
    for (const sz of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.024, 12), sx > 0 ? WHEEL_Y : WHEEL_P, {
        bone: board,
        at: [sx * 0.28, 0.028, sz * 0.07],
        rotation: [90, 0, 0],
      });
    }
  }

  return b.root;
}

import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
  countershade,
  stripes,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A blocky ukiyo-e woodblock spirit beast: a gentle tapir with an elephantine trunk, ink-dark mane, cloud wisps, moon seal, and deep indigo, vermilion, cream, and woodblock-brown palette.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK_BROWN = "#241925";
  const WOOD = "#5a3028";
  const WOOD_DARK = "#351c26";
  const INDIGO = "#24395d";
  const INDIGO_DARK = "#162642";
  const VERMILION = "#b74732";
  const CREAM = "#ead7ae";
  const PAPER = "#f3e5c4";
  const JADE = "#6c9b91";
  const GOLD = "#d5a94b";
  const MOUTH = "#321725";
  const TOE = "#9d5b48";

  const COAT = furEdge(
    cel(INDIGO, INDIGO_DARK),
    cel(CREAM, "#b99179"),
    {
      level: -0.2,
      teeth: 0.22,
      period: 0.08,
      along: [0, 0, 1],
      ink: WOOD_DARK,
      inkWidth: 0.025,
    },
  );

  const BELLY = cel(CREAM, "#b99179");
  const DARK_COAT = cel(INDIGO_DARK, "#0d172b");
  const RED = cel(VERMILION, "#6d2630");
  const BLUE = cel(INDIGO, "#172843");
  const PALE = cel(PAPER, "#bda982");
  const JADE_PAINT = cel(JADE, "#315c60");

  const eyeTexture = animeEye({
    iris: "#d79b3c",
    irisLight: "#ffe7a0",
    irisDark: "#63363d",
    ink: INK_BROWN,
    blush: false,
    brow: true,
    size: 384,
  });

  const dreamSeal = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8
        C78 28 102 35 116 32
        C101 48 96 63 102 80
        C83 72 69 80 64 112
        C57 80 44 72 26 80
        C32 63 27 48 12 32
        C29 35 51 28 64 8Z"
        fill="#d5a94b" stroke="#241925" stroke-width="5" stroke-linejoin="round"/>
      <path d="M45 57 Q64 38 83 57 Q64 75 45 57Z" fill="#24395d" stroke="#241925" stroke-width="4"/>
      <circle cx="64" cy="57" r="6" fill="#f3e5c4"/>
      <path d="M35 91 Q64 75 93 91" fill="none" stroke="#241925" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const cloudTexture = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 48
        C14 34 25 39 30 27
        C36 11 56 8 66 22
        C77 7 103 12 105 30
        C124 26 128 43 119 51
        C104 61 84 54 70 54
        C50 61 35 52 24 56
        C15 59 8 56 5 48Z"
        fill="#d9e2d1" stroke="#31505b" stroke-width="5"/>
      <path d="M18 45 Q37 35 51 45 M77 43 Q94 32 111 43"
        fill="none" stroke="#f3e5c4" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first: one root spine, a rising neck, expressive jaw, four legs,
  // curling tail, and a long flexible trunk.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.83, -0.18],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const bodyPath = catmull([
    [-0.02, 0.86, -0.55],
    [0, 0.91, -0.28],
    [0, 0.94, 0.05],
    [0, 1.00, 0.30],
    [0, 1.04, 0.46],
  ]);

  const body = b.chain("spine", bodyPath, {
    parent: hips,
    names: ["rump", "back", "shoulder", "withers"],
    role: "spine",
    count: 4,
  });

  const neckPath = catmull([
    [0, 1.00, 0.38],
    [0, 1.16, 0.43],
    [0, 1.31, 0.52],
    [0, 1.43, 0.58],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: hips,
    names: ["neckBase", "neckMid", "neckTip"],
    role: "neck",
    count: 3,
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.43, 0.58],
    dir: [0, 0.08, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.19, down: 0.10 }),
    aim: head.local({ forward: 0.47, down: 0.16 }),
    role: "jaw",
    group: "face",
  });

  // A small open-jaw rest pose makes the separate mouth readable.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  const trunkPath = catmull([
    head.local({ forward: 0.20, down: 0.02 }),
    head.local({ forward: 0.38, down: 0.07 }),
    head.local({ forward: 0.57, down: 0.16 }),
    head.local({ forward: 0.70, down: 0.23 }),
    head.local({ forward: 0.79, down: 0.21 }),
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunkBase", "trunkMid", "trunkTip"],
    role: "tentacle",
    count: 3,
  });

  const tailPath = catmull([
    [0, 0.92, -0.58],
    [0, 0.86, -0.78],
    [0, 0.75, -0.93],
    [0.03, 0.65, -1.04],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    count: 3,
  });

  const legTargets = [
    { s: 1, z: 0.19, names: ["hipL", "kneeL", "ankleL"] },
    { s: -1, z: 0.19, names: ["hipR", "kneeR", "ankleR"] },
    { s: 1, z: -0.38, names: ["hindHipL", "hindKneeL", "hindAnkleL"] },
    { s: -1, z: -0.38, names: ["hindHipR", "hindKneeR", "hindAnkleR"] },
  ];

  const legs: Array<{ chain: ReturnType<typeof b.chain>; s: number; front: boolean }> = [];
  for (const item of legTargets) {
    const s = item.s;
    const front = item.z > 0;
    const root: [number, number, number] = [
      s * (front ? 0.20 : 0.25),
      front ? 0.96 : 0.86,
      item.z,
    ];
    const foot: [number, number, number] = [s * (front ? 0.22 : 0.27), 0.115, item.z + (front ? 0.06 : -0.04)];
    const points = limb(
      root,
      foot,
      front ? [0.28, 0.25] : [0.31, 0.27],
      front ? [[0, 0, 1]] : [[0, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(front ? `foreLeg${s > 0 ? "L" : "R"}` : `hindLeg${s > 0 ? "L" : "R"}`, points, {
      parent: hips,
      names: item.names,
      role: "leg",
      contact: foot,
    });
    legs.push({ chain, s, front });
  }

  // ---------------------------------------------------------------------------
  // Main body volumes: broad, faceted, and deliberately puppet-like.
  // ---------------------------------------------------------------------------

  b.sweep(body, (t) => 0.27 + 0.045 * Math.sin(Math.PI * t), {
    color: COAT,
    sides: 8,
    section: "circle",
    name: "broad_ink_body",
    group: "body",
  });

  b.sweep(neck, [0.22, 0.18], {
    color: COAT,
    sides: 8,
    section: "circle",
    name: "upright_neck",
    group: "body",
  });

  b.sweep(tail, [0.095, 0.025], {
    color: DARK_COAT,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "brush_tail",
    group: "body",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.105 - t * 0.035, {
      color: COAT,
      sides: 7,
      section: "circle",
      name: leg.front ? `foreleg_${leg.s > 0 ? "L" : "R"}` : `hindleg_${leg.s > 0 ? "L" : "R"}`,
      group: "legs",
    });
  }

  b.sweep(trunk, [0.14, 0.055], {
    color: BELLY,
    sides: 8,
    section: "circle",
    caps: { start: "round", end: "round" },
    name: "long_dream_trunk",
    group: "face",
  });

  // Warm, graphic underside panel.
  b.sweep(
    catmull([
      [0, 0.76, -0.38],
      [0, 0.75, -0.05],
      [0, 0.81, 0.22],
      [0, 0.96, 0.42],
    ]),
    0.16,
    {
      color: BELLY,
      sides: 8,
      bone: hips,
      name: "cream_belly_panel",
      group: "body",
    },
  );

  // Hooves and broad tapir toes.
  for (const leg of legs) {
    const z = leg.front ? 0.25 : -0.42;
    const x = leg.s * (leg.front ? 0.22 : 0.27);
    b.part(new THREE.BoxGeometry(0.16, 0.09, 0.23), DARK_COAT, {
      bone: leg.chain.tip!,
      at: [x, 0.075, z],
      scale: [1, 1, 1],
      name: `flat_hoof_${leg.s}_${z}`,
      group: "legs",
    });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.SphereGeometry(0.028, 6, 4), TOE, {
        bone: leg.chain.tip!,
        at: [x + leg.s * i * 0.045, 0.095, z + 0.105],
        name: `toe_${leg.s}_${z}_${i}`,
        group: "legs",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head and face, settled before the ornament.
  // ---------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.at,
    scale: [0.285, 0.31, 0.30],
    name: "faceted_skull",
    group: "face",
  });

  const cheekL = b.part(new THREE.SphereGeometry(0.17, 9, 7), BELLY, {
    bone: head,
    at: head.local({ left: 0.16, forward: 0.20, down: 0.05 }),
    scale: [1, 0.84, 0.8],
    name: "cream_cheek_L",
    group: "face",
  });
  const cheekR = b.part(new THREE.SphereGeometry(0.17, 9, 7), BELLY, {
    bone: head,
    at: head.local({ right: 0.16, forward: 0.20, down: 0.05 }),
    scale: [1, 0.84, 0.8],
    name: "cream_cheek_R",
    group: "face",
  });

  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSurface.around(head.at).at(s * 29, 4);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.105, 0.14],
        lift: 0.004,
        mirror: s > 0,
        name: `dream_eye_${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  // Dark open mouth, upper lip, lower jaw, and tiny dream-eater teeth.
  b.sweep(
    bezier(
      head.local({ left: 0.13, forward: 0.29, down: 0.10 }),
      head.local({ left: 0.06, forward: 0.38, down: 0.16 }),
      head.local({ right: 0.06, forward: 0.38, down: 0.16 }),
      head.local({ right: 0.13, forward: 0.29, down: 0.10 }),
    ),
    0.025,
    { color: MOUTH, caps: "round", bone: head, name: "open_mouth" },
  );

  b.sweep(
    bezier(
      jaw.at,
      jaw.local({ forward: 0.14, down: 0.01 }),
      jaw.local({ forward: 0.28, down: 0.02 }),
    ),
    [0.09, 0.035],
    { color: BELLY, caps: "round", bone: jaw, name: "lower_jaw" },
  );

  for (const s of [1, -1]) {
    b.spike(
      jaw.local({ left: s * 0.07, forward: 0.13, down: 0.01 }),
      [0, -1, 0.08],
      0.055,
      0.012,
      { color: PAPER, bone: jaw, name: `little_tooth_${s}` },
    );
  }

  b.part(new THREE.SphereGeometry(0.075, 8, 6), MOUTH, {
    bone: trunk.tip!,
    at: trunk.at(1).at,
    name: "soft_trunk_nose",
    group: "face",
  });

  // Big rounded tapir ears, with printed inner ears.
  const earOutline: [number, number, "sharp"][] = [
    [-0.12, -0.02, "sharp"],
    [-0.09, 0.18, "sharp"],
    [-0.015, 0.32, "sharp"],
    [0.07, 0.19, "sharp"],
    [0.12, -0.02, "sharp"],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.19, back: 0.02, up: 0.10 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      smoothing: 1,
      color: DARK_COAT,
      bone: head,
      name: `round_ear_${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    const inner: [number, number, "sharp"][] = [
      [-0.06, 0.01, "sharp"],
      [-0.04, 0.15, "sharp"],
      [0, 0.23, "sharp"],
      [0.05, 0.14, "sharp"],
      [0.06, 0.01, "sharp"],
    ];
    b.extrude(inner, {
      at: head.local({ left: s * 0.195, back: 0.005, up: 0.11 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.061,
      color: RED,
      bone: head,
      name: `vermillion_inner_ear_${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Moon/dream seal on the brow, a very graphic woodblock focal point.
  const sealHit = headSurface.around(head.at).at(0, 45);
  if (sealHit) {
    b.decal(headSurface, dreamSeal, {
      at: sealHit,
      size: [0.16, 0.16],
      lift: 0.006,
      segments: 8,
      name: "golden_dream_seal",
      group: "ornament",
    });
  }

  // ---------------------------------------------------------------------------
  // Woodblock ornament: dorsal spikes, collar bands, whiskers, cloud spirit.
  // ---------------------------------------------------------------------------

  b.along(body, 8, (at, i) => {
    const h = 0.045 + 0.075 * Math.sin((i / 7) * Math.PI);
    b.spike(at, at, h, 0.028, {
      color: WOOD_DARK,
      name: `ink_mane_${i}`,
      group: "mane",
    });
  });

  // Ink-blue and vermilion collar strips.
  const neckLoop = b.surface(neck).loop(neck.at(0.55), { lift: 0.012 });
  b.sweep(neckLoop, 0.018, {
    color: RED,
    caps: "round",
    name: "vermilion_neck_band",
    group: "ornament",
  });
  const neckLoop2 = b.surface(neck).loop(neck.at(0.68), { lift: 0.014 });
  b.sweep(neckLoop2, 0.012, {
    color: GOLD,
    caps: "round",
    name: "gold_neck_band",
    group: "ornament",
  });

  // Short whiskers that make the trunk read clearly from the front.
  for (const s of [1, -1]) {
    const whiskerRoot = head.local({ left: s * 0.11, forward: 0.31, down: 0.04 });
    for (let i = 0; i < 3; i++) {
      const tip: [number, number, number] = [
        whiskerRoot.x + s * (0.12 + i * 0.018),
        whiskerRoot.y + 0.035 - i * 0.035,
        whiskerRoot.z + 0.10 + i * 0.025,
      ];
      b.rod(whiskerRoot, tip, 0.006, {
        color: PAPER,
        bone: head,
        caps: "round",
        name: `whisker_${s}_${i}`,
        group: "face",
      });
    }
  }

  // Dream clouds grow from the spirit's back and curl around it as separate,
  // readable woodblock lines rather than a literal environment.
  const cloudA = b.sweep(
    bezier(
      [0.18, 1.10, 0.05],
      [0.45, 1.28, 0.15],
      [0.40, 1.52, 0.35],
      [0.08, 1.55, 0.43],
    ),
    0.026,
    { color: JADE_PAINT, bone: body.joints[2], caps: "round", name: "dream_cloud_L", group: "spirit" },
  );
  const cloudB = b.sweep(
    bezier(
      [-0.16, 1.16, -0.20],
      [-0.45, 1.30, -0.05],
      [-0.42, 1.48, 0.17],
      [-0.10, 1.50, 0.30],
    ),
    0.022,
    { color: PALE, bone: body.joints[1], caps: "round", name: "dream_cloud_R", group: "spirit" },
  );

  // Graphic cloud cards at the ends of the spirit wisps.
  b.cards(
    [
      b.surface(cloudA).around([0.08, 1.55, 0.43]).at(0, 30),
      b.surface(cloudB).around([-0.10, 1.50, 0.30]).at(0, 30),
    ].filter(Boolean) as any[],
    cloudTexture,
    {
      size: [0.20, 0.11],
      lean: 75,
      bend: 20,
      color: PAPER,
      sink: 0.02,
      group: "spirit",
    },
  );

  // Vermilion tassels under the jaw, echoing an ukiyo-e festival charm.
  const tasselRoot = head.local({ forward: 0.02, down: 0.19 });
  for (const s of [1, -1]) {
    const p = head.local({ left: s * 0.09, forward: 0.10, down: 0.17 });
    b.rod(p, [p.x, 1.08, p.z + 0.03], 0.012, {
      color: RED,
      bone: head,
      caps: "round",
      name: `jaw_tassel_cord_${s}`,
      group: "ornament",
    });
    b.cards(
      [b.region({ at: [p.x, 1.08, p.z + 0.03] }) as any],
      cloudTexture,
      { size: [0.045, 0.12], lean: 180, color: RED, group: "ornament" },
    );
  }

  return b.root;
}

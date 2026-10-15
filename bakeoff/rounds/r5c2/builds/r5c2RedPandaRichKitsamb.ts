import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, offset, noise, paint, svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A Genshin-style cel-shaded red panda balancing on a mossy runed boulder, with a Dendro Vision, jade scarf, ringed tail and glowing mushrooms on a grassy diorama base.",
};

// ---------------------------------------------------------------------------------------------------------------
// Layout constants
const Y0 = 0.07; // top of the grass base
const T = 0.37; // top of the stone: the panda's feet stand here

// Palette
const FUR = "#e8662c";
const FUR_DEEP = "#b8401f";
const BELLY = "#4a2a22";
const DARK = "#3a211d";
const CREAM = "#fff1da";
const GOLD = "#f2c14e";
const JADE = "#1f9a6e";
const LEAF = "#7ed957";
const WHISKER = "#fff7e6";

// Textures
const EYE = animeEye({ iris: "#38d6a0", irisLight: "#c8ff9e", blush: "#ff8f9a" });

const TEAR = svg(
  `<svg viewBox="0 0 20 44"><path d="M10 1 C17 10 14 30 10 43 C6 30 3 10 10 1Z" fill="#b5391c"/></svg>`,
  { size: 96 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#9dffb4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="36" stroke-width="2"/>
    <path d="M50 20 C70 36 70 62 50 80 C30 62 30 36 50 20Z"/>
    <path d="M50 28 V74 M50 46 L38 38 M50 58 L62 50"/>
    <path d="M50 6 V14 M50 86 V94 M6 50 H14 M86 50 H94 M19 19 l6 6 M81 19 l-6 6 M19 81 l6 -6 M81 81 l-6 -6"/>
  </g></svg>`,
  { size: 256 },
);

const GRASS = svg(
  `<svg viewBox="0 0 40 56">
    <path d="M6 56 Q4 30 2 8 Q12 26 14 56Z" fill="#4f9f35"/>
    <path d="M14 56 Q16 24 20 2 Q26 26 26 56Z" fill="#7fcf4b"/>
    <path d="M26 56 Q30 32 38 12 Q36 36 34 56Z" fill="#5fb23c"/>
  </svg>`,
  { size: 128 },
);

const petal = (deg: number) =>
  `<ellipse rx="5.5" ry="9" cy="-9" fill="#fff7f0" stroke="#f3b6c8" stroke-width="1" transform="rotate(${deg})"/>`;
const FLOWER = svg(
  `<svg viewBox="0 0 40 80">
    <path d="M20 80 Q22 56 20 36" stroke="#4f9f35" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M21 62 Q32 56 36 48 Q28 50 21 62Z" fill="#6cc243"/>
    <g transform="translate(20 24)">${[0, 72, 144, 216, 288].map(petal).join("")}<circle r="5" fill="#ffd34d"/></g>
  </svg>`,
  { size: 160 },
);

const STAR = svg(
  `<svg viewBox="0 0 40 40"><defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#7dff9b"/></radialGradient></defs>
    <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z" fill="url(#g)"/></svg>`,
  { size: 96 },
);

const TUFT = svg(
  `<svg viewBox="0 0 24 32">
    <path d="M12 32 L2 10 L8 16 L10 0 L14 14 L20 6 L22 32Z" fill="#f4813f"/>
    <path d="M12 32 L8 14 L12 20 L15 10 L18 32Z" fill="#ffb067"/>
  </svg>`,
  { size: 64 },
);

// Paints
const P = {
  coat: cel(furEdge(FUR, BELLY, { level: -0.1, teeth: 0.3, period: 0.03 })),
  neck: cel(furEdge(FUR, CREAM, { level: -0.2, teeth: 0.2, period: 0.03 })),
  leg: cel(furEdge(FUR, DARK, { by: "position", axis: [0, 1, 0], level: T + 0.12, teeth: 0.035, period: 0.032, along: [1, 0, 1] })),
  head: cel(furEdge(FUR, CREAM, { by: "position", axis: [0, 1, 0], level: T + 0.372, teeth: 0.025, period: 0.032, along: [1, 0, 0] })),
  white: cel(CREAM),
  ear: cel(FUR),
  paw: cel(DARK),
  toe: cel("#2b1815"),
  nose: cel(INK),
  scarf: cel(JADE),
  leaf: cel(LEAF),
  tail: cel(
    paint((_p, _n, s) => {
      if (s[0] > 0.9) return "#4a2218";
      return Math.floor(s[0] * 9) % 2 === 0 ? "#e8662c" : "#a8381c";
    }),
  ),
  moss: cel(paint((p) => (noise(p, 0.05, 2) > 0.5 ? "#86cf4e" : "#5cae3c"))),
};

const STONE_P = cel(
  paint((p, n) => {
    const m = noise(p, 0.09, 3);
    const mossy = n.y + (m - 0.5) * 1.1 > 0.42 || (p.y < Y0 + 0.1 && m > 0.72);
    if (mossy) return noise(p, 0.04, 8) > 0.55 ? "#86cf4e" : "#5cae3c";
    return noise(p, 0.07, 5) > 0.55 ? "#9aa0ae" : "#7f8697";
  }),
);

const BASE_P = cel(
  paint((p, _n, s) => {
    const lim = 0.044 + 0.018 * zigzag((s[1] / 360) * 30);
    if (p.y > lim) return noise(p, 0.14, 4) > 0.5 ? "#7fcf4b" : "#63b53e";
    return p.y < 0.012 ? "#4b3426" : "#7c5638";
  }),
);

export default function build() {
  const b = createBuilder({ name: "red_panda_on_mossy_stone" });
  const R = rng(11);

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, T + 0.23, -0.26], dir: [0, 0, 1] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, T + 0.23, -0.26],
      [0, T + 0.25, -0.1],
      [0, T + 0.27, 0.06],
      [0, T + 0.3, 0.2],
    ]),
    { parent: hips, role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, T + 0.29, 0.17],
      [0, T + 0.325, 0.27],
      [0, T + 0.35, 0.34],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );

  const head = b.joint("head", { parent: neck.joints[1], at: [0, T + 0.35, 0.34], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, T + 0.31, 0.46], aim: [0, T + 0.3, 0.56], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, T + 0.27, -0.3],
      [0, T + 0.3, -0.46],
      [0, T + 0.4, -0.6],
      [0, T + 0.56, -0.64],
      [0, T + 0.68, -0.56],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Diorama base, stone, scenery
  const base = b.lathe(
    [
      [0, 0],
      [0.8, 0],
      [0.86, 0.03],
      [0.84, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, 0], bone: root, segments: 20, color: BASE_P },
  );

  const stone = b.lathe(
    [
      [0, 0],
      [0.37, 0],
      [0.41, 0.07],
      [0.38, 0.17],
      [0.33, 0.26],
      [0.3, 0.3],
      [0, 0.3],
    ],
    { at: [0, Y0 - 0.005, 0], bone: root, segments: 8, spin: 22.5, color: STONE_P },
  );

  // glowing dendro rune on the boulder's face
  glow(
    b.decal(b.surface(stone), RUNE, {
      at: [0, Y0 + 0.14, 0.42],
      dir: [0, 0.1, 1],
      size: [0.15, 0.15],
      bone: root,
    }),
    1.4,
  );

  // chunks of rock around the plinth
  const rocks: [number, number, number, number][] = [
    [0.62, -0.25, 0.12, 20],
    [-0.55, -0.4, 0.14, 70],
    [0.3, 0.62, 0.09, 40],
    [-0.4, 0.55, 0.11, 110],
    [0.1, -0.7, 0.1, 15],
  ];
  for (const [x, z, r, rot] of rocks) {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE_P, {
      bone: root,
      at: [x, Y0 + r * 0.45, z],
      scale: [r, r * 0.7, r * 0.85],
      rotation: [0, rot, 0],
      flat: true,
    });
  }

  // moss clumps on the stone's shoulder
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + R() * 0.3;
    const rr = 0.25 + R() * 0.04;
    b.part(new THREE.IcosahedronGeometry(1, 0), P.moss, {
      bone: root,
      at: [Math.cos(a) * rr, T - 0.012, Math.sin(a) * rr],
      scale: [0.03 + R() * 0.025, 0.028 + R() * 0.015, 0.03 + R() * 0.025],
      rotation: [R() * 40, R() * 180, R() * 40],
      flat: true,
    });
  }

  // tufts on the stone and the plinth
  const stoneHits = b.surface(stone).scatter(24, {
    rng: R,
    minDist: 0.07,
    filter: (h) => h.n.y > 0.6 && Math.hypot(h.at.x, h.at.z) > 0.24,
  });
  b.cards(stoneHits, GRASS, { size: [0.07, 0.08], lean: 25, cross: true, vary: 0.3, rng: R });

  const baseSkin = b.surface(base);
  const grassHits = baseSkin.scatter(60, {
    rng: R,
    minDist: 0.1,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 0.46,
  });
  b.cards(grassHits, GRASS, { size: [0.08, 0.1], lean: 10, cross: true, vary: 0.35, rng: R });

  const flowerHits = baseSkin.scatter(14, {
    rng: R,
    minDist: 0.2,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 0.5 && Math.hypot(h.at.x, h.at.z) < 0.78,
  });
  b.cards(flowerHits, FLOWER, { size: [0.06, 0.12], flow: [0, 0, 1], cross: true, vary: 0.3, rng: R });

  // glowing mushrooms
  const shrooms: [number, number, number][] = [
    [0.55, 0.35, 0.05],
    [-0.62, 0.1, 0.04],
    [-0.15, -0.72, 0.045],
    [0.7, 0.05, 0.035],
  ];
  for (const [x, z, h] of shrooms) {
    b.rod([x, Y0, z], [x + 0.004, Y0 + h, z], 0.011, "#efe6d2", { bone: root });
    glow(
      b.lathe(
        [
          [0, 0],
          [0.034, 0],
          [0.042, 0.008],
          [0.03, 0.024],
          [0, 0.032],
        ],
        { at: [x + 0.004, Y0 + h - 0.004, z], bone: root, segments: 8, color: "#46f2b5" },
      ),
      1.2,
    );
  }

  // floating dendro motes
  const motes = [];
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.7 + R() * 0.25;
    motes.push(frame([Math.cos(a) * rr, 0.45 + R() * 0.75, Math.sin(a) * rr], [0, 1, 0]));
  }
  glow(b.cards(motes, STAR, { size: 0.075, flow: [0, 0, 1], vary: 0.5, spin: 20, rng: R, bone: root }), 1.8);

  // ------------------------------------------------------------------------------------------------------------
  // Body
  const body = b.sweep(
    spine,
    (t) => [0.108 + 0.04 * Math.sin(Math.PI * t), 0.088 + 0.036 * Math.sin(Math.PI * t)],
    { color: P.coat, sides: 10 },
  );
  const neckTube = b.sweep(neck, [0.104, 0.094, 0.084], { color: P.neck, sides: 10 });
  b.sweep(tail, [0.05, 0.075, 0.09, 0.09, 0.075, 0.04], { color: P.tail, sides: 10 });

  // fur tufts over the back and flanks
  const furHits = b.surface(body).scatter(70, { rng: R, minDist: 0.04, filter: (h) => h.n.y > -0.1 });
  b.cards(furHits, TUFT, { size: [0.032, 0.04], lean: 75, bend: 25, vary: 0.3, rng: R });

  // ------------------------------------------------------------------------------------------------------------
  // Legs and paws
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fPts = limb([s * 0.088, T + 0.19, 0.12], [s * 0.1, T + 0.035, 0.165], [0.1, 0.085], [[0, 0, -1]]);
    const fLeg = b.chain("legF" + side, fPts, {
      parent: spine.joints[2],
      names: ["shoulder" + side, "elbow" + side, "wrist" + side],
      role: "leg",
      contact: [s * 0.1, T, 0.165],
    });
    b.sweep(fLeg, [0.055, 0.04, 0.034], { color: P.leg, sides: 8 });

    const hPts = limb([s * 0.095, T + 0.19, -0.19], [s * 0.1, T + 0.035, -0.16], [0.1, 0.09], [[0, 0, 1]]);
    const hLeg = b.chain("legH" + side, hPts, {
      parent: spine.joints[0],
      names: ["hip" + side, "knee" + side, "ankle" + side],
      role: "leg",
      contact: [s * 0.1, T, -0.16],
    });
    b.sweep(hLeg, [0.065, 0.042, 0.034], { color: P.leg, sides: 8 });

    const feet: [typeof fLeg, number, number][] = [
      [fLeg, s * 0.1, 0.165],
      [hLeg, s * 0.1, -0.16],
    ];
    for (const [leg, tx, tz] of feet) {
      const foot = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 10, 8), P.paw, {
        bone: foot,
        at: [tx, T + 0.03, tz + 0.012],
        scale: [0.042, 0.031, 0.056],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.013, 6, 5), P.toe, {
          bone: foot,
          at: [tx + k * 0.02, T + 0.02, tz + 0.06 - Math.abs(k) * 0.006],
        });
        b.spike([tx + k * 0.02, T + 0.014, tz + 0.07], [0, -0.25, 1], 0.014, 0.004, { color: "#f1e6d0", bone: foot });
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Head
  const C: [number, number, number] = [0, T + 0.36, 0.42];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), P.head, {
    bone: head,
    at: C,
    scale: [0.117, 0.1, 0.108],
  });
  const skin = b.surface(skull);

  // cheek fluff
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), P.white, {
      bone: head,
      at: [s * 0.08, T + 0.32, 0.44],
      scale: [0.045, 0.035, 0.05],
    });
    const tufts: [number[], number[]][] = [
      [[s * 0.095, T + 0.35, 0.44], [s, -0.1, -0.5]],
      [[s * 0.093, T + 0.325, 0.42], [s, -0.3, -0.6]],
      [[s * 0.088, T + 0.3, 0.4], [s * 0.7, -0.5, -0.7]],
    ];
    for (const [at, dir] of tufts) b.spike(at, dir, 0.07, 0.024, { color: P.white, bone: head, sides: 6 });
  }

  // muzzle, nose, jaws
  b.part(new THREE.SphereGeometry(1, 10, 8), P.white, {
    bone: head,
    at: [0, T + 0.35, 0.525],
    scale: [0.052, 0.036, 0.058],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), P.nose, {
    bone: head,
    at: [0, T + 0.364, 0.578],
    scale: [0.017, 0.013, 0.014],
  });
  b.part(new THREE.SphereGeometry(0.004, 5, 4), "#ffffff", { bone: head, at: [0.004, T + 0.371, 0.588] });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#3a1a22", {
    bone: head,
    at: [0, T + 0.316, 0.54],
    scale: [0.034, 0.004, 0.045],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), P.white, {
    bone: jaw,
    at: [0, T + 0.3, 0.52],
    scale: [0.038, 0.02, 0.045],
  });

  // whiskers
  for (const s of [1, -1])
    for (const k of [-1, 0, 1])
      b.rod([s * 0.05, T + 0.345 + k * 0.008, 0.56], [s * 0.125, T + 0.35 + k * 0.026, 0.53], 0.0018, WHISKER, {
        bone: head,
      });

  // eyes and tear marks
  for (const s of [1, -1]) {
    const eyeHit = skin.around(C).at(s * 36, 2)!;
    b.decal(skin, EYE, { at: eyeHit, size: [0.056, 0.077], mirror: s > 0 });
    const tearHit = skin.around(C).at(s * 30, -36)!;
    b.decal(skin, TEAR, { at: tearHit, size: [0.02, 0.05] });
  }

  // ears
  const EAR: [number, number, string?][] = [
    [-0.035, 0],
    [0.055, 0],
    [0.05, 0.04],
    [0.012, 0.115, "sharp"],
    [-0.03, 0.05],
  ];
  const EAR_IN: [number, number, string?][] = [
    [-0.012, 0.008],
    [0.04, 0.008],
    [0.036, 0.04],
    [0.012, 0.088, "sharp"],
    [-0.012, 0.045],
  ];
  for (const s of [1, -1]) {
    b.extrude(EAR as never, {
      at: [s * 0.068, T + 0.415, 0.4],
      x: [s, 0, 0],
      y: [s * 0.3, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: P.ear,
      bone: head,
    });
    b.extrude(EAR_IN as never, {
      at: [s * 0.07, T + 0.418, 0.41],
      x: [s, 0, 0],
      y: [s * 0.3, 1, 0],
      thickness: 0.012,
      smoothing: 1,
      color: P.white,
      bone: head,
    });
  }

  // dendro sprout on the crown
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.025, 0.02],
        [0.03, 0.05],
        [0, 0.09, "sharp"],
        [-0.03, 0.05],
        [-0.025, 0.02],
      ] as never,
      {
        at: [s * 0.004, T + 0.445, 0.41],
        x: [s, 0, 0],
        y: [s * 0.8, 1, 0],
        thickness: 0.006,
        smoothing: 1,
        color: P.leaf,
        bone: head,
      },
    );
  }
  b.rod([0, T + 0.435, 0.41], [0, T + 0.465, 0.41], 0.005, "#4f9f35", { bone: head });

  // ------------------------------------------------------------------------------------------------------------
  // Scarf and Dendro Vision
  const loop = b.surface(neckTube).loop(neck.at(0.35), { lift: 0.02 });
  b.sweep(loop, 0.024, { color: P.scarf, sides: 8 });
  const knot = b.surface(neckTube).around(neck.at(0.35).at).at(0, -10)!;
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), P.scarf, knot, { embed: 0.3 });
  for (const s of [1, -1]) b.spike(knot, [s * 0.4, -0.8, -0.5], 0.14, 0.028, { color: P.scarf, sides: 6 });

  const chest =
    b.surface([neckTube, body]).ray([0, T + 0.2, 0.9], [0, 0, -1]) ?? b.surface(body).nearest([0, T + 0.21, 0.4]);
  const up2: [number, number, number] = [0, chest.n.z, -chest.n.y];
  const frameAt = offset(chest, chest, 0.02);
  const gemAt = offset(chest, chest, 0.03);
  b.rod(knot, offset(frameAt, up2, 0.05), 0.0035, GOLD, { bone: neck.joints[0] });
  b.extrude(
    [
      [0, 0.055, "sharp"],
      [0.022, 0.03],
      [0.045, 0.035, "sharp"],
      [0.03, 0],
      [0.045, -0.035, "sharp"],
      [0.022, -0.03],
      [0, -0.055, "sharp"],
      [-0.022, -0.03],
      [-0.045, -0.035, "sharp"],
      [-0.03, 0],
      [-0.045, 0.035, "sharp"],
      [-0.022, 0.03],
    ] as never,
    { at: frameAt, x: [1, 0, 0], y: up2, thickness: 0.01, bevel: 0.002, color: GOLD, bone: spine.joints[2] },
  );
  glow(
    b.extrude(
      [
        [0, 0.04],
        [0.02, 0],
        [0, -0.04],
        [-0.02, 0],
      ],
      { at: gemAt, x: [1, 0, 0], y: up2, thickness: 0.012, bevel: 0.003, color: "#7dff6a", bone: spine.joints[2] },
    ),
    1.8,
  );

  return b.root;
}

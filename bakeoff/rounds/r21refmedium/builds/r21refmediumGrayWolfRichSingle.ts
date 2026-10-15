// Gray wolf standing alert, Blizzard/Warcraft style: chunky shoulders and haunches, big paws and head, a heavy
// hand-painted ruff of layered fur cards, cream bib and socks, dark saddle, amber glowing eyes, black claws and a
// worn gold ear ring. Painted gradients and mottled fur carry the hand-painted look.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, gradient, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Gray Wolf",
  description:
    "A heavy, heroic gray wolf standing alert: broad shoulders, oversized paws and head, layered fur-card ruff, cream bib, dark saddle and a gold-ringed ear.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BLACK = "#1f2025";
const NOSE = "#17161b";
const CLAW = "#25242a";
const EYE = "#f2a31f";
const BONE = "#efe9d8";
const WHISKER = "#e4dfcf";
const GOLD = "#d9a93a";
const TONGUE = "#c8586a";
const DARK = "#44474f";
const CREAM = "#ddd5c0";
const CREAMSH = "#b8b09b";

// Coat paints
const saddle = mottle(DARK, "#5b5e67", { size: 0.1, seed: 2, contrast: 1.2 });
const flank = mottle("#6f737d", "#8a8c93", { size: 0.11, seed: 3 });
const belly = mottle(CREAM, CREAMSH, { size: 0.07, seed: 4 });
const upper = countershade(saddle, flank, { level: 0.35, soft: 0.3 });
const baseCoat = countershade(upper, belly, { level: -0.3, soft: 0.25 });
const bib = mottle(CREAM, "#c8c0ab", { size: 0.05, seed: 5 });
const coat = paint((p, n) => (p.z > 0.28 && n.z > 0.05 + 0.4 * zigzag(p.x / 0.05) ? bib : baseCoat));

const socks = mottle(CREAM, CREAMSH, { size: 0.05, seed: 6 });
const legBase = gradient(socks, coat, [0, 0.3, 0], [0, 0.62, 0]);
const frontLeg = paint((p, n) =>
  p.z > 0.2 && n.z > 0.5 && p.y > 0.14 && p.y < 0.6 ? "#4a4d55" : legBase,
);
const hindLeg = gradient(socks, coat, [0, 0.36, 0], [0, 0.7, 0]);

const faceBase = countershade(
  mottle("#5a5d66", "#4a4d55", { size: 0.04, seed: 7 }),
  mottle(CREAM, CREAMSH, { size: 0.04, seed: 8 }),
  { level: 0.25, soft: 0.3 },
);
const face = paint((p) => {
  const ax = Math.abs(p.x);
  if (Math.hypot(ax - 0.066, p.y - 1.1, p.z - 0.875) < 0.03) return BLACK;
  if (Math.hypot(ax - 0.05, p.y - 1.14, p.z - 0.905) < 0.014) return CREAM;
  return faceBase;
});

const tailBase = countershade(
  mottle(DARK, "#5e616a", { size: 0.08, seed: 9 }),
  mottle("#a29d90", "#8e8a7f", { size: 0.06, seed: 10 }),
  { level: -0.2, soft: 0.4 },
);
const tailCoat = gradient(tailBase, "#25262b", [0, 0.6, -0.92], [0, 0.45, -1.02]);

const tuftA = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7d7d7d"/><stop offset="0.6" stop-color="#d0d0d0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M3 64 C5 40 11 18 16 0 C21 18 27 40 29 64 Z" fill="url(#g)"/><path d="M16 8 L16 60" stroke="#9a9a9a" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const tuftB = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#858585"/><stop offset="0.6" stop-color="#d8d8d8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M4 64 C2 42 12 20 27 1 C23 24 25 44 28 64 Z" fill="url(#g)"/><path d="M9 56 C10 40 16 26 24 10" stroke="#a0a0a0" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "grayWolf" });
  const R = rng(11);
  const ball = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.7, -0.36] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.7, -0.36],
      [0, 0.73, -0.06],
      [0, 0.76, 0.2],
      [0, 0.78, 0.4],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.4],
      [0, 0.92, 0.56],
      [0, 1.02, 0.7],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.02, 0.7],
    dir: [0, 0.1, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.02, 0.83], aim: [0, 0.99, 1.03], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.42],
      [0, 0.67, -0.68],
      [0, 0.54, -0.92],
      [0, 0.38, -1.03],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- Body, neck, tail ---------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.7, -0.52], w: 0.22, h: 0.28 },
      { at: [0, 0.71, -0.36], w: 0.3, h: 0.32 },
      { at: [0, 0.72, -0.05], w: 0.29, h: 0.34 },
      { at: [0, 0.72, 0.22], w: 0.34, h: 0.42 },
      { at: [0, 0.75, 0.42], w: 0.3, h: 0.38 },
    ],
    { bone: [hips, spine], color: coat },
  );
  const neckS = b.sweep(neck, [0.14, 0.125, 0.105], { color: coat });
  const tailS = b.sweep(tail, [0.07, 0.1, 0.085, 0.03], { color: tailCoat });

  // ---- Legs ---------------------------------------------------------------------------------------------------
  const legSweeps = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fpts = limb(
      [s * 0.14, 0.68, 0.3],
      [s * 0.14, 0.07, 0.36],
      [0.3, 0.3, 0.14],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const front = b.chain("legF" + side, fpts, {
      parent: spine.joints[2],
      names: ["shoulder" + side, "elbow" + side, "wrist" + side, "pawF" + side],
      role: "leg",
      contact: [s * 0.14, 0, 0.4],
    });
    legSweeps.push(b.sweep(front, [0.085, 0.06, 0.045, 0.05], { color: frontLeg }));
    b.part(ball(10, 8), coat, { bone: front.joints[0], at: [s * 0.15, 0.68, 0.3], scale: [0.1, 0.17, 0.15] });

    const hpts = limb(
      [s * 0.13, 0.7, -0.36],
      [s * 0.13, 0.07, -0.42],
      [0.34, 0.34, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain("legH" + side, hpts, {
      parent: hips,
      names: ["hip" + side, "knee" + side, "hock" + side, "pawH" + side],
      role: "leg",
      contact: [s * 0.13, 0, -0.38],
    });
    legSweeps.push(b.sweep(hind, [0.105, 0.065, 0.04, 0.042], { color: hindLeg }));
    b.part(ball(10, 8), coat, { bone: hind.joints[0], at: [s * 0.15, 0.68, -0.38], scale: [0.115, 0.2, 0.18] });

    // Paws, toes and claws
    for (const [chain, px, pz] of [
      [front, s * 0.14, 0.36],
      [hind, s * 0.13, -0.42],
    ] as const) {
      const tip = chain.tip!;
      b.part(ball(10, 7), socks, { bone: tip, at: [px, 0.043, pz + 0.045], scale: [0.062, 0.043, 0.09] });
      const dxs = [-0.033, -0.011, 0.011, 0.033];
      dxs.forEach((dx, i) => {
        const zo = i === 1 || i === 2 ? 0.012 : 0;
        b.part(ball(6, 5), CREAM, { bone: tip, at: [px + dx, 0.03, pz + 0.112 + zo], scale: [0.016, 0.016, 0.024] });
        b.spike([px + dx, 0.027, pz + 0.13 + zo], [0, -0.3, 1], 0.045, 0.011, CLAW, { bone: tip, sides: 6 });
      });
    }
  }

  // ---- Head ---------------------------------------------------------------------------------------------------
  const skull = b.part(ball(14, 10), face, { bone: head, at: [0, 1.07, 0.79], scale: [0.095, 0.085, 0.1] });
  b.sweep(
    [
      [0, 1.06, 0.86],
      [0, 1.03, 1.04],
    ],
    (t) => [0.065 - 0.03 * t, 0.058 - 0.028 * t],
    { color: face, bone: head, sides: 10 },
  );
  b.sweep(
    [
      [0, 0.995, 0.86],
      [0, 0.99, 1.03],
    ],
    (t) => [0.05 - 0.022 * t, 0.035 - 0.012 * t],
    { color: mottle(CREAM, CREAMSH, { size: 0.04, seed: 12 }), bone: jaw, sides: 10 },
  );
  b.part(ball(8, 6), TONGUE, { bone: jaw, at: [0, 1.02, 0.95], scale: [0.025, 0.01, 0.07] });
  b.part(ball(10, 8), NOSE, { bone: head, at: [0, 1.05, 1.065], scale: [0.036, 0.028, 0.03] });
  b.part(ball(5, 4), "#555a66", { bone: head, at: [0, 1.068, 1.075], scale: [0.012, 0.006, 0.008] });

  for (const s of [1, -1]) {
    // fangs
    b.spike([s * 0.032, 1.012, 1.0], [0, -1, 0], 0.04, 0.009, BONE, { bone: head, sides: 6 });
    b.spike([s * 0.03, 0.99, 1.0], [0, 1, 0.1], 0.035, 0.008, BONE, { bone: jaw, sides: 6 });
    // mouth line
    b.sweep(
      [
        [s * 0.052, 1.015, 1.01],
        [s * 0.058, 1.013, 0.95],
        [s * 0.075, 1.025, 0.89],
      ],
      0.004,
      { color: BLACK, bone: head, sides: 4 },
    );
    // eye
    const ex = s * 0.066;
    const ey = 1.1;
    const ez = 0.875;
    b.part(ball(8, 6), BLACK, { bone: head, at: [ex, ey, ez - 0.004], scale: [0.026, 0.021, 0.026] });
    glow(b.part(ball(8, 6), EYE, { bone: head, at: [ex + s * 0.003, ey, ez + 0.006], scale: [0.019, 0.015, 0.017] }), 0.7);
    b.part(ball(6, 5), BLACK, { bone: head, at: [ex + s * 0.004, ey, ez + 0.022], scale: [0.006, 0.012, 0.004] });
    // brow
    b.sweep(
      [
        [s * 0.028, 1.126, 0.925],
        [s * 0.06, 1.135, 0.905],
        [s * 0.092, 1.138, 0.866],
      ],
      0.012,
      { color: "#33353c", bone: head, sides: 6 },
    );
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.sweep(
        [
          [s * 0.046, 1.042 + k * 0.008, 0.99 - k * 0.01],
          [s * (0.12 + k * 0.01), 1.03 - k * 0.012, 0.93 - k * 0.02],
        ],
        0.0025,
        { color: WHISKER, bone: head, sides: 4 },
      );
    }
    // ears
    const X = [0.958, -s * 0.287, 0];
    const Y = [s * 0.287, 0.958, 0];
    const outline: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.055, 0],
      [0.055, 0],
      [0.05, 0.06],
      [0.012, 0.175, "sharp"],
      [-0.035, 0.105],
    ];
    const earPaint = paint((_p, _n, c) => (c[1] > 0.13 ? BLACK : DARK));
    b.extrude(outline, {
      at: [s * 0.06, 1.125, 0.77],
      x: X,
      y: Y,
      thickness: 0.022,
      bevel: 0.004,
      color: earPaint,
      bone: head,
    });
    const inner: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.032, 0.012],
      [0.032, 0.012],
      [0.028, 0.06],
      [0.008, 0.14, "sharp"],
      [-0.02, 0.09],
    ];
    b.extrude(inner, {
      at: [s * 0.06, 1.125, 0.781],
      x: X,
      y: Y,
      thickness: 0.008,
      color: "#cdbfa8",
      bone: head,
    });
  }
  // gold ring on the left ear
  b.part(new THREE.TorusGeometry(0.016, 0.004, 5, 10), GOLD, { bone: head, at: [0.122, 1.17, 0.775] });

  // ---- Fur cards ----------------------------------------------------------------------------------------------
  const bodyHits = b.surface(body).scatter(330, { rng: R, minDist: 0.07, filter: (h) => h.n.y > -0.15 });
  b.cards(bodyHits, [tuftA, tuftB], {
    size: [0.085, 0.14],
    lean: 62,
    bend: 28,
    flow: [0, -0.25, -1],
    vary: 0.3,
    spin: 15,
    rng: R,
    color: coat,
  });
  const chestHits = b.surface(body).scatter(90, {
    rng: R,
    minDist: 0.045,
    filter: (h) => h.at.z > 0.3 && h.n.z > 0.2,
  });
  b.cards(chestHits, [tuftA, tuftB], {
    size: [0.09, 0.16],
    lean: 50,
    bend: 30,
    flow: [0, -1, 0],
    vary: 0.3,
    rng: R,
    color: coat,
  });
  const ruffHits = b.surface(neckS).scatter(150, { rng: R, minDist: 0.04, filter: (h) => h.n.y < 0.55 });
  b.cards(ruffHits, [tuftA, tuftB], {
    size: [0.075, 0.15],
    lean: 50,
    bend: 30,
    flow: [0, -1, -0.2],
    vary: 0.3,
    rng: R,
    color: coat,
  });
  const ridge = Array.from({ length: 34 }, (_, i) => body.at(0.04 + i * 0.0275, 0));
  b.cards(ridge, tuftB, {
    size: [0.07, 0.15],
    lean: 35,
    bend: 25,
    flow: [0, -0.15, -1],
    vary: 0.25,
    spin: 10,
    rng: R,
    color: "#3b3d45",
  });
  const mane = Array.from({ length: 12 }, (_, i) => neckS.at(0.08 + i * 0.075, 0));
  b.cards(mane, tuftA, {
    size: [0.08, 0.17],
    lean: 40,
    bend: 25,
    flow: [0, -0.2, -1],
    vary: 0.25,
    rng: R,
    color: "#3f4148",
  });
  const tailHits = b.surface(tailS).scatter(130, { rng: R, minDist: 0.045 });
  b.cards(tailHits, [tuftA, tuftB], {
    size: [0.08, 0.15],
    lean: 60,
    bend: 25,
    flow: [0, -1, -0.5],
    vary: 0.3,
    rng: R,
    color: tailCoat,
  });
  const legHits = b.surface(legSweeps).scatter(90, {
    rng: R,
    minDist: 0.05,
    filter: (h) => h.at.y > 0.3 && h.n.y < 0.4,
  });
  b.cards(legHits, tuftB, {
    size: [0.06, 0.12],
    lean: 60,
    bend: 20,
    flow: [0, -1, 0],
    vary: 0.3,
    rng: R,
    color: legBase,
  });
  // cheek ruff and head tufts
  const cheekHits = b.surface(skull).scatter(46, {
    rng: R,
    minDist: 0.032,
    filter: (h) => Math.abs(h.at.x) > 0.06 && h.at.y < 1.12 && h.n.z < 0.6,
  });
  b.cards(cheekHits, tuftB, {
    size: [0.045, 0.085],
    lean: 70,
    bend: 30,
    flow: [0, -0.25, -1],
    vary: 0.3,
    rng: R,
    color: "#f2ebd8",
  });
  const crownHits = b.surface(skull).scatter(30, { rng: R, minDist: 0.03, filter: (h) => h.at.y > 1.13 });
  b.cards(crownHits, tuftA, {
    size: [0.04, 0.08],
    lean: 60,
    bend: 25,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: R,
    color: "#555861",
  });

  // Slightly parted jaw so the fangs read
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}

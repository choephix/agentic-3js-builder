import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
import { catmull } from "../../../../src/path";
import { gradient, mottle, paint } from "../../../../src/paint";
import { animeEye, cel, furEdge, INK, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Bird on its Head",
  description:
    "A chubby whimsical capybara with fur cards, big shiny eyes, flower and a tiny robin perched on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const BROWN = "#b9814a";
const BROWN_D = "#8f5d33";
const BELLY = "#e9c995";
const MUZZLE = "#7a4a2c";
const NOSE_C = "#3a2218";
const HOOF = "#4a2e22";
const PINK = "#f2a0a0";
const BIRD_BODY = "#6fb6e8";
const BIRD_BELLY = "#fff0c8";
const BIRD_BREAST = "#ff7a4a";
const BEAK = "#ffb21e";
const PETAL = "#ff8fc0";
const PETAL2 = "#fff2a8";
const GREEN = "#6cc04a";
const GREEN_D = "#3f9a3a";
const STEM = "#4fae45";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });
  const R = rng(11);

  // --------------------------------------------------------------- paints
  const COAT = cel(
    furEdge(
      mottle(BROWN, "#c8925a", { size: 0.09, contrast: 0.6, seed: 3 }),
      BELLY,
      { level: -0.38, teeth: 0.2, period: 0.03, ink: BROWN_D, inkWidth: 0.04 },
    ),
  );
  const COAT_LEG = cel(
    furEdge(
      mottle(BROWN, "#c8925a", { size: 0.07, contrast: 0.5, seed: 5 }),
      BELLY,
      { level: -0.7, teeth: 0.15, period: 0.025 },
    ),
  );
  const HEAD_P = cel(
    furEdge(
      mottle(BROWN, "#c48a52", { size: 0.06, contrast: 0.5, seed: 9 }),
      BELLY,
      { level: -0.55, teeth: 0.2, period: 0.026, ink: BROWN_D, inkWidth: 0.035 },
    ),
  );
  const SNOUT_P = cel(
    gradient(MUZZLE, "#9a6540", [0, 0.3, 0.7], [0, 0.34, 0.5]),
  );
  const SNOUT_RIM = inkLines(SNOUT_P, { levels: [0.15], axis: [0, 0, 1], width: 0.05 });
  const EAR_P = cel("#a06a3c");
  const EAR_IN = cel(PINK);
  const HOOF_P = cel(HOOF);
  const FOOT_P = cel(
    furEdge(BROWN_D, BROWN, { by: "position", axis: [0, 1, 0], level: 0.03, teeth: 0.012, period: 0.02, along: [0, 0, 1] }),
  );
  const BIRD_P = cel(
    furEdge(BIRD_BODY, BIRD_BELLY, { level: -0.3, teeth: 0.25, period: 0.014 }),
  );
  const BREAST_P = cel(BIRD_BREAST);
  const WING_P = cel(
    furEdge("#4d9ad6", BIRD_BODY, { by: "position", axis: [0, 0, 1], level: -0.1, teeth: 0.01, period: 0.012, along: [1, 0, 0] }),
  );
  const BEAK_P = cel(BEAK);
  const EYE = animeEye({ iris: "#3b2216", irisLight: "#8a5530", blush: false, brow: false });
  const BIRD_EYE = animeEye({ iris: "#1a1018", irisLight: "#4a3a50", blush: false, brow: false, size: 256 });

  // -------------------------------------------------------------- textures
  const furTuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C8 48 6 22 16 0 C26 22 24 48 16 64Z" fill="#ffffff"/><path d="M16 60 C14 44 14 24 16 8" stroke="#bbbbbb" stroke-width="3" fill="none"/></svg>`,
    { size: 96 },
  );
  const furTuft2 = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 64 C2 40 8 14 18 0 C24 20 30 44 28 64Z" fill="#ffffff"/></svg>`,
    { size: 96 },
  );
  const whisker = svg(
    `<svg viewBox="0 0 64 8"><path d="M0 4 C20 0 44 0 64 6" stroke="#fff6e0" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
  const blade = svg(
    `<svg viewBox="0 0 24 64"><path d="M2 64 C6 40 10 20 16 0 C22 24 24 44 22 64Z" fill="#ffffff"/><path d="M12 62 C13 44 15 26 16 8" stroke="#cccccc" stroke-width="2.5" fill="none"/></svg>`,
    { size: 96 },
  );
  const featherT = svg(
    `<svg viewBox="0 0 24 48"><path d="M12 48 C2 36 2 14 12 0 C22 14 22 36 12 48Z" fill="#ffffff"/><path d="M12 46 L12 6" stroke="#aaaaaa" stroke-width="2" fill="none"/></svg>`,
    { size: 96 },
  );
  const daisyPetal = svg(
    `<svg viewBox="0 0 24 48"><path d="M12 48 C0 34 2 10 12 0 C22 10 24 34 12 48Z" fill="#ffffff"/><path d="M12 44 L12 12" stroke="#e0e0e0" stroke-width="2.5" fill="none"/></svg>`,
    { size: 96 },
  );
  const bodyMark = svg(
    `<svg viewBox="0 0 64 32"><g fill="#6b4122" opacity="0.9"><path d="M4 22 C10 12 16 10 22 14 C18 18 12 22 4 22Z"/><path d="M26 10 C34 6 44 8 50 14 C42 14 34 16 26 10Z"/><path d="M40 24 C46 20 54 20 60 24 C52 28 46 28 40 24Z"/></g></svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------- body
  // barrel: loft of ellipse stations from rump (z<0) to shoulders (z>0)
  const body = b.loft(
    [
      { at: [0, 0.31, -0.5], w: 0.2, h: 0.2 },
      { at: [0, 0.34, -0.4], w: 0.38, h: 0.34 },
      { at: [0, 0.355, -0.2], w: 0.5, h: 0.4 },
      { at: [0, 0.36, 0.0], w: 0.54, h: 0.42 },
      { at: [0, 0.36, 0.2], w: 0.52, h: 0.41 },
      { at: [0, 0.35, 0.36], w: 0.44, h: 0.37 },
      { at: [0, 0.34, 0.46], w: 0.3, h: 0.28 },
    ],
    { color: COAT, sides: 14, caps: "round" },
  );

  // back marking (painted patch on the dorsal line)
  b.decal(body, bodyMark, {
    at: [0, 0.55, -0.12],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.42, 0.21],
    segments: 14,
    lift: 0.004,
  });

  // ---------------------------------------------------------- legs
  const legs: Array<[number, number, number, number]> = [
    // x side, z, height, thickness
    [1, 0.3, 0.2, 0.075],
    [-1, 0.3, 0.2, 0.075],
    [1, -0.33, 0.2, 0.085],
    [-1, -0.33, 0.2, 0.085],
  ];
  for (const [s, z, h, r] of legs) {
    const x = s * 0.17;
    // thigh/upper leg hidden in body, visible knee-to-foot stub
    b.capsule([x, h + 0.08, z], [x * 1.04, 0.05, z + 0.01], [r, r * 0.8], { color: COAT_LEG, sides: 8 });
    // foot
    b.part(new THREE.SphereGeometry(1, 8, 6), FOOT_P, {
      at: [x * 1.06, 0.032, z + 0.035],
      scale: [r * 1.05, 0.034, r * 1.5],
    });
    // toes (hooves)
    for (const t of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), HOOF_P, {
        at: [x * 1.06 + t * r * 0.55, 0.018, z + 0.035 + r * 1.35 - Math.abs(t) * 0.012],
        scale: [r * 0.38, 0.02, r * 0.4],
      });
    }
    // fur ruff at the elbow/knee
    const legSurf = b.surface(b.part(new THREE.SphereGeometry(1, 8, 6), COAT_LEG, {
      at: [x, h + 0.04, z],
      scale: [r * 1.1, 0.07, r * 1.1],
    }));
    const hits = legSurf.scatter(6, { rng: R, minDist: 0.03 });
    b.cards(hits, furTuft, { size: [0.03, 0.05], lean: 70, bend: 25, vary: 0.25, rng: R, color: BROWN });
  }

  // little tail nub
  b.part(new THREE.SphereGeometry(1, 6, 5), BROWN_D, { at: [0, 0.36, -0.58], scale: [0.03, 0.025, 0.03] });

  // ------------------------------------------------------------- head
  const HEAD_C: [number, number, number] = [0, 0.5, 0.58];
  // skull: big rounded block
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD_P, {
    at: HEAD_C,
    scale: [0.17, 0.155, 0.19],
  });
  // cheeks, soft whimsical jowls
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), HEAD_P, {
      at: [s * 0.1, 0.46, 0.64],
      scale: [0.075, 0.085, 0.1],
    });
  }
  // blocky snout: loft from skull toward the front
  const snout = b.loft(
    [
      { at: [0, 0.49, 0.68], w: 0.24, h: 0.2 },
      { at: [0, 0.475, 0.74], w: 0.235, h: 0.2 },
      { at: [0, 0.465, 0.79], w: 0.22, h: 0.195 },
    ],
    { color: HEAD_P, sides: 10, caps: "round" },
  );
  // muzzle pad (darker nose block)
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), SNOUT_RIM, {
    at: [0, 0.462, 0.815],
    scale: [0.105, 0.088, 0.062],
  });
  // nose pad
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(NOSE_C, "#241410"), {
    at: [0, 0.495, 0.865],
    scale: [0.062, 0.04, 0.03],
  });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 5, 4), "#150b08", {
      at: [s * 0.024, 0.493, 0.892],
      scale: [0.013, 0.01, 0.008],
    });
    // whisker bumps
    for (const [dy, dz] of [[-0.02, 0], [0.005, 0.01], [-0.045, -0.01]] as const) {
      b.part(new THREE.SphereGeometry(1, 4, 3), "#3a2218", {
        at: [s * 0.062, 0.462 + dy, 0.815 + dz + 0.03],
        scale: [0.007, 0.007, 0.007],
      });
    }
  }
  // mouth line + chin
  const mouth = catmull([
    [0.0, 0.44, 0.872],
    [0.0, 0.425, 0.866],
    [0.03, 0.418, 0.855],
    [0.062, 0.426, 0.835],
  ]);
  const mouthL = b.sweep(mouth, 0.004, { color: INK, caps: "round", sides: 5 });
  b.sweep(
    catmull([
      [0.0, 0.44, 0.872],
      [0.0, 0.425, 0.866],
      [-0.03, 0.418, 0.855],
      [-0.062, 0.426, 0.835],
    ]),
    0.004,
    { color: INK, caps: "round", sides: 5 },
  );
  void mouthL;
  // chin tuft + two chisel teeth
  b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { at: [0, 0.405, 0.8], scale: [0.065, 0.04, 0.07] });
  b.part(new THREE.BoxGeometry(0.018, 0.022, 0.008), "#fff8e8", { at: [0, 0.428, 0.862], aim: [0, 0, 1] });

  // eyes
  const skin = b.surface([skull, snout]);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 56, 14);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.06, 0.082], mirror: s > 0, segments: 12 });
    // eyebrow tuft
    b.sweep(
      catmull([
        [s * 0.04, 0.585, 0.7],
        [s * 0.075, 0.597, 0.675],
        [s * 0.105, 0.585, 0.64],
      ]),
      [0.006, 0.003],
      { color: BROWN_D, caps: "round", sides: 5 },
    );
  }

  // ears: small round, set high and back, with pink inside
  for (const s of [1, -1]) {
    const ear = b.part(new THREE.SphereGeometry(1, 10, 8), EAR_P, {
      at: [s * 0.125, 0.6, 0.5],
      scale: [0.04, 0.052, 0.03],
      rotation: [10, s * -15, s * -20],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_IN, {
      at: [s * 0.13, 0.598, 0.522],
      scale: [0.026, 0.036, 0.012],
      rotation: [10, s * -15, s * -20],
    });
    void ear;
  }

  // whiskers (cards)
  for (const s of [1, -1]) {
    const fr = [-0.012, 0.004, 0.02].map((dy) => frame([s * 0.07, 0.47 + dy, 0.85], [s, 0.15 * (dy * 40), 0.6]));
    b.cards(fr, whisker, { size: [0.14, 0.018], lean: 0, flow: [0, 1, 0], mirror: s > 0, bend: 0 });
  }

  // ------------------------------------------------------------- fur cards
  const bodySurf = b.surface(body);
  const furHits = bodySurf.scatter(260, {
    rng: rng(21),
    minDist: 0.036,
    filter: (h) => h.n.y > -0.2,
  });
  b.cards(furHits, furTuft, {
    size: [0.045, 0.075],
    lean: 62,
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rng(22),
    color: gradient("#c99660", BROWN, [0, 0.62, 0], [0, 0.3, 0]),
    flow: [0, -0.35, -1],
  });
  const furBelly = bodySurf.scatter(80, {
    rng: rng(23),
    minDist: 0.04,
    filter: (h) => h.n.y < -0.15 && h.n.y > -0.8,
  });
  b.cards(furBelly, furTuft2, {
    size: [0.04, 0.06],
    lean: 70,
    bend: 20,
    vary: 0.25,
    rng: rng(24),
    color: BELLY,
  });
  // head tufts (fur on cheeks and crown)
  const headSurf = b.surface(skull);
  const headHits = headSurf.scatter(70, {
    rng: rng(31),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.3 && h.n.z < 0.6 && h.local([0, 0, 0]).z > -1,
  });
  b.cards(headHits, furTuft, {
    size: [0.03, 0.05],
    lean: 66,
    bend: 25,
    vary: 0.3,
    spin: 20,
    rng: rng(32),
    color: "#c48a52",
    flow: [0, -0.2, -1],
  });
  // chest ruff
  const chest = bodySurf.scatter(30, {
    rng: rng(41),
    minDist: 0.035,
    filter: (h) => h.n.z > 0.5 && h.n.y < 0.4,
  });
  b.cards(chest, furTuft2, { size: [0.04, 0.06], lean: 75, bend: 20, vary: 0.25, rng: rng(42), color: "#d6a56c", flow: [0, -1, 0.3] });

  // ------------------------------------------------------------- bird
  // robin-like round bird perched on the crown, facing slightly sideways
  const BC: [number, number, number] = [0.0, 0.7, 0.55];
  const birdBody = b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_P, {
    at: [BC[0], BC[1] + 0.045, BC[2]],
    scale: [0.062, 0.058, 0.07],
    rotation: [-12, 0, 0],
  });
  // breast patch
  b.part(new THREE.SphereGeometry(1, 10, 8), BREAST_P, {
    at: [0, BC[1] + 0.035, BC[2] + 0.04],
    scale: [0.045, 0.045, 0.036],
    rotation: [-12, 0, 0],
  });
  // head
  const birdHead = b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_P, {
    at: [0, BC[1] + 0.1, BC[2] + 0.04],
    scale: [0.044, 0.042, 0.044],
  });
  // beak (cone)
  b.spike([0, BC[1] + 0.097, BC[2] + 0.078], [0, -0.05, 1], 0.036, 0.011, { color: BEAK_P, sides: 6 });
  b.spike([0, BC[1] + 0.093, BC[2] + 0.075], [0, -0.15, 1], 0.026, 0.009, { color: cel("#e8920c"), sides: 6 });
  // eyes (decals)
  const bskin = b.surface(birdHead);
  for (const s of [1, -1]) {
    const hit = bskin.around([0, BC[1] + 0.1, BC[2] + 0.04]).at(s * 62, 8);
    if (hit) b.decal(bskin, BIRD_EYE, { at: hit, size: [0.02, 0.027], mirror: s > 0, segments: 8 });
  }
  // cheek blush
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ff9a8a", {
      at: [s * 0.036, BC[1] + 0.088, BC[2] + 0.062],
      scale: [0.008, 0.008, 0.005],
    });
  }
  // little crest tuft
  b.cards(
    [-0.01, 0, 0.01].map((dx, i) => frame([dx, BC[1] + 0.138, BC[2] + 0.03 - i * 0.002], [dx * 4, 1, -0.2])),
    featherT,
    { size: [0.014, 0.034], lean: 20, flow: [0, 0, -1], bend: 25, color: "#4d9ad6" },
  );
  // wings (folded feather cards on each side)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), WING_P, {
      at: [s * 0.052, BC[1] + 0.05, BC[2] - 0.01],
      scale: [0.016, 0.04, 0.052],
      rotation: [-14, s * 12, s * -6],
    });
    const wf = [0, 1, 2, 3, 4].map((i) =>
      frame([s * 0.062, BC[1] + 0.045 - i * 0.004, BC[2] - 0.0 - i * 0.012], [s, 0.2, -0.1]),
    );
    b.cards(wf, featherT, {
      size: [0.02, 0.05],
      lean: 82,
      flow: [0, -0.3, -1],
      bend: 14,
      vary: 0.15,
      rng: rng(51),
      color: "#3b87c8",
      mirror: s > 0,
    });
  }
  // tail feathers fanning back and up
  const tailFr = [-2, -1, 0, 1, 2].map((i) => frame([i * 0.007, BC[1] + 0.03, BC[2] - 0.062], [i * 0.1, 0.25, -1]));
  b.cards(tailFr, featherT, {
    size: [0.02, 0.07],
    lean: 10,
    flow: [0, 1, 0],
    bend: 10,
    rng: rng(52),
    color: "#3b87c8",
    spin: 4,
  });
  // legs and feet gripping the fur
  for (const s of [1, -1]) {
    b.rod([s * 0.018, BC[1] - 0.005, BC[2] + 0.005], [s * 0.018, BC[1] - 0.04, BC[2] + 0.01], 0.0042, { color: "#d98a2a", sides: 5 });
    for (const t of [-1, 0, 1]) {
      b.rod(
        [s * 0.018, BC[1] - 0.04, BC[2] + 0.01],
        [s * 0.018 + t * 0.011, BC[1] - 0.046, BC[2] + 0.034 + (t === 0 ? 0.006 : 0)],
        0.003,
        { color: "#d98a2a", sides: 4 },
      );
    }
  }

  // ----------------------------------------------- flower behind one ear
  const FC: [number, number, number] = [0.13, 0.66, 0.46];
  const petals = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return frame([FC[0] + Math.cos(a) * 0.006, FC[1] + 0.012, FC[2] + Math.sin(a) * 0.006], [Math.cos(a), 0.15, Math.sin(a)]);
  });
  b.cards(petals, daisyPetal, { size: [0.026, 0.034], lean: 80, flow: [0, 1, 0], bend: 12, color: PETAL, cross: false });
  b.part(new THREE.SphereGeometry(1, 8, 6), PETAL2, { at: [FC[0], FC[1] + 0.013, FC[2]], scale: [0.012, 0.01, 0.012] });
  b.rod([FC[0], FC[1] + 0.012, FC[2]], [FC[0] - 0.012, FC[1] - 0.04, FC[2] + 0.015], 0.003, { color: STEM, sides: 5 });
  b.cards(
    [frame([FC[0] - 0.014, FC[1] - 0.02, FC[2] + 0.012], [0.5, 0.6, 0.2]), frame([FC[0] - 0.01, FC[1] - 0.026, FC[2] + 0.014], [-0.3, 0.6, 0.5])],
    blade,
    { size: [0.02, 0.04], lean: 50, flow: [0, 0, 1], color: GREEN_D },
  );

  // ----------------------------------------------- grass tufts underfoot
  const grassFr: ReturnType<typeof frame>[] = [];
  const gr = rng(61);
  for (let i = 0; i < 26; i++) {
    const a = gr() * Math.PI * 2;
    const rr = 0.42 + gr() * 0.2;
    const gx = Math.cos(a) * rr * 0.9;
    const gz = Math.sin(a) * rr * 1.25 + 0.02;
    grassFr.push(frame([gx, 0.0, gz], [0, 1, 0]));
  }
  b.cards(grassFr, blade, {
    size: [0.03, 0.08],
    lean: 10,
    bend: 18,
    vary: 0.4,
    spin: 180,
    rng: rng(62),
    color: gradient(GREEN_D, GREEN, [0, 0, 0], [0, 0.08, 0]),
    cross: true,
    flow: [0, 0, 1],
  });
  // a few clover-ish dots
  for (let i = 0; i < 5; i++) {
    const a = gr() * Math.PI * 2;
    const rr = 0.5 + gr() * 0.15;
    b.part(new THREE.SphereGeometry(1, 5, 4), i % 2 ? "#fff6c0" : PETAL, {
      at: [Math.cos(a) * rr * 0.9, 0.012, Math.sin(a) * rr * 1.25 + 0.02],
      scale: [0.012, 0.01, 0.012],
    });
  }

  // paint a grounding patch (soft mud under the belly)
  b.part(new THREE.CylinderGeometry(1, 1, 0.006, 16), paint((p) => (Math.hypot(p.x, p.z * 0.8) > 0.8 ? "#7ab94c" : "#8a6a44")), {
    at: [0, 0.001, 0.15],
    scale: [0.55, 1, 0.8],
  });

  return b.root;
}

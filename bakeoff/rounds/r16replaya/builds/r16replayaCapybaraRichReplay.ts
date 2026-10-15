import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Capybara with a Songbird",
  description:
    "A plump, sleepy-eyed capybara with a fuzzy tawny coat, rosy freckled cheeks and a daisy behind one ear, calmly " +
    "carrying a little bluebird perched on its head. Full quadruped rig with jaw, ears, toes; the bird has its own wings, tail and beak.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const COAT_A = "#c8813f";
const COAT_B = "#a9642f";
const COAT_C = "#8f5226";
const BELLY_A = "#ecc287";
const BELLY_B = "#dba96b";
const SNOUT = "#7a4725";
const FOOT = "#80502b";
const NAIL = "#3b2517";
const NOSE = "#35211f";
const NOSE_DEEP = "#150b0a";
const NOSE_HL = "#85696a";
const TEETH = "#f7e4b4";
const EAR_OUT = "#8a5128";
const EAR_IN = "#efa9a4";
const LINE = "#3a2418";
const WHISK = "#4b3626";

const BIRD_BLUE = "#4aa4ea";
const BIRD_BLUE2 = "#6bbcf5";
const BIRD_DEEP = "#2a62bd";
const BIRD_CREAM = "#fff3d6";
const BIRD_ORANGE = "#ffa956";
const BEAK = "#ffcf3d";
const BIRD_LEG = "#f2a05a";
const EYE_DARK = "#1b1210";
const WHITE = "#ffffff";

const PETAL = "#fff7ef";
const PETAL_EDGE = "#ffd9e6";
const DAISY = "#ffc531";

// ---------------------------------------------------------------- textures
const eyeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><clipPath id="c"><ellipse cx="32" cy="35" rx="27" ry="26"/></clipPath></defs>
  <ellipse cx="32" cy="35" rx="27" ry="26" fill="#241510"/>
  <g clip-path="url(#c)">
    <circle cx="23" cy="38" r="8.5" fill="#ffffff"/>
    <circle cx="42" cy="49" r="4" fill="#ffffff"/>
    <path d="M0 40 Q32 14 64 40 L64 0 L0 0 Z" fill="#b06a33"/>
    <path d="M0 40 Q32 14 64 40" fill="none" stroke="#3a2012" stroke-width="3.2"/>
  </g>
  <path d="M5 11 Q32 -3 59 11" fill="none" stroke="#6b3d1d" stroke-width="3.4" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const blushTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
  <ellipse cx="32" cy="20" rx="30" ry="17" fill="#ff93a4"/>
  <ellipse cx="32" cy="20" rx="22" ry="11" fill="#ffa9b6"/>
  <circle cx="20" cy="18" r="2.6" fill="#e0687e"/>
  <circle cx="32" cy="25" r="2.6" fill="#e0687e"/>
  <circle cx="44" cy="18" r="2.6" fill="#e0687e"/>
</svg>`,
  { size: 128 },
);

const tuftTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
  <path d="M10 48 Q9 24 1 3 Q14 15 18 48Z" fill="#dcdcdc"/>
  <path d="M13 48 Q12 22 17 0 Q26 22 21 48Z" fill="#ffffff"/>
  <path d="M16 48 Q22 30 31 11 Q32 34 25 48Z" fill="#c8c8c8"/>
</svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rnd = rng(11);

  // ------------------------------------------------------------ paints
  const furBack = mottle(grain(COAT_A, COAT_B, { size: 0.026, axis: "z", seed: 3 }), COAT_C, {
    size: 0.14,
    contrast: 0.45,
    seed: 5,
  });
  const furBelly = grain(BELLY_A, BELLY_B, { size: 0.026, axis: "z", seed: 8 });
  const COAT = countershade(furBack, furBelly, { level: -0.28, soft: 0.35 });
  const HEAD = countershade(gradient(furBack, SNOUT, [0, 0.4, 0.46], [0, 0.4, 0.68]), furBelly, {
    level: -0.45,
    soft: 0.3,
  });
  const LEGS = gradient(COAT, FOOT, [0, 0.2, 0], [0, 0.05, 0]);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.31, -0.22], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.31, -0.22],
      [0, 0.32, -0.02],
      [0, 0.335, 0.14],
      [0, 0.345, 0.28],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.joint("neck", {
    parent: spine.joints[2],
    at: [0, 0.345, 0.28],
    aim: [0, 0.36, 0.36],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.36, 0.36], dir: [0, -0.03, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.25, 0.45], aim: [0, 0.235, 0.66], role: "jaw" });

  // ------------------------------------------------------------ body
  b.loft(
    [
      { at: [0, 0.285, -0.4], w: 0.22, h: 0.24 },
      { at: [0, 0.31, -0.3], w: 0.36, h: 0.36 },
      { at: [0, 0.32, -0.12], w: 0.41, h: 0.39 },
      { at: [0, 0.33, 0.06], w: 0.41, h: 0.39 },
      { at: [0, 0.34, 0.2], w: 0.36, h: 0.35 },
      { at: [0, 0.35, 0.32], w: 0.26, h: 0.28 },
    ],
    { bone: [spine, hips], color: COAT, sides: 12, name: "body" },
  );
  const bodyMesh = b.surface(b.root);

  // ------------------------------------------------------------ head
  const skull = b.loft(
    [
      { at: [0, 0.36, 0.3], w: 0.28, h: 0.3 },
      { at: [0, 0.365, 0.42], w: 0.28, h: 0.31 },
      { at: [0, 0.345, 0.55], w: 0.26, h: 0.3 },
      { at: [0, 0.33, 0.64], w: 0.235, h: 0.27 },
      { at: [0, 0.325, 0.7], w: 0.17, h: 0.2 },
    ],
    { bone: head, color: HEAD, sides: 12, caps: { start: "flat", end: "flat" }, name: "skull" },
  );
  const lower = b.loft(
    [
      { at: [0, 0.22, 0.47], w: 0.18, h: 0.09 },
      { at: [0, 0.205, 0.6], w: 0.17, h: 0.07 },
      { at: [0, 0.205, 0.665], w: 0.14, h: 0.06 },
    ],
    { bone: jaw, color: HEAD, sides: 10, caps: { start: "flat", end: "flat" }, name: "lowerJaw" },
  );
  void lower;

  const face = b.surface(skull);

  // cheeks, bridge bump, nose pad, nostrils, incisors
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), HEAD, {
      bone: head,
      at: [s * 0.1, 0.335, 0.52],
      scale: [0.065, 0.075, 0.085],
      name: s > 0 ? "cheekL" : "cheekR",
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), "#5a3419", {
    bone: head,
    at: [0, 0.462, 0.6],
    scale: [0.04, 0.014, 0.055],
    name: "morrillo",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), NOSE, {
    bone: head,
    at: [0, 0.352, 0.703],
    scale: [0.074, 0.055, 0.03],
    name: "nosePad",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE_HL, {
    bone: head,
    at: [-0.02, 0.372, 0.727],
    scale: [0.014, 0.008, 0.005],
    name: "noseGlint",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSE_DEEP, {
      bone: head,
      at: [s * 0.03, 0.352, 0.726],
      scale: [0.018, 0.012, 0.008],
      name: s > 0 ? "nostrilL" : "nostrilR",
    });
    // incisors
    b.part(new THREE.BoxGeometry(0.025, 0.04, 0.014), TEETH, {
      bone: head,
      at: [s * 0.0145, 0.218, 0.705],
      name: s > 0 ? "toothL" : "toothR",
    });
  }
  // philtrum
  b.rod([0, 0.3, 0.7], [0, 0.236, 0.705], 0.0028, { bone: head, color: LINE, sides: 4, caps: "flat", name: "philtrum" });

  // eyes, blush, mouth line, whiskers
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: [s * 0.138, 0.435, 0.455],
      dir: [s * 0.9, 0.15, 0.4],
      size: [0.075, 0.075],
      mirror: s > 0,
      lift: 0.002,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.decal(skull, blushTex, {
      at: [s * 0.125, 0.345, 0.5],
      dir: [s * 0.95, 0.0, 0.3],
      size: [0.085, 0.052],
      lift: 0.0015,
      name: s > 0 ? "blushL" : "blushR",
    });
    const mouth = face.drape(
      polyline([
        [s * 0.075, 0.232, 0.7],
        [s * 0.108, 0.232, 0.64],
        [s * 0.13, 0.24, 0.57],
        [s * 0.142, 0.262, 0.52],
        [s * 0.142, 0.285, 0.495],
      ]),
      { lift: 0.002 },
    );
    b.sweep(mouth, 0.0035, { color: LINE, sides: 4, name: s > 0 ? "mouthL" : "mouthR" });
    for (let i = 0; i < 3; i++) {
      const droop = (i - 1) * 0.026;
      b.sweep(
        bezier(
          [s * 0.085, 0.3 + droop * 0.4, 0.675],
          [s * 0.15, 0.3 + droop, 0.715],
          [s * 0.205, 0.285 + droop * 1.8, 0.69],
        ),
        [0.0028, 0.0008],
        { bone: head, color: WHISK, sides: 4, name: `whisker${s > 0 ? "L" : "R"}${i}` },
      );
    }
  }

  // ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${L}`, {
      parent: head,
      at: [s * 0.1, 0.5, 0.345],
      dir: [s * 0.55, 1, -0.2],
      role: "hinge",
    });
    const dir = [s * 0.75, 0.6, -0.15];
    b.part(new THREE.SphereGeometry(1, 10, 8), EAR_OUT, {
      bone: ear,
      at: [s * 0.108, 0.512, 0.34],
      scale: [0.04, 0.046, 0.021],
      dir,
      axis: "z",
      name: `earOuter${L}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_IN, {
      bone: ear,
      at: [s * 0.1135, 0.5155, 0.341],
      scale: [0.027, 0.032, 0.014],
      dir,
      axis: "z",
      name: `earInner${L}`,
    });
  }

  // daisy behind the left ear
  {
    const c: [number, number, number] = [0.13, 0.475, 0.405];
    const n = [0.45, 1, 0.1];
    const flower = b.ring([c, [c[0] + n[0], c[1] + n[1], c[2] + n[2]]], { count: 9, radius: 0.024 });
    for (const it of flower.items) {
      b.part(new THREE.SphereGeometry(1, 6, 4), PETAL, {
        bone: head,
        frame: it,
        scale: [0.0085, 0.022, 0.004],
        name: `petal${it.i}`,
      });
    }
    b.part(new THREE.SphereGeometry(0.014, 8, 6), DAISY, {
      bone: head,
      at: [c[0] + 0.003, c[1] + 0.007, c[2] + 0.001],
      scale: [1, 0.7, 1],
      name: "daisyCentre",
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), "#e69a14", {
      bone: head,
      at: [c[0] + 0.004, c[1] + 0.0145, c[2] + 0.001],
      name: "daisyDot",
    });
  }

  // ------------------------------------------------------------ legs
  const FRONT_DX = [-0.034, -0.011, 0.011, 0.034];
  const HIND_DX = [-0.028, 0, 0.028];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const f = limb([s * 0.15, 0.27, 0.16], [s * 0.15, 0.03, 0.2], [0.14, 0.13, 0.08], [[0, 0, -1]], { sole: [0, 0, 1] });
    const fl = b.chain(`legF${L}`, f, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "leg",
    });
    b.sweep(fl, [0.075, 0.06, 0.05, 0.036, 0.032], { color: LEGS, sides: 8, name: `legF${L}` });
    const hand = fl.tip!;
    FRONT_DX.forEach((dx, i) =>
      b.sprout(
        `toeF${L}${i + 1}`,
        hand,
        [hand.at.x + dx * 1.2, hand.at.y - 0.004, hand.at.z + 0.062 - Math.abs(dx) * 0.4],
        [0.022, 0.017],
        { count: 1, role: "digit", sides: 6, bands: [[0.68, FOOT], [1, NAIL]] },
      ),
    );

    const h = limb([s * 0.16, 0.28, -0.28], [s * 0.16, 0.03, -0.2], [0.15, 0.15, 0.09], [[0, 0, 1]], { sole: [0, 0, 1] });
    const hl = b.chain(`legH${L}`, h, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`],
      role: "leg",
    });
    b.sweep(hl, [0.115, 0.085, 0.052, 0.038, 0.034], { color: LEGS, sides: 8, name: `legH${L}` });
    const foot = hl.tip!;
    HIND_DX.forEach((dx, i) =>
      b.sprout(
        `toeH${L}${i + 1}`,
        foot,
        [foot.at.x + dx * 1.2, foot.at.y - 0.004, foot.at.z + 0.066 - Math.abs(dx) * 0.4],
        [0.024, 0.018],
        { count: 1, role: "digit", sides: 6, bands: [[0.68, FOOT], [1, NAIL]] },
      ),
    );
  }

  // ------------------------------------------------------------ fur cards
  const bodyHits = bodyMesh.scatter(380, { rng: rnd, minDist: 0.05, filter: (h) => h.n.y > -0.25 });
  b.cards(bodyHits, tuftTex, { size: [0.04, 0.052], lean: 68, bend: 22, vary: 0.3, rng: rng(4), color: COAT, name: "furBody" });
  const cheekHits = face.scatter(40, {
    rng: rng(9),
    minDist: 0.032,
    filter: (h) => h.at.y < 0.4 && h.at.z > 0.37 && h.at.z < 0.5 && Math.abs(h.at.x) > 0.11,
  });
  b.cards(cheekHits, tuftTex, { size: [0.024, 0.034], lean: 70, bend: 20, vary: 0.25, rng: rng(5), color: HEAD, name: "furCheek" });
  const napeHits = face.scatter(20, {
    rng: rng(13),
    minDist: 0.04,
    filter: (h) => h.at.z < 0.37 && h.n.y > 0.4,
  });
  b.cards(napeHits, tuftTex, { size: [0.026, 0.036], lean: 65, bend: 20, vary: 0.25, rng: rng(6), color: HEAD, name: "furNape" });

  // ------------------------------------------------------------ the songbird
  const bird = b.joint("birdBody", { parent: head, at: [0, 0.565, 0.41], dir: [0, 0.15, 1], role: "spine" });
  const birdHead = b.joint("birdHead", { parent: bird, at: [0, 0.6, 0.445], dir: [0, 0, 1], role: "head" });
  const birdJaw = b.joint("birdJaw", { parent: birdHead, at: [0, 0.59, 0.466], dir: [0, 0, 1], role: "jaw" });
  const birdTail = b.joint("birdTail", { parent: bird, at: [0, 0.565, 0.372], dir: [0, 0.18, -1], role: "tail" });

  const bellyPaint = gradient(BIRD_CREAM, BIRD_ORANGE, [0, 0.55, 0.38], [0, 0.55, 0.46]);
  const birdBack = mottle(BIRD_BLUE, BIRD_BLUE2, { size: 0.03, contrast: 0.4, seed: 21 });
  const BIRD_BODY = countershade(birdBack, bellyPaint, { level: -0.15, soft: 0.25 });
  const BIRD_FACE = countershade(birdBack, bellyPaint, { level: 0.05, soft: 0.2 });

  b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_BODY, {
    bone: bird,
    at: [0, 0.565, 0.41],
    scale: [0.043, 0.041, 0.054],
    rotation: [-12, 0, 0],
    name: "birdTorso",
  });
  b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_FACE, {
    bone: birdHead,
    at: [0, 0.6, 0.445],
    scale: [0.034, 0.033, 0.034],
    name: "birdHeadBall",
  });
  b.spike([0, 0.598, 0.465], [0, -0.04, 1], 0.03, 0.012, { bone: birdHead, color: BEAK, sides: 6, name: "beakUpper" });
  b.spike([0, 0.589, 0.463], [0, 0.02, 1], 0.023, 0.0085, { bone: birdJaw, color: BEAK, sides: 6, name: "beakLower" });
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 7, 5), EYE_DARK, {
      bone: birdHead,
      at: [s * 0.027, 0.608, 0.455],
      scale: [0.0075, 0.0085, 0.0075],
      name: `birdEye${L}`,
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, {
      bone: birdHead,
      at: [s * 0.0315, 0.6115, 0.458],
      scale: [0.0026, 0.0026, 0.0026],
      name: `birdGlint${L}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), "#ff8e7c", {
      bone: birdHead,
      at: [s * 0.031, 0.592, 0.45],
      scale: [0.005, 0.0085, 0.0105],
      name: `birdBlush${L}`,
    });

    // wings
    const wing = b.joint(`birdWing${L}`, {
      parent: bird,
      at: [s * 0.037, 0.574, 0.435],
      dir: [s * 0.35, 0.2, -1],
      role: "wing",
    });
    const wingPaint = paint((_p, _n, c) => {
      if (c[0] > 0.078) return BIRD_DEEP;
      if (c[0] > 0.066 && c[1] < 0.0) return BIRD_CREAM;
      return c[1] < -0.004 ? BIRD_DEEP : BIRD_BLUE2;
    });
    b.extrude(
      [
        [0, 0.005],
        [0.012, 0.03],
        [0.045, 0.034],
        [0.08, 0.014],
        [0.108, -0.012],
        [0.09, -0.016],
        [0.096, -0.023],
        [0.07, -0.02],
        [0.042, -0.027],
        [0.012, -0.022],
      ],
      {
        at: [s * 0.039, 0.575, 0.438],
        x: [s * 0.2, 0.1, -1],
        y: [-s * 0.38, 1, 0],
        thickness: 0.009,
        bevel: 0.003,
        smoothing: 1,
        color: wingPaint,
        bone: wing,
        name: `birdWing${L}`,
      },
    );

    // legs and feet
    const leg = b.joint(`birdLeg${L}`, { parent: bird, at: [s * 0.018, 0.54, 0.41], dir: [0, -1, 0], role: "leg" });
    b.rod([s * 0.018, 0.545, 0.41], [s * 0.02, 0.523, 0.412], 0.0036, { bone: leg, color: BIRD_LEG, sides: 5, name: `birdShin${L}` });
    for (const [dx, dz] of [
      [-0.008, 0.03],
      [0.0, 0.034],
      [0.008, 0.03],
      [0.0, -0.016],
    ]) {
      b.rod(
        [s * 0.02, 0.5225, 0.412],
        [s * 0.02 + dx, 0.5225, 0.412 + dz],
        0.0034,
        { bone: leg, color: BIRD_LEG, sides: 5, name: `birdToe${L}${dz > 0 ? Math.round(dx * 1000) : "B"}` },
      );
    }
  }

  // tail feathers
  const tailPaint = paint((_p, _n, c) => (c[0] > 0.088 ? BIRD_DEEP : c[0] > 0.078 ? BIRD_CREAM : BIRD_BLUE));
  const tailShape: [number, number][] = [
    [0, -0.012],
    [0.09, -0.016],
    [0.114, -0.009],
    [0.114, 0.009],
    [0.09, 0.016],
    [0, 0.012],
  ];
  for (const yaw of [-0.24, 0, 0.24]) {
    b.extrude(tailShape, {
      at: [0, 0.566, 0.372],
      x: [yaw, 0.2, -1],
      y: [1, 0, yaw],
      thickness: 0.006,
      smoothing: 1,
      color: tailPaint,
      bone: birdTail,
      name: `tailFeather${Math.round(yaw * 100)}`,
    });
  }
  // crest
  for (const [dx, tilt] of [
    [-0.012, -0.4],
    [0, 0],
    [0.012, 0.4],
  ]) {
    b.spike([dx * 0.7, 0.627, 0.438], [tilt, 1, -0.7], 0.026, 0.0065, { bone: birdHead, color: BIRD_DEEP, sides: 5, name: `crest${Math.round(dx * 1000)}` });
  }
  // bird fluff: little breast tufts
  const fluffGeo = mergeGeometries(
    [-0.025, 0, 0.025].map((x) => new THREE.SphereGeometry(0.011, 6, 4).translate(x, 0.531, 0.43)),
  );
  if (fluffGeo) b.part(fluffGeo, BIRD_CREAM, { bone: bird, at: [0, 0, 0], name: "birdBellyFluff" });

  return b.root;
}

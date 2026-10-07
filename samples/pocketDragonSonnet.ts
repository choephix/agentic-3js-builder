import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame, Spot } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { gradient, mix, mottle, noise, paint, scales, spots } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Pocket Dragon",
  description:
    "A tiny chubby mint-green dragon sitting up in a striped scarf, cupping a little flame between its hands, with a coin pile, a gem and a daisy beside it.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const MINT = "#62d0a8";
const MINT_D = "#3aa586";
const MINT_L = "#8fe6c2";
const BELLY = "#ffe6ab";
const BELLY_B = "#f6c97a";
const WING_A = "#ff7fa3";
const WING_B = "#ffc59a";
const WING_BONE = "#34977d";
const HORN_C = "#fff1cf";
const HORN_T = "#f2b62e";
const SPIKE = "#ff7458";
const CLAW = "#fff4dc";
const CHEEK = "#ff8fa8";
const MOUTH = "#a8334a";
const TONGUE = "#ff7f9a";
const TOOTH = "#ffffff";
const NOSTRIL = "#2b5c4d";
const SCARF_R = "#e8474e";
const SCARF_C = "#fff1d4";
const COIN = "#ffcc3a";
const COIN_D = "#d9951a";
const GEM = "#59e3ff";
const GRASS = "#6cc24a";
const GRASS_D = "#46963a";
const DAISY = "#fffdf4";
const DAISY_C = "#ffbf2d";
const STEM = "#4f9b3f";
const STONE = "#b7b1c6";
const STONE_D = "#8d86a3";

// ---------------------------------------------------------------- drawings
const EYE = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="i" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#ffd24a"/><stop offset="0.6" stop-color="#f08a1c"/><stop offset="1" stop-color="#a8460f"/></radialGradient>
  </defs>
  <ellipse cx="30" cy="42" rx="27" ry="35" fill="#fffdf5" stroke="#2a2140" stroke-width="4"/>
  <ellipse cx="31" cy="46" rx="20" ry="26" fill="url(#i)"/>
  <ellipse cx="31" cy="47" rx="10" ry="15" fill="#20183a"/>
  <path d="M5 30 Q30 2 55 28" fill="none" stroke="#2a2140" stroke-width="6" stroke-linecap="round"/>
  <circle cx="22" cy="32" r="8" fill="#ffffff"/>
  <circle cx="40" cy="58" r="4" fill="#ffffff"/>
  <circle cx="19" cy="52" r="2.2" fill="#fff6c0"/>
</svg>`,
  { size: 256 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20" cy="12" rx="19" ry="11" fill="#ff8fa8"/>
  <ellipse cx="20" cy="12" rx="13" ry="7" fill="#ffa5b9"/>
  <path d="M9 9 L12 15 M17 8 L20 16 M25 9 L28 15" stroke="#ff6f8f" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);
const BLADE = svg(
  `<svg viewBox="0 0 20 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 60 Q6 28 10 0 Q16 30 18 60 Z" fill="#ffffff"/>
  <path d="M10 60 Q10 30 10 4" stroke="#cfe8c8" stroke-width="2" fill="none"/>
</svg>`,
  { size: 96 },
);
const SPARK = svg(
  `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill="#fff3a8"/>
</svg>`,
  { size: 96 },
);
const COIN_FACE = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="19" fill="#ffd54a"/>
  <circle cx="20" cy="20" r="15" fill="none" stroke="#d9951a" stroke-width="2.5"/>
  <path d="M20 9 L22.6 16.4 L30.5 16.6 L24.2 21.4 L26.4 29 L20 24.5 L13.6 29 L15.8 21.4 L9.5 16.6 L17.4 16.4 Z" fill="#e8a61e"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- helpers
/** Piecewise-linear [rx, ry] along t. */
const keyed = (keys: number[][]) => (t: number): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const k = (t - a[0]) / (keys[i][0] - a[0] || 1);
      const s = k * k * (3 - 2 * k);
      return [a[1] + (keys[i][1] - a[1]) * s, a[2] + (keys[i][2] - a[2]) * s];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

export default function build() {
  const b = createBuilder({ name: "pocketDragon", paintSize: 1024 });
  const R = rng(11);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.07, -0.025], role: "spine" });
  const spine = b.chain("spine", [hips.at, [0, 0.112, -0.018], [0, 0.152, -0.004]], {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain(
    "neckc",
    [
      [0, 0.152, -0.004],
      [0, 0.182, 0.012],
    ],
    { parent: spine.joints[1], names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[0],
    at: [0, 0.182, 0.012],
    dir: [0, 0.25, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.188, 0.04], dir: [0, 0, 1], role: "jaw" });
  const props = b.joint("props", { parent: hips, at: [0, 0.0, 0], dir: [0, 1, 0] });

  // ------------------------------------------------------------ body
  const SKIN = scales(mottle(MINT, MINT_L, { size: 0.05, contrast: 0.35, seed: 3 }), "#4fbd97", {
    size: 0.02,
    width: 0.05,
    seed: 5,
  });
  const bodyPaint = paint((p, n) => {
    const dx = p.x / 0.05;
    const dy = (p.y - 0.1) / 0.068;
    const d = dx * dx + dy * dy;
    if (n.z > 0.1 && d < 1) {
      if (d > 0.82) return BELLY_B;
      return Math.floor((p.y + 0.5) / 0.0125) % 2 === 0 ? BELLY : mix(BELLY, BELLY_B, 0.55);
    }
    if (n.z > 0.1 && d < 1.12) return mix(BELLY_B, MINT, 0.5);
    return SKIN;
  });
  const bodyPath = catmull([
    [0, 0.045, -0.03],
    [0, 0.095, -0.014],
    [0, 0.145, -0.006],
    [0, 0.185, 0.012],
  ]);
  const bodyR = keyed([
    [0, 0.042, 0.042],
    [0.18, 0.06, 0.06],
    [0.42, 0.068, 0.066],
    [0.7, 0.054, 0.052],
    [0.9, 0.04, 0.04],
    [1, 0.034, 0.034],
  ]);
  const body = b.sweep(bodyPath, bodyR, {
    bone: [hips, spine, neck],
    color: bodyPaint,
    shift: (t) => [0, -0.013 * Math.sin(Math.PI * Math.min(t * 1.1, 1))],
    sides: 12,
    name: "body",
  });

  // dorsal spikes down the back
  b.along(
    body,
    7,
    (at) => {
      const k = 1 - at.t * 0.5;
      b.spike(at, at, 0.03 * k, 0.012 * k, { color: SPIKE, sides: 5 });
    },
    { from: 0.3, to: 0.92 },
  );

  // ------------------------------------------------------------ tail
  const tailPts: number[][] = [
    [0, 0.046, -0.05],
    [0, 0.038, -0.098],
    [0.042, 0.03, -0.14],
    [0.1, 0.03, -0.142],
    [0.145, 0.04, -0.108],
    [0.152, 0.066, -0.072],
    [0.147, 0.1, -0.066],
  ];
  const tail = b.chain("tail", catmull(tailPts), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    count: 6,
  });
  const tailTube = b.sweep(tail, (t) => 0.04 * (1 - t) + 0.008, {
    color: paint((_p, n) => {
      if (n.y < -0.45) return mix(BELLY, MINT_L, 0.3);
      return SKIN;
    }),
    name: "tail",
    sides: 8,
  });
  b.along(
    tailTube,
    5,
    (at) => {
      const k = 1 - at.t * 0.7;
      b.spike(at, at, 0.026 * k, 0.01 * k, { color: SPIKE, sides: 5 });
    },
    { from: 0.08, to: 0.85 },
  );
  // spade at the tail tip
  {
    const T = tail.at(1).tangent.clone();
    const side = new THREE.Vector3(0.75, 0, 0.66).cross(T).normalize();
    const spade = b.extrude(
      [
        [0, 0],
        [0.02, 0.022],
        [0.048, 0.028, "sharp"],
        [0.076, 0],
        [0.048, -0.028, "sharp"],
        [0.02, -0.022],
      ],
      {
        at: tail.at(1).at,
        x: [T.x, T.y, T.z],
        y: [side.x, side.y, side.z],
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: paint((_p, _n, s) => (s[0] > 0.05 ? HORN_T : mix(SPIKE, "#ffb39a", s[0] / 0.05))),
        bone: tail.tip ?? tail.joints[tail.joints.length - 1],
        name: "tailSpade",
      },
    );
    void spade;
  }

  // ------------------------------------------------------------ legs and feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull(
        [
          [s * 0.05, 0.042, -0.004],
          [s * 0.078, 0.034, 0.05],
          [s * 0.066, 0.024, 0.1],
        ],
        { tension: 0.5 },
      ),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.034, 0.024], { color: SKIN, name: `leg${side}`, sides: 8 });
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
      bone: ankle,
      at: [s * 0.066, 0.02, 0.12],
      scale: [0.029, 0.02, 0.034],
      name: `foot${side}`,
    });
    // toes
    for (let i = 0; i < 3; i++) {
      const k = i - 1;
      const base: number[] = [s * (0.066 + k * 0.015), 0.017, 0.14];
      const tip: number[] = [s * (0.066 + k * 0.024), 0.0135, 0.163 - Math.abs(k) * 0.004];
      const toe = b.chain(`toe${i}${side}`, [base, tip], { parent: ankle, names: [`toe${i}${side}`], role: "digit" });
      b.sweep(toe, [0.0125, 0.01], { color: MINT, name: `toe${i}${side}`, sides: 6 });
      const tp = toe.at(1);
      b.spike(tp, tp, 0.014, 0.0065, { color: CLAW, sides: 5, name: `toeClaw${i}${side}` });
    }
    // foot pad decoration: little pale sole bumps
    b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, {
      bone: ankle,
      at: [s * 0.066, 0.0215, 0.136],
      scale: [0.016, 0.011, 0.007],
      name: `heelPad${side}`,
    });
  }

  // ------------------------------------------------------------ arms and hands
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull(
        [
          [s * 0.05, 0.138, 0.016],
          [s * 0.084, 0.092, 0.05],
          [s * 0.036, 0.112, 0.112],
        ],
        { tension: 0.5 },
      ),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, [0.018, 0.012], { color: SKIN, name: `arm${side}`, sides: 8 });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
      bone: arm.joints[0],
      at: [s * 0.054, 0.136, 0.014],
      scale: [0.023, 0.023, 0.023],
      name: `shoulderBall${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 9, 6), SKIN, {
      bone: wrist,
      at: [s * 0.036, 0.112, 0.12],
      scale: [0.02, 0.013, 0.018],
      name: `palm${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), CHEEK, {
      bone: wrist,
      at: [s * 0.036, 0.12, 0.123],
      scale: [0.012, 0.004, 0.011],
      name: `palmPad${side}`,
    });
    for (let i = 0; i < 3; i++) {
      const k = i - 1;
      const base: number[] = [s * (0.036 + k * 0.012), 0.113, 0.13];
      const tip: number[] = [s * (0.036 + k * 0.019), 0.115, 0.155 - Math.abs(k) * 0.004];
      const f = b.chain(`finger${i}${side}`, [base, tip], { parent: wrist, names: [`finger${i}${side}`], role: "digit" });
      b.sweep(f, [0.0085, 0.0065], { color: MINT, name: `finger${i}${side}`, sides: 6 });
      const fp = f.at(1);
      b.spike(fp, fp, 0.011, 0.0048, { color: CLAW, sides: 5, name: `fingerClaw${i}${side}` });
    }
  }

  // ------------------------------------------------------------ head
  const cranium = b.part(new THREE.SphereGeometry(1, 14, 10), mottle(MINT, MINT_L, { size: 0.05, contrast: 0.3, seed: 8 }), {
    bone: head,
    at: [0, 0.216, 0.02],
    scale: [0.064, 0.058, 0.062],
    name: "cranium",
  });
  for (const s of [1, -1]) {
    const cheek = b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, {
      bone: head,
      at: [s * 0.044, 0.186, 0.044],
      scale: [0.027, 0.022, 0.028],
      name: `cheek${s > 0 ? "L" : "R"}`,
    });
    const bh = b.surface(cheek).around(cheek.at).at(s * 38, -6);
    if (bh) b.decal(cheek, BLUSH, { at: bh, size: [0.022, 0.014], bone: head, lift: 0.0015, name: `blush${s > 0 ? "L" : "R"}` });
  }
  const snout = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: head,
    at: [0, 0.2, 0.074],
    scale: [0.03, 0.025, 0.036],
    name: "snout",
  });
  // lower jaw, drawn slightly open into a happy smile
  b.part(new THREE.SphereGeometry(1, 10, 7), "#b9e8b6", {
    bone: jaw,
    at: [0, 0.179, 0.07],
    scale: [0.026, 0.012, 0.033],
    rotation: [14, 0, 0],
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, {
    bone: jaw,
    at: [0, 0.182, 0.066],
    scale: [0.022, 0.009, 0.028],
    rotation: [14, 0, 0],
    name: "mouthInside",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), TONGUE, {
    bone: jaw,
    at: [0, 0.186, 0.076],
    scale: [0.013, 0.005, 0.018],
    rotation: [14, 0, 0],
    name: "tongue",
  });
  for (const s of [1, -1]) {
    b.spike([s * 0.013, 0.185, 0.094], [0, -1, 0.1], 0.012, 0.0045, { bone: head, color: TOOTH, sides: 5, name: `fang${s > 0 ? "L" : "R"}` });
    b.spike([s * 0.008, 0.18, 0.1], [0, 1, 0.2], 0.008, 0.0035, { bone: jaw, color: TOOTH, sides: 5, name: `lowerTooth${s > 0 ? "L" : "R"}` });
  }
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: [s * 0.011, 0.206, 0.106],
      scale: [0.0045, 0.0035, 0.004],
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }
  // eyes (decals) and brows
  const skull = b.surface(cranium);
  for (const s of [1, -1]) {
    const hit = skull.around(cranium.at).at(s * 40, 2);
    if (hit) {
      b.decal(cranium, EYE, { at: hit, size: [0.04, 0.052], mirror: s > 0, lift: 0.001, bone: head, name: `eye${s > 0 ? "L" : "R"}` });
    }
    // (blush decals sit on the cheek balls)
    b.capsule([s * 0.021, 0.246, 0.071], [s * 0.044, 0.243, 0.059], 0.003, { bone: head, color: MINT_D, name: `brow${s > 0 ? "L" : "R"}` });
    // snout freckles
    for (let i = 0; i < 3; i++) {
      const fh = b.surface(snout).around(snout.at).at(s * (18 + i * 14), 40 + i * 6);
      if (fh) b.stick(new THREE.SphereGeometry(0.0034, 5, 4), MINT_D, fh, { bone: head, embed: 0.5 });
    }
  }
  // whiskers
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.03, 0.196, 0.1], [s * 0.056, 0.19, 0.112], [s * 0.086, 0.2, 0.1], [s * 0.094, 0.224, 0.078]),
      [0.0023, 0.0007],
      { bone: head, color: HORN_C, name: `whisker${s > 0 ? "L" : "R"}`, sides: 4, caps: { start: "flat", end: "point" } },
    );
  }
  // horns
  for (const s of [1, -1]) {
    const horn = b.sweep(
      bezier([s * 0.028, 0.262, 0.012], [s * 0.046, 0.29, -0.004], [s * 0.048, 0.306, -0.034]),
      [0.0165, 0],
      {
        bone: head,
        color: paint((_p, _n, st) => (st[0] > 0.72 ? HORN_T : Math.floor(st[0] * 9) % 2 === 0 ? HORN_C : mix(HORN_C, HORN_T, 0.35))),
        caps: { start: "flat", end: "point" },
        sides: 7,
        name: `horn${s > 0 ? "L" : "R"}`,
      },
    );
    void horn;
    // ear fins
    const ear = b.extrude(
      [
        [0, 0],
        [0.014, 0.016],
        [0.034, 0.026],
        [0.046, 0.044, "sharp"],
        [0.05, 0.016],
        [0.036, -0.006],
        [0.016, -0.008],
      ],
      {
        at: [s * 0.056, 0.212, 0.012],
        x: [s, 0.35, -0.55],
        y: [-s * 0.2, 1, 0.1],
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 1,
        color: paint((_p, _n, st) => {
          const dx = (st[0] - 0.026) / 0.018;
          const dy = (st[1] - 0.016) / 0.014;
          return dx * dx + dy * dy < 1 ? "#ffa3b8" : MINT;
        }),
        bone: head,
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
    void ear;
  }
  // forehead freckles
  for (const [az, el] of [
    [0, 64],
    [-24, 58],
    [24, 58],
    [-10, 48],
    [10, 48],
  ]) {
    const fh = skull.around(cranium.at).at(az, el);
    if (fh) b.stick(new THREE.SphereGeometry(0.0042, 6, 4), MINT_D, fh, { bone: head, embed: 0.55, name: "freckle" });
  }
  // crown crest
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.18;
    b.spike([0, 0.268 - i * 0.01, 0.034 - i * 0.026], [0, 1, -0.45 - i * 0.2], 0.026 * k, 0.011 * k, {
      bone: head,
      color: SPIKE,
      sides: 5,
      name: `crest${i}`,
    });
  }

  // ------------------------------------------------------------ wings
  const WING = paint((_p, _n, st) => {
    const edge = Math.min(st[1], 1 - st[1]);
    if (edge < 0.05) return mix(WING_A, "#c8466d", 0.5);
    const t = Math.min(st[0] * 1.15, 1);
    const dot = st[0] > 0.7 && st[0] < 0.8 && Math.abs(((st[1] * 6) % 1) - 0.5) < 0.16;
    if (dot) return "#fff0c8";
    return mix(WING_A, WING_B, t);
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S: number[] = [s * 0.036, 0.152, -0.044];
    const W: number[] = [s * 0.104, 0.206, -0.07];
    const wingArm = b.chain(`wingArm${side}`, [S, W], {
      parent: spine.joints[1],
      names: [`wingShoulder${side}`, `wingWrist${side}`],
      role: "wing",
    });
    b.sweep(wingArm, [0.0105, 0.0075], { color: WING_BONE, name: `wingArm${side}`, sides: 6 });
    const wrist = wingArm.tip ?? wingArm.joints[wingArm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 7, 5), WING_BONE, { bone: wrist, at: W, scale: [0.012, 0.012, 0.012], name: `wingKnuckle${side}` });
    const fingerDefs: number[][][] = [
      [W, [s * 0.128, 0.246, -0.082], [s * 0.15, 0.284, -0.098]],
      [W, [s * 0.162, 0.218, -0.098], [s * 0.202, 0.226, -0.124]],
      [W, [s * 0.146, 0.172, -0.1], [s * 0.178, 0.134, -0.124]],
    ];
    const fingers = fingerDefs.map((pts, i) => {
      const f = b.chain(`wingFinger${i}${side}`, catmull(pts), {
        parent: wrist,
        names: [`wingFinger${i}${side}a`, `wingFinger${i}${side}b`],
        role: "digit",
        count: 2,
      });
      b.sweep(f, [0.0062, 0.0028], { color: WING_BONE, name: `wingFinger${i}${side}`, sides: 5 });
      return f;
    });
    // claws on the top finger and wrist thumb
    b.spike(wingArm.at(1), [s * 0.2, 0.7, 0.1], 0.02, 0.006, { color: CLAW, sides: 5, bone: wrist, name: `wingThumb${side}` });
    const wf = fingers[0].at(1);
    b.spike(wf, wf, 0.012, 0.004, { color: CLAW, sides: 5, name: `wingClaw${side}` });
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.004, scallop: 0.18, name: `wingMem0${side}` });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.004, scallop: 0.18, name: `wingMem1${side}` });
    b.membrane(
      fingers[2],
      polyline([W, [s * 0.098, 0.14, -0.075], [s * 0.046, 0.092, -0.05]]),
      { color: WING, thickness: 0.004, scallop: 0.12, bone: wrist, name: `wingMem2${side}` },
    );
  }

  // ------------------------------------------------------------ scarf
  {
    const bodySurf = b.surface(body);
    const loopPath = bodySurf.loop(frame([0, 0.152, 0], [0, 1, 0]), { lift: 0.006 });
    b.sweep(loopPath, 0.0125, {
      name: "scarf",
      color: paint((p) => (Math.floor((Math.atan2(p.x, p.z) + Math.PI) / (Math.PI / 9)) % 2 === 0 ? SCARF_R : SCARF_C)),
      sides: 8,
    });
    // knot at the model's left, tails hanging down the belly
    const kHit = bodySurf.nearest([0.044, 0.152, 0.03]);
    b.part(new THREE.SphereGeometry(1, 8, 6), SCARF_R, {
      bone: spine.joints[1],
      at: kHit.moved([0, 0.01, 0]).at,
      scale: [0.02, 0.018, 0.018],
      name: "scarfKnot",
    });
    const bp = kHit.moved([0, 0.02, 0]).at.clone().add(new THREE.Vector3(0.002, -0.017, 0.006));
    b.part(new THREE.SphereGeometry(1, 8, 6), COIN, { bone: spine.joints[1], at: [bp.x, bp.y, bp.z], scale: [0.0085, 0.0085, 0.0085], name: "bell" });
    b.part(new THREE.SphereGeometry(1, 6, 4), COIN_D, {
      bone: spine.joints[1],
      at: [bp.x, bp.y - 0.0025, bp.z + 0.0072],
      scale: [0.0055, 0.0011, 0.0022],
      name: "bellSlit",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), COIN_D, {
      bone: spine.joints[1],
      at: [bp.x, bp.y + 0.0085, bp.z],
      scale: [0.0028, 0.0028, 0.0028],
      name: "bellEyelet",
    });
    const topHit = bodySurf.ray([0.038, 0.14, 0.2], [0, 0, -1]);
    const lowHit = bodySurf.ray([0.038, 0.085, 0.2], [0, 0, -1]);
    if (topHit && lowHit) {
      const dir = new THREE.Vector3().subVectors(topHit.at, lowHit.at).normalize();
      const tailPaint = paint((_p, _n, st) => (Math.floor((st[1] + 1) / 0.013) % 2 === 0 ? SCARF_R : SCARF_C));
      // each hanging end: a flat striped strip with a fringe of little cream tassels
      const hang = (hit: Frame, shift: number, len: number, name: string) => {
        const at = hit.moved([0, 0.011, 0]).at.clone();
        const x = new THREE.Vector3(1, 0, shift);
        b.extrude(
          [
            [-0.011, 0],
            [0.011, 0],
            [0.012, -len],
            [-0.012, -len],
          ],
          {
            at,
            x: [x.x, x.y, x.z],
            y: [dir.x + shift * 2, dir.y, dir.z],
            thickness: 0.006,
            color: tailPaint,
            bone: spine.joints[1],
            name,
          },
        );
        const yv = new THREE.Vector3(dir.x + shift * 2, dir.y, dir.z).normalize();
        for (let i = 0; i < 5; i++) {
          const u = (i - 2) * 0.0052;
          const base = at.clone().addScaledVector(x.clone().normalize(), u).addScaledVector(yv, -len + 0.001);
          const end = base.clone().addScaledVector(yv, -0.017).addScaledVector(new THREE.Vector3(0, 0, 1), 0.002);
          b.rod(base, end, [0.0017, 0.0012], { bone: spine.joints[1], color: i % 2 ? SCARF_C : SCARF_R, sides: 4, name: `${name}Fringe` });
        }
      };
      hang(topHit, 0, 0.07, "scarfTail");
      const topHit2 = bodySurf.ray([0.058, 0.14, 0.2], [0, 0, -1]);
      if (topHit2) hang(topHit2, 0.1, 0.045, "scarfTail2");
    }
  }

  // ------------------------------------------------------------ little flame between the hands
  {
    const bone = spine.joints[1];
    const FLAME = svg(
      `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 1 C22 13 37 23 37 41 C37 53 29 59 20 59 C11 59 3 53 3 41 C3 29 12 24 13 13 C16 17 18 13 20 1 Z" fill="#ff8a14"/>
  <path d="M20 17 C22 27 31 34 31 44 C31 53 26 58 20 58 C14 58 9 53 9 44 C9 36 18 30 20 17 Z" fill="#ffd12e"/>
  <path d="M20 33 C22 39 26 43 26 48 C26 54 23 57 20 57 C17 57 14 54 14 48 C14 43 18 39 20 33 Z" fill="#fff7cc"/>
</svg>`,
      { size: 128 },
    );
    glow(
      b.cards([frame([0, 0.12, 0.135], [0, 1, 0])], FLAME, {
        size: [0.036, 0.054],
        lean: 0,
        flow: [0, 0, 1],
        cross: true,
        bone,
        sink: 0,
        name: "flame",
      }),
      1.5,
    );
    // floating sparks
    const sparkFrames = [
      [0.022, 0.172, 0.14],
      [-0.024, 0.19, 0.128],
      [0.004, 0.206, 0.15],
    ].map((p) => frame(p, [0, 0, 1]));
    glow(b.cards(sparkFrames, SPARK, { size: 0.014, lean: 0, flow: [0, 0, 1], bone, sink: 0, name: "sparks" }), 1.5);
  }

  // ------------------------------------------------------------ treasure, gem, daisy, grass
  {
    // coin pile to the model's right
    const coinAt: Array<[number, number, number, number]> = [
      [-0.135, 0.0, 0.07, 0],
      [-0.152, 0.0, 0.092, 0.5],
      [-0.122, 0.0, 0.102, 1.1],
      [-0.136, 0.0041, 0.08, 0.3],
      [-0.145, 0.0041, 0.099, 1.6],
      [-0.138, 0.0082, 0.087, 0.8],
    ];
    for (const [x, y, z, rot] of coinAt) {
      const g = new THREE.CylinderGeometry(0.0215, 0.0215, 0.004, 14);
      b.part(g, COIN_D, { bone: props, at: [x, y + 0.002, z], rotation: [0, rot * 57, 0], name: "coin" });
      b.part(new THREE.CircleGeometry(0.0185, 14), "#ffffff", {
        bone: props,
        at: [x, y + 0.0042, z],
        dir: [0, 1, 0],
        axis: "z",
        texture: COIN_FACE,
        name: "coinFace",
      });
    }
    // a coin leaning on the pile
    b.part(new THREE.CylinderGeometry(0.0215, 0.0215, 0.004, 14), COIN, {
      bone: props,
      at: [-0.113, 0.019, 0.07],
      rotation: [0, 0, 70],
      name: "coinLean",
    });
    b.part(new THREE.CircleGeometry(0.0185, 14), "#ffffff", {
      bone: props,
      at: [-0.1108, 0.0192, 0.07],
      dir: [1, 0.35, 0],
      axis: "z",
      texture: COIN_FACE,
      name: "coinLeanFace",
    });
    // gem
    glow(
      b.part(new THREE.OctahedronGeometry(0.017, 0), GEM, {
        bone: props,
        at: [-0.14, 0.0235, 0.087],
        scale: [1, 1.35, 1],
        rotation: [0, 20, 0],
        flat: true,
        name: "gem",
      }),
      0.9,
    );
    // daisy near the model's left foot
    const stem = b.sweep(
      bezier([0.135, 0.0, 0.128], [0.15, 0.04, 0.128], [0.142, 0.075, 0.13]),
      [0.0028, 0.0022],
      { bone: props, color: STEM, sides: 5, name: "stem" },
    );
    void stem;
    const top = [0.142, 0.077, 0.13];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(1, 6, 4), DAISY, {
        bone: props,
        at: [top[0] + Math.cos(a) * 0.013, top[1] + Math.sin(a) * 0.013, top[2] + 0.002],
        scale: [0.0085, 0.0035, 0.0028],
        rotation: [0, 0, (a * 180) / Math.PI],
        name: "petal",
      });
    }
    b.part(new THREE.SphereGeometry(0.0072, 7, 5), DAISY_C, { bone: props, at: [top[0], top[1], top[2] + 0.004], name: "daisyCentre" });
    b.part(new THREE.SphereGeometry(1, 6, 4), GRASS_D, { bone: props, at: [0.135, 0.001, 0.128], scale: [0.012, 0.004, 0.012], name: "daisyBase" });

    // grass tufts (cards)
    const clumps: Array<[number, number]> = [
      [0.145, 0.128],
      [-0.095, 0.14],
      [0.115, -0.04],
      [-0.11, -0.06],
      [0.03, -0.17],
      [-0.07, 0.2],
      [0.12, 0.18],
    ];
    const blades: Spot[] = [];
    for (const [cx, cz] of clumps) {
      for (let i = 0; i < 6; i++) {
        blades.push(frame([cx + (R() - 0.5) * 0.03, 0, cz + (R() - 0.5) * 0.03], [(R() - 0.5) * 0.3, 1, (R() - 0.5) * 0.3]));
      }
    }
    b.cards(blades, BLADE, {
      size: [0.013, 0.04],
      vary: 0.35,
      spin: 180,
      rng: R,
      lean: 12,
      bend: 18,
      color: paint((p) => mix(GRASS_D, GRASS, noise(p, 0.05, 2))),
      bone: props,
      name: "grass",
    });
    // sparkles of gold dust near coins
    glow(
      b.cards(
        [
          frame([-0.12, 0.04, 0.07], [0, 0, 1]),
          frame([-0.158, 0.05, 0.105], [0, 0, 1]),
          frame([-0.105, 0.062, 0.095], [0, 0, 1]),
        ],
        SPARK,
        { size: 0.016, lean: 0, flow: [0, 0, 1], bone: props, sink: 0, name: "coinSparks" },
      ),
      1.3,
    );
  }

  // ------------------------------------------------------------ mushrooms, pebbles, a puff of smoke
  {
    const shrooms: Array<[number, number, number]> = [
      [-0.2, -0.015, 1],
      [-0.224, 0.025, 0.62],
      [0.2, -0.07, 0.8],
    ];
    for (const [mx, mz, k] of shrooms) {
      b.part(new THREE.CylinderGeometry(0.0075 * k, 0.0105 * k, 0.03 * k, 8), SCARF_C, {
        bone: props,
        at: [mx, 0.015 * k - 0.001, mz],
        name: "stalk",
      });
      b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), SCARF_R, {
        bone: props,
        at: [mx, 0.028 * k, mz],
        scale: [0.024 * k, 0.017 * k, 0.024 * k],
        name: "cap",
      });
      b.part(new THREE.CircleGeometry(1, 10), BELLY_B, {
        bone: props,
        at: [mx, 0.0285 * k, mz],
        dir: [0, -1, 0],
        axis: "z",
        scale: [0.0235 * k, 0.0235 * k, 1],
        name: "gills",
      });
      for (let i = 0; i < 5; i++) {
        const a = i * 2.4 + mx * 40;
        const el = i === 0 ? 1.45 : 0.8 + (i % 2) * 0.25;
        const rx = Math.cos(a) * Math.cos(el);
        const rz = Math.sin(a) * Math.cos(el);
        const ry = Math.sin(el);
        b.part(new THREE.SphereGeometry(1, 6, 4), SCARF_C, {
          bone: props,
          at: [mx + rx * 0.0235 * k, 0.028 * k + ry * 0.0165 * k, mz + rz * 0.0235 * k],
          scale: [0.0055 * k, 0.0022 * k, 0.0055 * k],
          dir: [rx / 0.0235, ry / 0.0165, rz / 0.0235],
          axis: "y",
          name: "capDot",
        });
      }
    }
    const pebbles: Array<[number, number, number, number]> = [
      [0.17, 0.06, 0.016, 10],
      [0.185, 0.045, 0.01, 50],
      [-0.18, -0.03, 0.013, 80],
      [0.04, 0.2, 0.011, 120],
      [-0.03, -0.19, 0.014, 20],
    ];
    for (const [px, pz, pr, rot] of pebbles) {
      b.part(new THREE.DodecahedronGeometry(pr, 0), px > 0 ? STONE : STONE_D, {
        bone: props,
        at: [px, pr * 0.55, pz],
        scale: [1.25, 0.75, 1],
        rotation: [0, rot, 0],
        flat: true,
        name: "pebble",
      });
    }
  }

  void gradient;
  void spots;
  void (undefined as ColorInput | undefined);
  return b.root;
}

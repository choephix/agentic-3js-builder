// Qilin: a scaled, hooved chimera with a dragon face, branching antlers and a drifting cloud mane.
// High-fantasy anime: jade-and-gold cel-shaded scales, cream belly, pastel cloud mane, glowing gems and runes.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { gradient, mottle, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Qilin, the scaled hooved chimera: jade gilded scales, cream belly, cloven hooves, branching antlers tipped with glowing crystals, a dragon face with drifting whiskers and a pastel cloud mane, ribbons and a gem collar.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel paints are free: they bake into the paint sheet)

const GOLD = cel("#f8c745", "#d9881c");
const GOLD_PALE = cel("#ffe795", "#e8b955");
const HOOF = cel("#4a3478", "#2b1d4f");
const PINK_IN = cel("#ff9db8", "#e0698f");
const IVORY = cel("#fff7e4", "#e6cfa5");
const CLOUD = [
  cel("#fbfcff", "#b4bff0"),
  cel("#ffd4e8", "#e48fc2"),
  cel("#c9edff", "#82a6e6"),
  cel("#fff0c4", "#efc487"),
];
const GEM_RED = "#ff4f78";
const GEM_CYAN = "#7bf6ff";
const GEM_JADE = "#5dffc4";
const NOSTRIL = "#1b3a46";

const JADE_FACE = mottle("#2ec6a3", "#1f9aa4", { size: 0.45, seed: 4, contrast: 1.2 });
const JADE_SCALES = scales(JADE_FACE, "#f2d078", { size: 0.07, width: 0.15, seed: 11 });
const CREAM_SCALES = scales(["#fff3d6", "#ffe9bd"], "#e9c46a", { size: 0.07, width: 0.14, seed: 12 });
const COAT = cel(furEdge(JADE_SCALES, CREAM_SCALES, { level: -0.3, teeth: 0.2, period: 0.05, ink: "#1a7a6c" }));
const TAILP = cel(JADE_SCALES);

const HEAD_SCALES = scales(mottle("#33cdaa", "#1f9ca8", { size: 0.2, seed: 8 }), "#f2d078", {
  size: 0.04,
  width: 0.16,
  seed: 5,
});
const HEAD_CREAM = scales(["#fff3d6"], "#e9c46a", { size: 0.04, width: 0.16, seed: 6 });
const HEADP = cel(furEdge(HEAD_SCALES, HEAD_CREAM, { level: -0.35, teeth: 0.15, period: 0.03, ink: "#1a7a6c" }));
const GOLD_SCALES = cel(scales(["#f8c745", "#f0b53a"], "#a8650f", { size: 0.04, width: 0.14, seed: 21 }));
const LEGP = cel(
  furEdge(JADE_SCALES, GOLD_SCALES, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.42,
    teeth: 0.035,
    period: 0.04,
    along: [1, 0, 1],
    ink: "#8a4f0c",
  }),
);
const RIBBON = cel(paint((_p, _n, s) => (Math.abs(((s[0] * 14) % 1) - 0.5) < 0.06 ? "#ffd75a" : "#e8365d")));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

// A cloud wisp: a lumpy tapering stem that curls into a spiral, cel-shaded and inked. Root at the bottom edge.
function wisp(base: string, shade: string, light: string, ink: string) {
  const pts: { x: number; y: number; r: number }[] = [];
  const N = 44;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    let x: number;
    let y: number;
    let r: number;
    if (k < 0.4) {
      const u = k / 0.4;
      x = 30 - 3 * Math.sin(u * Math.PI);
      y = 118 - u * 74;
      r = 5 + 3 * u;
    } else {
      const kk = (k - 0.4) / 0.6;
      const th = Math.PI + kk * Math.PI * 1.85;
      const R = 16 * (1 - 0.7 * kk);
      x = 46 + R * Math.cos(th);
      y = 44 + R * Math.sin(th);
      r = 8 - 5.5 * kk;
    }
    r *= 1 + 0.13 * Math.sin(i * 1.9);
    pts.push({ x, y, r });
  }
  const f = (n: number) => n.toFixed(1);
  const ring = pts.map((p) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r + 2.6)}" fill="${ink}"/>`).join("");
  const body = pts.map((p) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r)}" fill="${shade}"/>`).join("");
  const lit = pts
    .map((p) => `<circle cx="${f(p.x - 1.6)}" cy="${f(p.y - 2)}" r="${f(p.r * 0.78)}" fill="${base}"/>`)
    .join("");
  const hi = pts
    .filter((_, i) => i % 3 === 0)
    .map((p) => `<circle cx="${f(p.x - 3)}" cy="${f(p.y - 3.4)}" r="${f(p.r * 0.34)}" fill="${light}"/>`)
    .join("");
  return svg(`<svg viewBox="0 0 80 120">${ring}${body}${lit}${hi}</svg>`, { size: 256 });
}

const WISPS = [
  wisp("#fbfcff", "#b4bff0", "#ffffff", "#4a3a86"),
  wisp("#ffd4e8", "#e48fc2", "#fff0f7", "#6b2f78"),
  wisp("#c9edff", "#82a6e6", "#f2fbff", "#3a4f96"),
  wisp("#fff0c4", "#efc487", "#fffbe6", "#7a4a1a"),
];

// A hanging tassel. Drawn knot-at-the-bottom because a hanging card shows its drawing upside down.
const TASSEL = svg(
  `<svg viewBox="0 0 32 72">
  <path d="M11 58 L3 10 Q16 0 29 10 L21 58 Z" fill="#e8365d" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M14 56 L9 14 M18 56 L18 8 M22 56 L26 14" stroke="#ff8aa5" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M5 22 Q16 28 27 22" stroke="#ffd75a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="12" y="54" width="8" height="7" fill="#f8c745" stroke="${INK}" stroke-width="2"/>
  <circle cx="16" cy="66" r="5.5" fill="#f8c745" stroke="${INK}" stroke-width="2.4"/>
  <circle cx="14.4" cy="64.4" r="1.8" fill="#fff3b0"/>
  </svg>`,
  { size: 192 },
);

// A glowing auspicious-cloud scroll for the flanks.
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="none" stroke="#ffe9a0" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 74 C30 74 17 58 23 43 C28 31 45 29 50 39 C54 47 46 53 41 49"/>
    <path d="M50 74 C70 74 83 58 77 43 C72 31 55 29 50 39 C46 47 54 53 59 49"/>
    <path d="M50 74 L50 88"/>
    <path d="M30 88 Q50 80 70 88"/>
    <path d="M22 22 C28 14 38 12 44 16"/>
    <path d="M78 22 C72 14 62 12 56 16"/>
  </g>
  <circle cx="50" cy="22" r="4.4" fill="#ffe9a0"/>
  <circle cx="14" cy="64" r="3.2" fill="#ffe9a0"/>
  <circle cx="86" cy="64" r="3.2" fill="#ffe9a0"/>
  </svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#ffae2b", irisLight: "#fff0a0" });

// Leaf outlines for ears.
const EAR: OutlinePoint[] = [
  [-0.032, 0],
  [-0.048, 0.07],
  [-0.03, 0.15],
  [0, 0.215, "sharp"],
  [0.03, 0.14],
  [0.046, 0.065],
  [0.03, 0],
];
const EAR_IN: OutlinePoint[] = [
  [-0.018, 0.015],
  [-0.028, 0.07],
  [-0.014, 0.14],
  [0, 0.18, "sharp"],
  [0.014, 0.135],
  [0.026, 0.065],
  [0.018, 0.015],
];
const CHEEK: OutlinePoint[] = [
  [0, 0.02],
  [-0.05, 0.05],
  [-0.14, 0.075, "sharp"],
  [-0.075, 0.0],
  [-0.15, -0.04, "sharp"],
  [-0.06, -0.05],
  [-0.1, -0.1, "sharp"],
  [0.0, -0.06],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const rand = rng(17);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sphere = new THREE.SphereGeometry(1, 9, 6);

  // ---- Skeleton -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.15, -0.48] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.15, -0.48],
      [0, 1.17, -0.12],
      [0, 1.2, 0.26],
      [0, 1.24, 0.56],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.24, 0.56],
      [0, 1.42, 0.74],
      [0, 1.68, 0.9],
      [0, 1.94, 1.02],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.94, 1.02],
    dir: [0, -0.375, 0.927],
    role: "head",
  });
  const h = b.region({
    at: [0, 1.94, 1.02],
    quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 22 * DEG),
    bone: head,
  });
  const hp = (x: number, y: number, z: number) => h.p([x, y, z]);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.09, 0.06), aim: hp(0, -0.155, 0.5), role: "jaw" });

  // ---- Torso and neck ---------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 1.12, -0.76], w: 0.26, h: 0.3 },
      { at: [0, 1.1, -0.5], w: 0.4, h: 0.46 },
      { at: [0, 1.07, -0.1], w: 0.36, h: 0.44 },
      { at: [0, 1.04, 0.3], w: 0.4, h: 0.56 },
      { at: [0, 1.07, 0.58], w: 0.36, h: 0.54 },
      { at: [0, 1.12, 0.78], w: 0.26, h: 0.38 },
    ],
    { bone: [hips, spine], color: COAT, name: "body" },
  );
  const neckS = b.sweep(neck, (t) => 0.165 - 0.075 * t, { color: COAT, name: "neck", sides: 10 });
  const skinBody = b.surface([body, neckS]);

  // ---- Legs ---------------------------------------------------------------------------------------------------
  const foreR = [0.1, 0.088, 0.064, 0.05, 0.036, 0.034, 0.042, 0.036];
  const hindR = [0.125, 0.105, 0.072, 0.05, 0.036, 0.032, 0.04, 0.034];
  const legSweeps: Record<string, { chain: ReturnType<typeof b.chain>; sweep: ReturnType<typeof b.sweep> }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.16;
    const fpts = limb([x, 1.0, 0.52], [x, 0.075, 0.6], [0.36, 0.38, 0.3, 0.12], [[0, 0, -1], [0, 0, 1], [0, 0, -1]]);
    const fore = b.chain("legF" + side, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `knee${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg",
      contact: [x, 0, 0.6],
    });
    const hx = s * 0.17;
    const hpts = limb([hx, 1.0, -0.5], [hx, 0.075, -0.68], [0.4, 0.4, 0.34, 0.14], [[0, 0, 1], [0, 0, -1], [0, 0, 1]]);
    const hind = b.chain("legH" + side, hpts, {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
      role: "leg",
      contact: [hx, 0, -0.68],
    });
    for (const [key, chain, radii, fz, front] of [
      ["F" + side, fore, foreR, 0.6, true],
      ["H" + side, hind, hindR, -0.68, false],
    ] as const) {
      const sweep = b.sweep(chain, radii, { color: LEGP, name: "leg" + key, sides: 9 });
      legSweeps[key] = { chain, sweep };
      const lx = front ? x : hx;
      const hoofJ = chain.tip!;
      // cloven hooves
      for (const k of [1, -1]) {
        b.frustumBox(
          [lx + k * 0.027, 0.09, fz + 0.004],
          [lx + k * 0.03, 0, fz + 0.016],
          [0.05, 0.09],
          [0.056, 0.105],
          { bone: hoofJ, color: HOOF },
        );
        b.part(new THREE.ConeGeometry(0.014, 0.05, 4), GOLD_PALE, {
          bone: hoofJ,
          at: [lx + k * 0.027, 0.108, fz - 0.03],
          rotation: [-50, 45, 0],
          scale: [1, 1, 0.8],
        });
      }
      // dewclaw
      b.spike(
        chain.joints[3].at.clone().add(V(0, 0, -0.03)),
        V(0, -0.5, -1),
        0.07,
        0.014,
        { color: GOLD_PALE, bone: chain.joints[3] },
      );
      // gilt bands on the cannon and above the knee
      const skinLeg = b.surface(sweep);
      for (const t of [0.62, 0.8]) {
        const at = chain.at(t);
        b.sweep(skinLeg.loop(at, { lift: 0.006 }), 0.011, { color: GOLD, sides: 6 });
      }
      b.sweep(skinLeg.loop(chain.at(0.5), { lift: 0.008 }), 0.016, { color: GOLD_PALE, sides: 6 });
      // fetlock cloud tuft
      const tuft = b.ring(chain.joints[3], { count: 6, radius: 0.03, tilt: 45 });
      b.cards(tuft.items, WISPS, {
        size: [0.085, 0.17],
        lean: 55,
        bend: 40,
        vary: 0.25,
        rng: rand,
        cross: true,
      });
      // a puff behind the knee/hock
      const joint = chain.joints[2];
      const back = front ? -1 : -1;
      b.part(sphere, CLOUD[(front ? 0 : 2) + (s > 0 ? 0 : 1)], {
        bone: joint,
        at: joint.at.clone().add(V(0, 0.03, 0.05 * back)),
        scale: [0.055, 0.07, 0.065],
      });
    }
  }

  // ---- Tail ------------------------------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.18, -0.62],
      [0, 1.28, -0.98],
      [0, 1.28, -1.38],
      [0, 1.12, -1.72],
      [0, 0.92, -1.88],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  const tailS = b.sweep(tail, (t) => 0.065 * (1 - t) + 0.024, { color: TAILP, name: "tail", sides: 8 });
  const tailFrames: Frame[] = [];
  for (const [t, ang] of [
    [0.4, 0],
    [0.5, 70],
    [0.5, -70],
    [0.6, 0],
    [0.68, 70],
    [0.68, -70],
    [0.78, 0],
    [0.86, 60],
    [0.86, -60],
    [0.94, 0],
  ] as const)
    tailFrames.push(tailS.at(t, ang));
  b.cards(tailFrames, WISPS, {
    size: [0.2, 0.4],
    lean: 62,
    flow: [0, -0.5, -1],
    bend: 35,
    vary: 0.25,
    rng: rand,
    cross: true,
  });
  const tailEnd = tailS.at(1);
  const tailRing = b.ring(tail.at(1), { count: 7, radius: 0.03, tilt: 35 });
  b.cards(tailRing.items, [WISPS[0], WISPS[1], WISPS[2]], {
    size: [0.2, 0.5],
    lean: 40,
    bend: 40,
    vary: 0.2,
    rng: rand,
    cross: true,
  });
  for (const [dx, dy, dz, r, c] of [
    [0, 0.0, 0.0, 0.1, 0],
    [0.06, 0.04, 0.05, 0.075, 1],
    [-0.06, 0.03, 0.04, 0.07, 2],
    [0, 0.08, 0.08, 0.06, 3],
  ] as const)
    b.stick(sphere, CLOUD[c], tailEnd.moved([dx, dy, dz]), { embed: 0.2, scale: [r, r * 0.85, r] });
  // gilt rings on the tail
  const skinTail = b.surface(tailS);
  for (const t of [0.22, 0.38])
    b.sweep(skinTail.loop(tail.at(t), { lift: 0.006 }), 0.012, { color: GOLD, sides: 6 });

  // ---- Head ------------------------------------------------------------------------------------------------------
  const cranium = b.part(new THREE.SphereGeometry(1, 14, 9), HEADP, {
    bone: head,
    at: hp(0, -0.01, 0.1),
    quat: h.q(),
    scale: [0.105, 0.1, 0.14],
    name: "cranium",
  });
  const snout = b.loft(
    [
      { at: hp(0, -0.02, 0.12), w: 0.19, h: 0.18 },
      { at: hp(0, -0.045, 0.28), w: 0.15, h: 0.13 },
      { at: hp(0, -0.075, 0.44), w: 0.135, h: 0.105 },
      { at: hp(0, -0.085, 0.54), w: 0.15, h: 0.1 },
    ],
    { bone: head, color: HEADP, name: "snout" },
  );
  b.loft(
    [
      { at: hp(0, -0.1, 0.08), w: 0.12, h: 0.07 },
      { at: hp(0, -0.14, 0.26), w: 0.115, h: 0.055 },
      { at: hp(0, -0.155, 0.46), w: 0.105, h: 0.045 },
      { at: hp(0, -0.155, 0.52), w: 0.1, h: 0.045 },
    ],
    { bone: jaw, color: cel(HEAD_CREAM), name: "lowerJaw" },
  );
  const skull = b.surface([cranium, snout]);

  // eyes
  for (const s of [1, -1]) {
    const hit = skull.nearest(hp(s * 0.078, 0.012, 0.17));
    b.decal(skull, EYE, {
      at: hit,
      dir: h.d([s * 0.55, 0.1, 0.85]),
      up: h.d([0, 1, 0]),
      size: [0.085, 0.116],
      mirror: s > 0,
      bone: head,
    });
  }

  // forehead gem and crest
  b.extrude(
    [
      [0, -0.05],
      [0.03, 0],
      [0, 0.06],
      [-0.03, 0],
    ],
    { at: hp(0, 0.07, 0.2), x: h.d([1, 0, 0]), y: h.d([0, 1, 0.3]), thickness: 0.012, color: GOLD, bone: head },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), GEM_RED, {
      bone: head,
      at: hp(0, 0.083, 0.222),
      quat: h.q(),
      scale: [0.8, 1.35, 0.7],
      flat: true,
    }),
    1.2,
  );
  b.spike(hp(0, 0.05, 0.1), h.d([0, 0.35, -1]), 0.12, 0.022, { color: GOLD, bone: head });

  // nostrils, nose pads and muzzle bumps
  for (const s of [1, -1]) {
    b.part(sphere, NOSTRIL, { bone: head, at: hp(s * 0.04, -0.07, 0.585), quat: h.q(), scale: [0.016, 0.013, 0.02] });
    b.part(sphere, GOLD, { bone: head, at: hp(s * 0.072, -0.095, 0.44), quat: h.q(), scale: [0.026, 0.022, 0.03] });
    // brow ridge and spikes
    b.rod(hp(s * 0.03, 0.065, 0.2), hp(s * 0.11, 0.062, 0.11), [0.02, 0.012], { color: GOLD, bone: head, sides: 6 });
    b.spike(hp(s * 0.11, 0.06, 0.1), h.d([s * 0.7, 0.35, -0.8]), 0.07, 0.014, { color: GOLD, bone: head });
    b.spike(hp(s * 0.1, 0.045, 0.14), h.d([s * 0.8, 0.4, -0.2]), 0.05, 0.011, { color: GOLD_PALE, bone: head });
    // cheek plates
    const cheek = b.extrude(CHEEK, {
      at: hp(s * 0.1, -0.05, 0.03),
      x: h.d([0, 0, -1]),
      y: h.d([s * 0.25, 1, 0]),
      thickness: 0.012,
      bevel: 0.003,
      color: s > 0 ? GOLD : GOLD,
      bone: head,
    });
    b.stick(sphere, GEM_JADE, cheek.moved(cheek.local([-0.05, 0.02, 0.012])), { scale: 0.011, bone: head });
    // fangs
    b.spike(hp(s * 0.052, -0.118, 0.47), h.d([0, -1, 0.15]), 0.034, 0.009, { color: IVORY, bone: head });
    b.spike(hp(s * 0.04, -0.12, 0.34), h.d([0, -1, 0.1]), 0.022, 0.007, { color: IVORY, bone: head });
    b.spike(hp(s * 0.044, -0.133, 0.5), h.d([0, 1, 0.2]), 0.022, 0.007, { color: IVORY, bone: jaw });
  }
  // tongue
  b.frustumBox(hp(0, -0.128, 0.16), hp(0, -0.13, 0.4), [0.06, 0.012], [0.04, 0.01], { bone: jaw, color: PINK_IN });
  // mouth line
  for (const s of [1, -1])
    b.sweep(
      catmull([hp(s * 0.062, -0.125, 0.5), hp(s * 0.066, -0.13, 0.3), hp(s * 0.062, -0.1, 0.13)]),
      0.005,
      { color: INK, bone: head, sides: 5 },
    );

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = hp(s * 0.09, 0.07, -0.03);
    const y = V(s * 0.7, 0.55, -0.45).normalize();
    const nOut = V(s, 0, 0).addScaledVector(y, -s * y.x).normalize();
    const xd = y.clone().cross(nOut);
    const ear = b.joint("ear" + side, { parent: head, at: base, dir: y, role: "hinge" });
    b.extrude(EAR, { at: base, x: xd, y, thickness: 0.014, bevel: 0.003, smoothing: 1, color: HEADP, bone: ear });
    b.extrude(EAR_IN, {
      at: base.clone().addScaledVector(nOut, 0.006),
      x: xd,
      y,
      thickness: 0.009,
      smoothing: 1,
      color: PINK_IN,
      bone: ear,
    });
  }

  // whiskers (long drifting dragon barbels) with pearl tips
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const defs = [
      {
        name: "whiskerA" + side,
        pts: [
          hp(s * 0.07, -0.07, 0.45),
          hp(s * 0.2, -0.03, 0.42),
          hp(s * 0.36, -0.02, 0.2),
          hp(s * 0.5, 0.06, -0.05),
          hp(s * 0.55, 0.01, -0.4),
          hp(s * 0.46, -0.1, -0.72),
        ],
      },
      {
        name: "whiskerB" + side,
        pts: [
          hp(s * 0.06, -0.13, 0.4),
          hp(s * 0.16, -0.17, 0.34),
          hp(s * 0.28, -0.24, 0.14),
          hp(s * 0.36, -0.3, -0.1),
          hp(s * 0.32, -0.38, -0.3),
        ],
      },
    ];
    for (const d of defs) {
      const chain = b.chain(d.name, catmull(d.pts), { parent: head, role: "tentacle" });
      b.sweep(chain, [0.013, 0.003], { color: GOLD_PALE, sides: 5, name: d.name });
      const last = chain.joints[chain.joints.length - 1];
      glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), "#fff6d0", { bone: last, at: d.pts[d.pts.length - 1], flat: true }), 1);
      b.cards([frame(d.pts[d.pts.length - 1], [0, 1, 0], [0, 0, 1])].map((f) => f), [WISPS[0]], {
        size: [0.05, 0.1],
        lean: 90,
        flow: [0, -0.3, -1],
        bone: last,
        cross: true,
      });
    }
  }

  // chin beard and cheek tufts and forelock (cloud cards)
  b.cards(
    [-0.04, -0.02, 0, 0.02, 0.04].map((x, i) => frame(hp(x, -0.17, 0.38 - i * 0.015), [0, 1, 0])),
    [WISPS[0], WISPS[3]],
    { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bone: jaw, rng: rand, vary: 0.25, cross: true },
  );
  for (const s of [1, -1])
    b.cards(
      [0, 1, 2].map((i) => frame(hp(s * 0.1, -0.07 + i * 0.03, 0.05 - i * 0.015), h.d([s, 0, 0]))),
      [WISPS[0], WISPS[1], WISPS[2]],
      { size: [0.07, 0.18], lean: 70, flow: [0, -0.2, -1], bone: head, rng: rand, vary: 0.2, bend: 30 },
    );
  b.cards(
    [-0.04, 0, 0.04].map((x, i) => frame(hp(x, 0.07, 0.02 + (i % 2) * 0.04), [0, 1, 0])),
    [WISPS[0], WISPS[1], WISPS[2]],
    { size: [0.08, 0.2], lean: 80, flow: [0, -0.2, 1], bone: head, rng: rand, bend: 30, cross: true },
  );

  // ---- Antlers ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const B = hp(s * 0.065, 0.07, -0.03);
    const P = (dx: number, dy: number, dz: number) => V(B.x + s * dx, B.y + dy, B.z + dz);
    const aj = b.joint("antler" + side, { parent: head, at: B, dir: [s * 0.2, 1, -0.4] });
    const pts = [P(0, -0.03, 0.01), P(0.03, 0.14, -0.08), P(0.09, 0.3, -0.22), P(0.15, 0.48, -0.3), P(0.17, 0.66, -0.22)];
    const path = catmull(pts);
    const ANT = cel(gradient("#eca535", "#fff3b8", pts[1], pts[4]));
    b.sweep(path, [0.034, 0.012], { color: ANT, bone: aj, caps: { start: "round", end: "point" }, sides: 7 });
    const tines: [number, [number, number, number], number][] = [
      [0.22, [-0.15, 0.55, 0.8], 0.24],
      [0.42, [0.8, 0.7, 0.05], 0.3],
      [0.58, [0.55, 0.5, -0.65], 0.3],
      [0.78, [0.7, 0.75, 0.3], 0.2],
    ];
    for (const [t, d, len] of tines) {
      const p0 = path.at(t);
      const dir = V(s * d[0], d[1], d[2]).normalize();
      const tip = p0.clone().addScaledVector(dir, len);
      const ctrl = p0.clone().addScaledVector(dir, len * 0.5).add(V(s * 0.02, 0.05, 0));
      b.sweep(bezier(p0, ctrl, tip), [0.02 - 0.008 * t, 0.003], { color: ANT, bone: aj, caps: "point", sides: 6 });
      glow(b.part(new THREE.OctahedronGeometry(0.017, 0), GEM_CYAN, { bone: aj, at: tip, flat: true, scale: [1, 1.5, 1] }), 1.2);
    }
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0), GEM_CYAN, {
        bone: aj,
        at: pts[4].clone().add(V(0, 0.03, 0.01)),
        flat: true,
        scale: [1, 1.6, 1],
      }),
      1.4,
    );
    // coronet rings at the base
    for (const [t, r] of [
      [0.1, 0.044],
      [0.2, 0.038],
    ] as const) {
      b.part(new THREE.TorusGeometry(r, 0.009, 5, 10), GOLD, {
        bone: aj,
        at: path.at(t),
        dir: path.tangentAt(t),
        axis: "z",
      });
    }
  }

  // ---- Cloud mane ---------------------------------------------------------------------------------------------
  const maneRows: Frame[] = [];
  for (let i = 0; i < 10; i++) {
    const t = 0.06 + (i / 9) * 0.92;
    const rad = 0.12 - 0.04 * t;
    for (const [ang, lat] of [
      [0, 0],
      [44, 0],
      [-44, 0],
    ] as const) {
      const f = neckS.at(t, ang);
      const c = (i + (ang === 0 ? 0 : ang > 0 ? 1 : 2)) % 4;
      b.stick(sphere, CLOUD[c], f.moved([lat, 0.02, 0]), { embed: 0.3, scale: [rad, rad * 0.8, rad * 1.15] });
      b.stick(sphere, CLOUD[(c + 1) % 4], f.moved([lat + 0.04, 0.0, 0.07]), {
        embed: 0.3,
        scale: [rad * 0.7, rad * 0.6, rad * 0.8],
      });
      if (ang === 0) maneRows.push(f);
    }
  }
  // big flowing wisps off the crest, swept back
  b.cards(maneRows.map((f) => f), WISPS, {
    size: [0.28, 0.4],
    lean: 62,
    flow: (_f, i) => [i % 2 ? 0.8 : -0.8, -0.25, -0.65],
    bend: 35,
    vary: 0.25,
    rng: rand,
    cross: true,
  });
  const sideFrames: Frame[] = [];
  const sideDir: number[] = [];
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + (i / 7) * 0.82;
    for (const s of [1, -1]) {
      sideFrames.push(neckS.at(t, s * 80));
      sideDir.push(s);
    }
  }
  b.cards(sideFrames, WISPS, {
    size: [0.2, 0.34],
    lean: 60,
    flow: (_f, i) => [sideDir[i] * 0.5, -0.5, -0.8],
    bend: 35,
    vary: 0.3,
    rng: rand,
  });
  // chest and shoulder clouds
  const chestPts: [number, number, number, number][] = [
    [0, 0.9, 0.86, 0.1],
    [0.1, 0.8, 0.82, 0.075],
    [-0.1, 0.8, 0.82, 0.075],
    [0.0, 0.72, 0.7, 0.08],
    [0.16, 0.95, 0.78, 0.07],
    [-0.16, 0.95, 0.78, 0.07],
  ];
  chestPts.forEach(([x, y, z, r], i) => {
    const hit = skinBody.nearest([x, y, z]);
    b.stick(sphere, CLOUD[i % 4], hit, { embed: 0.25, scale: [r, r * 0.85, r] });
  });
  const chestHits = [
    [0, 0.86, 0.9],
    [0.12, 0.78, 0.85],
    [-0.12, 0.78, 0.85],
  ].map(([x, y, z]) => skinBody.nearest([x, y, z]));
  b.cards(chestHits, [WISPS[0], WISPS[3], WISPS[2]], {
    size: [0.14, 0.26],
    lean: 70,
    flow: [0, -0.8, -0.5],
    bend: 30,
    rng: rand,
    cross: true,
  });
  // dorsal blades along the back
  const blade = new THREE.ConeGeometry(0.035, 0.12, 4);
  b.along(body, 10, (at) => {
    b.stick(blade, GOLD, at, { embed: 0.25, scale: [0.45, 1, 1.3] });
  });
  // back and haunch wisps
  const backFrames: Frame[] = [];
  for (const [t, ang] of [
    [0.1, 0],
    [0.25, 0],
    [0.15, 55],
    [0.15, -55],
  ] as const)
    backFrames.push(body.at(t, ang));
  b.cards(backFrames, WISPS, {
    size: [0.18, 0.3],
    lean: 65,
    flow: [0, -0.4, -1],
    bend: 30,
    rng: rand,
    vary: 0.2,
    cross: true,
  });

  // ---- Gilt collar, pendant and tassels ----------------------------------------------------------------------------
  const skinNeck = b.surface(neckS);
  b.sweep(skinNeck.loop(neck.at(0.1), { lift: 0.014 }), 0.02, { color: GOLD, sides: 6 });
  b.sweep(skinNeck.loop(neck.at(0.16), { lift: 0.01 }), 0.011, { color: GOLD_PALE, sides: 6 });
  const pend = skinNeck.nearest([0, 1.3, 0.72]);
  glow(
    b.stick(new THREE.OctahedronGeometry(0.04, 0), GEM_JADE, pend.moved([0, 0.03, 0]), {
      embed: 0.1,
      flat: true,
      scale: [1, 1.4, 0.7],
    }),
    1.3,
  );
  b.stick(new THREE.TorusGeometry(0.052, 0.01, 5, 12), GOLD, pend.moved([0, 0.012, 0]), { embed: 0 });
  b.cards(
    [-0.04, 0, 0.04].map((x) => frame(pend.local([x, 0.0, 0.0]), [0, 1, 0])),
    [TASSEL],
    { size: [0.045, 0.14], lean: 180, flow: [0, 0, 1], bone: neck.joints[0] },
  );

  // ---- Ribbons ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const rp = [
      [s * 0.12, 1.3, 0.58],
      [s * 0.3, 1.32, 0.12],
      [s * 0.46, 1.24, -0.38],
      [s * 0.6, 1.14, -0.88],
      [s * 0.6, 0.98, -1.36],
      [s * 0.46, 0.94, -1.76],
    ];
    const rib = b.chain("ribbon" + side, catmull(rp), { parent: spine.joints[2], count: 5 });
    b.sweep(rib, (t) => [0.05 + 0.035 * t, 0.005], { section: "box", color: RIBBON, caps: "flat", name: "ribbon" + side });
    const end = rib.at(1);
    b.part(sphere, GOLD, { bone: rib.joints[rib.joints.length - 1], at: end.at, scale: 0.03 });
    b.cards([frame(end.at, [0, 1, 0])], [TASSEL], {
      size: [0.06, 0.2],
      lean: 180,
      flow: [0, 0, 1],
      bone: rib.joints[rib.joints.length - 1],
      cross: true,
    });
  }

  // ---- Flank emblems -------------------------------------------------------------------------------------------------
  for (const s of [1, -1])
    glow(
      b.decal(body, EMBLEM, {
        at: [s * 0.24, 1.06, 0.02],
        dir: [s, 0, 0],
        up: [0, 1, 0],
        size: [0.36, 0.36],
        mirror: s < 0,
        bone: spine.joints[1],
      }),
      1,
    );

  return b.root;
}

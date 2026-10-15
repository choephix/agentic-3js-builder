import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a Little Bird",
  description:
    "A chubby, sleepy-eyed capybara chewing a grass blade, a daisy behind one ear and a small blue bird perched on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BACK = "#b07a43";
const BACK_DK = "#8d5b30";
const BELLY = "#e3b87c";
const HEAD_BR = "#a8703c";
const HEAD_DK = "#8a5630";
const CHIN = "#dcb27a";
const LEG = "#6f4526";
const NOSE = "#4a3024";
const NOSE_HI = "#6d4a38";
const INNER_EAR = "#f2a79a";
const EAR = "#7a4b29";
const DARK = "#2a1a14";
const WHITE = "#fff8ec";
const TOOTH = "#fff0c4";
const BLUSH = "#ff8f86";
const MOUTH = "#4a2a22";
const GRASS = "#6cc04a";
const GRASS_DK = "#3f8f36";
const PETAL = "#ffffff";
const DAISY = "#ffd23a";
const NAIL = "#3a2418";
// bird
const B_BLUE = "#4aa8e8";
const B_NAVY = "#2a62c0";
const B_CREAM = "#fff1d2";
const B_CHEEK = "#ff8a6a";
const B_BEAK = "#ffb52e";
const B_LEG = "#f29a3c";
const B_WING = "#3a7fd6";
const B_BAR = "#d6efff";

// ---------------------------------------------------------------------------------------------------------------
// Surface paints
const furBack = grain(mottle(BACK, BACK_DK, { size: 0.14, contrast: 0.55, seed: 3 }), BACK_DK, { size: 0.012, axis: "z", seed: 5 });
const COAT = countershade(furBack, BELLY, { level: -0.3, soft: 0.35 });
const furHead = grain(mottle(HEAD_BR, HEAD_DK, { size: 0.09, contrast: 0.5, seed: 8 }), HEAD_DK, { size: 0.01, axis: "z", seed: 9 });
const HEAD_COAT = countershade(furHead, CHIN, { level: -0.45, soft: 0.3 });
const LEG_COAT = gradient(COAT, LEG, [0, 0.22, 0], [0, 0.05, 0]);
const EAR_PAINT = paint((_p, _n, s) => {
  const x = s[0] / 0.018;
  const y = (s[1] - 0.034) / 0.028;
  return x * x + y * y < 1 ? INNER_EAR : EAR;
});
const B_BODY = countershade(B_BLUE, B_CREAM, { level: 0.05, soft: 0.25 });
const B_HEAD = paint((p, n) => (n.y > 0.5 ? B_NAVY : p.y < 0 ? B_CREAM : B_BLUE));
const WING_PAINT = paint((_p, _n, s) => {
  const u = s[0] / 0.012;
  return Math.abs(u - Math.round(u)) < 0.16 && s[0] > 0.02 ? B_BAR : B_WING;
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const TUFT_A = svg(`<svg viewBox="0 0 32 64"><path d="M2 64 Q9 30 15 0 Q21 30 30 64 Z" fill="#ffffff"/></svg>`, { size: 64 });
const TUFT_B = svg(`<svg viewBox="0 0 32 64"><path d="M4 64 Q6 34 24 2 Q22 36 28 64 Z" fill="#ffffff"/></svg>`, { size: 64 });
const BLUSH_MARK = svg(
  `<svg viewBox="0 0 48 32"><g stroke="${BLUSH}" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M8 26 L16 6"/><path d="M22 28 L30 8"/><path d="M36 26 L44 6"/></g></svg>`,
  { size: 192 },
);
const GRASS_BLADE = svg(
  `<svg viewBox="0 0 16 64"><path d="M8 64 Q2 36 8 0 Q14 36 8 64 Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });
  const r = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.35, -0.3], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.35, -0.3],
      [0, 0.355, -0.05],
      [0, 0.36, 0.2],
      [0, 0.37, 0.38],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.37, 0.38],
      [0, 0.4, 0.47],
      [0, 0.41, 0.54],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.41, 0.54], dir: [0, -0.08, 1], role: "head" });
  const H = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(0.06, -0.115), aim: H(0.4, -0.135), role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.31, -0.45], dir: [0, -0.3, -1], role: "tail" });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.325, -0.48], w: 0.22, h: 0.26 },
      { at: [0, 0.34, -0.39], w: 0.42, h: 0.44 },
      { at: [0, 0.35, -0.2], w: 0.54, h: 0.5 },
      { at: [0, 0.355, 0.05], w: 0.55, h: 0.5 },
      { at: [0, 0.36, 0.25], w: 0.52, h: 0.49 },
      { at: [0, 0.37, 0.38], w: 0.44, h: 0.45 },
      { at: [0, 0.385, 0.47], w: 0.33, h: 0.36 },
      { at: [0, 0.405, 0.54], w: 0.3, h: 0.33 },
    ],
    { bone: [hips, spine, neck], color: COAT, detail: 0.9, name: "body" },
  );
  b.part(new THREE.SphereGeometry(0.03, 6, 5), NOSE, { bone: tail1, at: [0, 0.305, -0.5], scale: [1, 0.9, 1.1] });

  // ---------------------------------------------------------------- legs
  const makeFoot = (foot: ReturnType<typeof b.joint>, s: number, tag: string, front: boolean) => {
    const p = foot.at.clone();
    const padLen = front ? 0.07 : 0.085;
    b.part(new THREE.SphereGeometry(1, 8, 6), LEG_COAT, {
      bone: foot,
      at: [p.x, 0.036, p.z + 0.02],
      scale: [front ? 0.055 : 0.058, 0.038, padLen],
    });
    const n = front ? 4 : 3;
    const spread = front ? 0.032 : 0.036;
    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * spread;
      const fan = dx * 0.7;
      const z0 = p.z + 0.04;
      const z1 = p.z + (front ? 0.095 : 0.115) - Math.abs(dx) * 0.4;
      const toe = b.joint(`toe${tag}${i + 1}${s > 0 ? "L" : "R"}`, {
        parent: foot,
        at: [p.x + dx, 0.022, z0],
        aim: [p.x + dx + fan, 0.022, z1],
        role: "digit",
      });
      b.capsule([p.x + dx, 0.0215, z0], [p.x + dx + fan, 0.0215, z1], [front ? 0.0185 : 0.021, 0.0165], {
        bone: toe,
        color: LEG_COAT,
        sides: 6,
      });
      b.spike([p.x + dx + fan, 0.017, z1 + 0.003], [0, -0.1, 1], 0.026, 0.0115, { bone: toe, color: NAIL, sides: 5 });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fPts = limb([s * 0.17, 0.28, 0.22], [s * 0.175, 0.065, 0.265], [0.13, 0.13], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "leg",
      contact: [s * 0.175, 0, 0.29],
    });
    b.sweep(fLeg, (t) => 0.082 - 0.032 * t, { color: LEG_COAT, sides: 8, name: `foreleg${S}` });
    makeFoot(fLeg.tip ?? fLeg.joints[2], s, "F", true);
    // hind
    const hPts = limb(
      [s * 0.19, 0.29, -0.3],
      [s * 0.185, 0.07, -0.33],
      [0.14, 0.13, 0.06],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.185, 0, -0.3],
    });
    b.sweep(hLeg, (t) => 0.098 - 0.05 * t, { color: LEG_COAT, sides: 8, name: `hindleg${S}` });
    makeFoot(hLeg.tip ?? hLeg.joints[3], s, "H", false);
  }

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: H(-0.02, 0.005), w: 0.3, h: 0.32 },
      { at: H(0.1, 0.01), w: 0.315, h: 0.33 },
      { at: H(0.22, 0.0), w: 0.29, h: 0.31 },
      { at: H(0.32, -0.005), w: 0.27, h: 0.29 },
      { at: H(0.385, -0.01), w: 0.24, h: 0.26 },
    ],
    { bone: head, color: HEAD_COAT, detail: 0.9, name: "skull" },
  );
  const skin = b.surface(skull);

  // lower jaw
  b.loft(
    [
      { at: H(0.06, -0.145), w: 0.2, h: 0.06 },
      { at: H(0.2, -0.15), w: 0.2, h: 0.06 },
      { at: H(0.32, -0.147), w: 0.19, h: 0.055 },
      { at: H(0.385, -0.143), w: 0.17, h: 0.05 },
    ],
    { bone: jaw, color: CHIN, detail: 0.8, name: "lowerJaw" },
  );
  // chin tuft
  b.spike(H(0.37, -0.17), [0, -0.5, 0.2], 0.05, 0.02, { bone: jaw, color: CHIN, sides: 5 });

  // nose pad and nostrils
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: H(0.385, -0.002), scale: [0.115, 0.1, 0.08], rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), DARK, { bone: head, at: H(0.42, 0.04, s * 0.052), scale: [0.016, 0.026, 0.02], rotation: [90, 0, 0] });
    b.part(new THREE.SphereGeometry(1, 6, 5), NOSE_HI, { bone: head, at: H(0.405, 0.075, s * 0.04), scale: [0.03, 0.012, 0.02], rotation: [90, 0, 0] });
  }
  // mouth line, with a little upturn at the corner, and big front teeth
  for (const s of [1, -1]) {
    b.sweep(
      catmull([H(0.43, -0.105, s * 0.012), H(0.4, -0.118, s * 0.075), H(0.3, -0.122, s * 0.113), H(0.18, -0.118, s * 0.138), H(0.11, -0.095, s * 0.155)]),
      0.0055,
      { bone: head, color: MOUTH, sides: 5, name: "mouthLine" },
    );
    b.part(new THREE.BoxGeometry(0.028, 0.028, 0.016), TOOTH, { bone: head, at: H(0.431, -0.122, s * 0.016) });
  }
  // grass blade chewed at the side of the mouth
  const blade = catmull([H(0.3, -0.125, 0.115), H(0.38, -0.13, 0.15), H(0.47, -0.1, 0.2), H(0.55, -0.02, 0.22), H(0.58, 0.05, 0.2)]);
  b.sweep(blade, 0.0045, { bone: head, color: GRASS_DK, sides: 5, caps: "round", name: "grassStem" });
  b.cards([frame(blade.at(0.97), [0, 1, 0.2])], GRASS_BLADE, { size: [0.018, 0.075], lean: 30, bend: 30, flow: [-1, 0, 0.3], color: GRASS, bone: head });

  // eyes: dark glossy beads under heavy, content lids
  for (const s of [1, -1]) {
    const hit = skin.around(H(0.17, 0.07)).at(s * 82, 12);
    if (!hit) throw new Error("eye hit missed");
    const c = hit.at.clone().addScaledVector(hit.n, 0.004);
    b.part(new THREE.SphereGeometry(0.03, 9, 7), DARK, { bone: head, at: [c.x, c.y, c.z] });
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), WHITE, {
      bone: head,
      at: [c.x + hit.n.x * 0.021, c.y + hit.n.y * 0.021 + 0.006, c.z + hit.n.z * 0.021 + 0.008],
    });
    b.part(new THREE.SphereGeometry(0.0038, 4, 3), WHITE, {
      bone: head,
      at: [c.x + hit.n.x * 0.026, c.y + hit.n.y * 0.026 - 0.007, c.z + hit.n.z * 0.026 - 0.006],
    });
    b.part(new THREE.SphereGeometry(0.0345, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), HEAD_COAT, {
      bone: head,
      at: [c.x, c.y + 0.0105, c.z],
      rotation: [s * 12, 0, -s * 14],
    });
    // lash line under the lid
    b.sweep(
      catmull([
        [c.x + hit.n.x * 0.006 + 0.0, c.y + 0.011, c.z - 0.033],
        [c.x + hit.n.x * 0.036, c.y + 0.011, c.z],
        [c.x + hit.n.x * 0.006, c.y + 0.011, c.z + 0.033],
      ]),
      0.0028,
      { bone: head, color: DARK, sides: 4, name: "lidLine" },
    );
    // blush marks
    const bh = skin.around(H(0.2, -0.045)).at(s * 78, -12);
    if (bh) b.decal(skin, BLUSH_MARK, { at: bh, dir: [s, 0.05, 0.1], size: [0.075, 0.05], mirror: s < 0, up: [0, 1, 0] });
    // ears
    const ear = b.extrude(
      [
        [-0.027, 0.0],
        [0.027, 0.0],
        [0.033, 0.03],
        [0.021, 0.063],
        [0.0, 0.074],
        [-0.021, 0.063],
        [-0.033, 0.03],
      ],
      { at: H(0.0, 0.135, s * 0.092), x: [0.6, 0, -s * 0.8], y: [s * 0.35, 1, 0], thickness: 0.014, bevel: 0.005, smoothing: 1, color: EAR_PAINT, bone: head, name: "ear" },
    );
    void ear;
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.sweep(
        bezier(H(0.4, -0.06 + i * 0.02, s * 0.1), H(0.44, -0.07 + i * 0.03, s * 0.15), H(0.46, -0.095 + i * 0.05, s * 0.2 + 0.02 * i)),
        [0.0028, 0.0012],
        { bone: head, color: DARK, sides: 4, caps: "point", name: "whisker" },
      );
    }
    // brow bristle above the eye
    b.spike(H(0.15, 0.115, s * 0.13), [s * 0.5, 0.5, 0.35], 0.032, 0.007, { bone: head, color: HEAD_DK, sides: 4 });
  }

  // daisy behind the left ear
  {
    const dh = skin.around(H(0.08, 0.0)).at(72, 58);
    if (dh) {
      const c = dh.moved([0, 0.004, 0]);
      b.ring(c, { count: 8, radius: 0.012 }, (it) => b.spike(it, it, 0.03, 0.0125, { bone: head, color: PETAL, sides: 4 }));
      b.part(new THREE.SphereGeometry(0.0125, 7, 5), DAISY, { bone: head, at: [dh.at.x + dh.n.x * 0.006, dh.at.y + dh.n.y * 0.006, dh.at.z + dh.n.z * 0.006], scale: [1, 0.8, 1] });
    }
  }

  // ---------------------------------------------------------------- fur tufts
  const bodyHits = b.surface(body).scatter(420, { rng: r, minDist: 0.033, filter: (h) => h.n.y > -0.25 && h.at.z < 0.4 });
  b.cards(bodyHits, [TUFT_A, TUFT_B], { size: [0.04, 0.065], lean: 62, bend: 24, vary: 0.3, rng: rng(21), color: COAT });
  const headHits = skin.scatter(70, { rng: rng(4), minDist: 0.036, filter: (h) => h.n.y > -0.2 && h.at.z < 0.8 && h.at.z > 0.6 });
  b.cards(headHits, [TUFT_A, TUFT_B], { size: [0.028, 0.045], lean: 65, bend: 20, vary: 0.3, rng: rng(22), color: HEAD_COAT, flow: [0, -0.1, -1] });
  // cheek ruff, hanging
  const cheekHits = skin.scatter(40, { rng: rng(5), minDist: 0.03, filter: (h) => Math.abs(h.n.x) > 0.7 && h.n.y < 0.2 });
  b.cards(cheekHits, TUFT_A, { size: [0.03, 0.05], lean: 80, bend: 20, vary: 0.25, rng: rng(23), color: CHIN, flow: [0, -1, -0.3] });

  // ---------------------------------------------------------------- bird
  const top = skin.ray([0, 1.4, H(0.11, 0.0).z], [0, -1, 0]);
  if (!top) throw new Error("bird perch missed");
  const perch = top.at.clone();
  const bc: [number, number, number] = [perch.x, perch.y + 0.057, perch.z - 0.008];
  const bBody = b.joint("birdBody", { parent: head, at: bc, dir: [0, 0.1, 1], role: "spine" });
  const bHead = b.joint("birdHead", { parent: bBody, at: [bc[0], bc[1] + 0.028, bc[2] + 0.034], dir: [0, 0, 1], role: "head" });
  const bBeak = b.joint("birdBeak", { parent: bHead, at: [bc[0], bc[1] + 0.03, bc[2] + 0.058], dir: [0, -0.08, 1], role: "jaw" });
  b.part(new THREE.SphereGeometry(1, 10, 8), B_BODY, { bone: bBody, at: bc, scale: [0.04, 0.038, 0.047] });
  b.part(new THREE.SphereGeometry(1, 10, 8), B_HEAD, { bone: bHead, at: [bc[0], bc[1] + 0.03, bc[2] + 0.034], scale: [0.03, 0.028, 0.029] });
  // beak
  b.spike([bc[0], bc[1] + 0.03, bc[2] + 0.056], [0, -0.1, 1], 0.026, 0.0085, { bone: bHead, color: B_BEAK, sides: 5 });
  b.spike([bc[0], bc[1] + 0.024, bc[2] + 0.054], [0, -0.25, 1], 0.02, 0.0065, { bone: bBeak, color: B_BEAK, sides: 5 });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.0068, 6, 5), DARK, { bone: bHead, at: [bc[0] + s * 0.0225, bc[1] + 0.035, bc[2] + 0.047] });
    b.part(new THREE.SphereGeometry(0.0026, 4, 3), WHITE, { bone: bHead, at: [bc[0] + s * 0.027, bc[1] + 0.0385, bc[2] + 0.0505] });
    b.part(new THREE.SphereGeometry(1, 6, 5), B_CHEEK, { bone: bHead, at: [bc[0] + s * 0.0245, bc[1] + 0.024, bc[2] + 0.04], scale: [0.0045, 0.0095, 0.011] });
    // wing
    const wj = b.joint(`birdWing${S}`, { parent: bBody, at: [bc[0] + s * 0.034, bc[1] + 0.008, bc[2] + 0.014], dir: [s * 0.1, 0.1, -1], role: "wing" });
    b.extrude(
      [
        [0, 0.013],
        [0.02, 0.022],
        [0.05, 0.012],
        [0.08, -0.012, "sharp"],
        [0.05, -0.025],
        [0.015, -0.026],
        [-0.004, -0.008],
      ],
      { at: wj.at, x: [s * 0.12, -0.05, -1], y: [0, 1, 0], thickness: 0.008, bevel: 0.003, smoothing: 1, color: WING_PAINT, bone: wj, name: "birdWing" },
    );
    // legs and feet gripping the fur
    const lj = b.joint(`birdLeg${S}`, { parent: bBody, at: [bc[0] + s * 0.016, bc[1] - 0.026, bc[2] + 0.004], aim: [perch.x + s * 0.016, perch.y, perch.z + 0.004], role: "leg" });
    b.capsule([bc[0] + s * 0.016, bc[1] - 0.026, bc[2] + 0.004], [perch.x + s * 0.016, perch.y + 0.006, perch.z + 0.004], 0.0042, { bone: lj, color: B_LEG, sides: 5 });
    for (let k = -1; k <= 1; k++) {
      b.capsule([perch.x + s * 0.016, perch.y + 0.008, perch.z + 0.004], [perch.x + s * 0.016 + k * 0.013, perch.y + 0.012, perch.z + 0.03], 0.0033, { bone: lj, color: B_LEG, sides: 4 });
    }
    b.capsule([perch.x + s * 0.016, perch.y + 0.008, perch.z + 0.004], [perch.x + s * 0.016, perch.y + 0.01, perch.z - 0.016], 0.0033, { bone: lj, color: B_LEG, sides: 4 });
  }
  // crest
  for (let k = -1; k <= 1; k++) {
    b.spike([bc[0] + k * 0.007, bc[1] + 0.054, bc[2] + 0.028], [k * 0.25, 1, -0.55 - 0.15 * (1 - Math.abs(k))], 0.028 - Math.abs(k) * 0.006, 0.0058, {
      bone: bHead,
      color: B_NAVY,
      sides: 4,
    });
  }
  // tail feathers
  const tailJ = b.joint("birdTail", { parent: bBody, at: [bc[0], bc[1] - 0.004, bc[2] - 0.04], dir: [0, 0.35, -1], role: "tail" });
  for (let k = -1; k <= 1; k++) {
    const base: [number, number, number] = [bc[0] + k * 0.006, bc[1] - 0.002, bc[2] - 0.036];
    const tip: [number, number, number] = [bc[0] + k * 0.03, bc[1] + 0.03 - Math.abs(k) * 0.006, bc[2] - 0.115];
    b.sweep(bezier(base, [bc[0] + k * 0.014, bc[1] + 0.006, bc[2] - 0.07], tip), (t) => [0.0095 * (1 - 0.35 * t), 0.0028], {
      bone: tailJ,
      color: k === 0 ? B_NAVY : B_WING,
      sides: 6,
      caps: "round",
      name: "birdTailFeather",
    });
  }

  return b.root;
}

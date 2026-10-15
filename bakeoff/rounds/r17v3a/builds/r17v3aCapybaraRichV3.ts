import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Hit } from "../../../../src/surface";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, gradient, mottle, paint, mix, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a Songbird",
  description:
    "A plump, sleepy-smiling capybara with rosy cheeks and a daisy behind one ear, and a tiny bluebird singing on top of its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// Palette
const COAT = "#a8693b";
const COAT_D = "#855029";
const COAT_L = "#c18350";
const BELLY = "#dcb078";
const LEG_D = "#6d4126";
const NOSE = "#4a2c20";
const DARK = "#1e130e";
const EAR = "#6a3f27";
const EAR_IN = "#e79a8c";
const TOOTH = "#f0cf8a";
const NAIL = "#3a2418";
const WHISKER = "#4a2f20";
const WHITE = "#ffffff";
const PETAL = "#fff6e6";
const PETAL_E = "#ffd2da";
const FLOWER_C = "#f7bf2e";
const BLUE = "#3f9ee0";
const BLUE_D = "#27529e";
const BLUE_M = "#2f78c4";
const CREAM = "#fff0cf";
const PEACH = "#f7a77c";
const BEAK = "#f6a925";
const LEG_B = "#e58a2a";

const must = (h: Hit | null, what: string): Hit => {
  if (!h) throw new Error(`no surface hit for ${what}`);
  return h;
};

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---------- textures ----------
  const strand = svg(
    `<svg viewBox="0 0 16 40"><path d="M1 40 C4 24 7 10 8 0 C9 10 12 24 15 40 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const smileTex = svg(
    `<svg viewBox="0 0 64 24">
      <path d="M3 17 C 18 19, 38 17, 54 8" fill="none" stroke="#2a1710" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M52 3 C 57 5, 60 9, 58 13" fill="none" stroke="#2a1710" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const blushTex = svg(
    `<svg viewBox="0 0 48 32">
      <ellipse cx="24" cy="16" rx="21" ry="13" fill="#f48f84"/>
      <path d="M13 12 l5 9 M22 10 l5 11 M31 12 l5 9" stroke="#e3685f" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const noseTex = svg(
    `<svg viewBox="0 0 64 48">
      <ellipse cx="32" cy="22" rx="30" ry="20" fill="#4f3023"/>
      <path d="M32 18 L32 44" stroke="#2a1710" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="19" cy="14" rx="7" ry="4.5" fill="#1d110c" transform="rotate(-18 19 14)"/>
      <ellipse cx="45" cy="14" rx="7" ry="4.5" fill="#1d110c" transform="rotate(18 45 14)"/>
      <ellipse cx="24" cy="8" rx="8" ry="2.4" fill="#7b4c38" opacity="1" transform="rotate(-12 24 8)"/>
    </svg>`,
    { size: 256 },
  );
  const browTex = svg(
    `<svg viewBox="0 0 32 12"><path d="M2 8 C 10 2, 22 2, 30 8" fill="none" stroke="#2a1710" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const furBack = mottle(COAT, COAT_L, { size: 0.09, seed: 3, contrast: 1.4 });
  const furBelly = mottle(BELLY, "#c9985f", { size: 0.08, seed: 5 });
  const coat = countershade(
    paint((p, n) => {
      // darker saddle stripe along the spine
      const saddle = smoothstep(0.55, 0.95, n.y) * smoothstep(-0.2, 0.25, p.z) * 0.0;
      return mix("#8f592f", "#a8693b", saddle) && furBack;
    }),
    furBelly,
    { level: -0.1, soft: 0.45 },
  );
  const headCoat = gradient(
    countershade(mottle(COAT, COAT_L, { size: 0.07, seed: 9 }), mottle("#d5a56d", "#c28d58", { size: 0.07, seed: 4 }), {
      level: -0.35,
      soft: 0.4,
    }),
    NOSE,
    [0, 0.44, 0.76],
    [0, 0.44, 0.9],
  );
  const legCoat = gradient(coat, LEG_D, [0, 0.2, 0], [0, 0.02, 0]);
  const birdBody = countershade(BLUE, CREAM, { level: -0.15, soft: 0.3 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, -0.25], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.25],
      [0, 0.41, -0.06],
      [0, 0.42, 0.14],
      [0, 0.43, 0.33],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.43, 0.33],
      [0, 0.45, 0.41],
      [0, 0.47, 0.48],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.47, 0.48],
    aim: [0, 0.45, 0.8],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.388, 0.55],
    aim: [0, 0.366, 0.82],
    role: "jaw",
  });
  const tail = b.joint("tail", { parent: hips, at: [0, 0.38, -0.5], dir: [0, -0.2, -1], role: "tail" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.37, -0.36], w: 0.3, h: 0.32 },
      { at: [0, 0.385, -0.2], w: 0.44, h: 0.44 },
      { at: [0, 0.39, -0.02], w: 0.47, h: 0.46 },
      { at: [0, 0.4, 0.16], w: 0.44, h: 0.45 },
      { at: [0, 0.425, 0.33], w: 0.35, h: 0.38 },
      { at: [0, 0.46, 0.45], w: 0.27, h: 0.28 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 12, name: "body" },
  );
  // tail stub
  b.sweep(
    [
      [0, 0.4, -0.46],
      [0, 0.37, -0.52],
    ],
    [0.03, 0.018],
    { bone: tail, color: LEG_D, caps: { start: "flat", end: "round" }, sides: 6 },
  );

  // ---------- head ----------
  const skull = b.loft(
    [
      { at: [0, 0.475, 0.46], w: 0.27, h: 0.23 },
      { at: [0, 0.48, 0.59], w: 0.27, h: 0.2 },
      { at: [0, 0.465, 0.72], w: 0.25, h: 0.185 },
      { at: [0, 0.452, 0.8], w: 0.22, h: 0.17 },
    ],
    { bone: head, color: headCoat, sides: 12, name: "skull" },
  );
  const jawTube = b.sweep(
    [
      [0, 0.372, 0.56],
      [0, 0.358, 0.8],
    ],
    (t) => [0.085 - 0.018 * t, 0.034],
    { bone: jaw, color: gradient(BELLY, "#c79a62", [0, 0.36, 0.56], [0, 0.36, 0.8]), sides: 10, name: "jaw" },
  );
  void jawTube;
  // cheeks: puffy
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 10, 7), headCoat, {
      bone: head,
      at: [sx * 0.108, 0.425, 0.6],
      scale: [0.8, 0.85, 1.15],
      name: "cheek",
    });
  }
  const skullSurf = b.surface(skull);

  // morrillo (the bump above the nose)
  b.part(new THREE.SphereGeometry(0.04, 10, 7), "#5a3828", {
    bone: head,
    at: [0, 0.545, 0.74],
    scale: [1, 0.5, 1.35],
    name: "morrillo",
  });
  // nose pad decal
  const noseHit = must(skullSurf.ray([0, 0.45, 1.5], [0, 0, -1]), "nose");
  b.decal(skull, noseTex, { at: noseHit.at, dir: [0, 0.1, 1], size: [0.19, 0.145], segments: 12, bone: head, name: "nose" });
  // teeth
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.012), TOOTH, {
      bone: jaw,
      at: [sx * 0.012, 0.37, noseHit.at.z - 0.02],
      name: "incisor",
    });
  }

  // eyes, lids, highlights
  for (const sx of [1, -1]) {
    const eh = must(skullSurf.around([0, 0.48, 0.6]).at(sx * 62, 30), "eye");
    const c = eh.at.clone().addScaledVector(eh.n, 0.002);
    b.part(new THREE.SphereGeometry(0.029, 10, 8), DARK, { bone: head, at: c, name: "eye" });
    const pole = eh.n.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.9, 0)).normalize();
    b.part(new THREE.SphereGeometry(0.0315, 10, 5, 0, Math.PI * 2, 0, 1.12), "#7a4a2a", {
      bone: head,
      at: c,
      dir: pole,
      name: "lid",
    });
    const hl = eh.n.clone().add(new THREE.Vector3(0, -0.15, 0.45)).normalize();
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(hl, 0.0275),
      name: "glint",
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(eh.n.clone().add(new THREE.Vector3(0, -0.5, -0.4)).normalize(), 0.028),
      name: "glint2",
    });
    // eyebrow decal
    b.decal(skull, browTex, {
      at: eh.at.clone().add(new THREE.Vector3(0, 0.04, 0)),
      dir: eh.n,
      up: [0, 1, 0],
      size: [0.07, 0.026],
      roll: sx * 8,
      mirror: sx < 0,
      bone: head,
      name: "brow",
    });
    // blush and smile decals
    const bh = must(skullSurf.around([0, 0.45, 0.6]).at(sx * 82, -8), "blush");
    b.decal(skull, blushTex, {
      at: bh.at.clone().add(new THREE.Vector3(0, 0.0, -0.035)),
      dir: bh.n,
      size: [0.085, 0.057],
      mirror: sx < 0,
      roll: 0,
      bone: head,
      name: "blush",
    });
    const mh = must(skullSurf.around([0, 0.4, 0.7]).at(sx * 84, -22), "smile");
    b.decal(skull, smileTex, {
      at: mh.at.clone().add(new THREE.Vector3(0, 0.0, -0.04)),
      dir: mh.n,
      size: [0.18, 0.068],
      mirror: sx < 0,
      bone: head,
      name: "smile",
    });
  }

  // nostrils bumps
  for (const sx of [1, -1]) {
    const nh = must(skullSurf.around([0, 0.45, 0.8]).at(sx * 24, 40), "nostril");
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), "#2a1710", nh, { embed: 0.5, bone: head, scale: [1.3, 0.6, 1] });
  }

  // ears
  const earOutline: [number, number][] = [
    [0, 0],
    [0.04, 0.0],
    [0.062, 0.028],
    [0.055, 0.062],
    [0.03, 0.082],
    [0.004, 0.066],
    [-0.008, 0.03],
  ];
  const earIn: [number, number][] = earOutline.map(([x, y]) => [0.004 + x * 0.68, 0.006 + y * 0.68] as [number, number]);
  for (const sx of [1, -1]) {
    const base = [sx * 0.098, 0.553, 0.455] as const;
    b.extrude(earOutline, {
      at: [base[0], base[1], base[2] - 0.0],
      x: [0, 0, 1],
      y: [sx * 0.45, 1, 0],
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 2,
      color: EAR,
      bone: head,
      name: "ear",
    });
    b.extrude(earIn, {
      at: [base[0] + sx * 0.012, base[1] + 0.002, base[2]],
      x: [0, 0, 1],
      y: [sx * 0.45, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 2,
      color: EAR_IN,
      bone: head,
      name: "earInner",
    });
  }

  // whiskers (sparse, bouncy)
  for (const sx of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const wh = must(skullSurf.around([0, 0.43, 0.72]).at(sx * (62 + i * 5), 4 - i * 9), "whisker");
      const dir = wh.n.clone().add(new THREE.Vector3(0, -0.12 - i * 0.05, -0.55)).normalize();
      const tip = wh.at.clone().addScaledVector(dir, 0.1 - i * 0.008);
      const mid = wh.at.clone().addScaledVector(dir, 0.05).add(new THREE.Vector3(0, 0.012, 0));
      b.sweep(bezier(wh.at, mid, tip), [0.0032, 0.0008], {
        bone: head,
        color: WHISKER,
        caps: "point",
        sides: 4,
        name: "whisker",
      });
    }
  }

  // ---------- legs ----------
  const spineFront = spine.joints[2];
  type Leg = { side: string; sx: number };
  const legs: Leg[] = [
    { side: "L", sx: 1 },
    { side: "R", sx: -1 },
  ];
  for (const { side, sx } of legs) {
    // front
    const fPts = limb([sx * 0.15, 0.3, 0.24], [sx * 0.15, 0.04, 0.27], [0.15, 0.15], [0, 0, -1]);
    const fl = b.chain(`legF${side}`, fPts, {
      parent: spineFront,
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`],
      role: "leg",
      contact: [sx * 0.15, 0, 0.3],
    });
    b.sweep(fl, [0.082, 0.058], { color: legCoat, sides: 8, name: `legF${side}` });
    const wf = fl.tip!;
    b.sweep(
      [
        [sx * 0.15, 0.038, 0.25],
        [sx * 0.15, 0.034, 0.33],
      ],
      [0.05, 0.036],
      { bone: wf, color: LEG_D, sides: 8, name: `pawF${side}` },
    );
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * 0.026;
      const base = [sx * 0.15 + o, 0.026, 0.335] as const;
      const tipP = [sx * 0.15 + o * 1.7, 0.02, 0.4] as const;
      const toe = b.joint(`toeF${side}${i + 1}`, { parent: wf, at: base, aim: tipP, role: "digit" });
      b.sweep([base, tipP], [0.0155, 0.0135], { bone: toe, color: LEG_D, sides: 6, name: "toe" });
      b.part(new THREE.SphereGeometry(0.0135, 6, 4), NAIL, {
        bone: toe,
        at: [tipP[0], tipP[1] - 0.001, tipP[2] + 0.002],
        scale: [1, 0.8, 1.1],
        name: "nail",
      });
    }
    // hind
    const hPts = limb([sx * 0.17, 0.31, -0.29], [sx * 0.16, 0.04, -0.3], [0.16, 0.16], [0, 0, 1]);
    const hl = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`],
      role: "leg",
      contact: [sx * 0.16, 0, -0.26],
    });
    b.part(new THREE.SphereGeometry(0.115, 12, 8), coat, {
      bone: hl.joints[0],
      at: [sx * 0.185, 0.32, -0.28],
      scale: [0.8, 1, 1.1],
      name: `thigh${side}`,
    });
    b.sweep(hl, [0.085, 0.06], { color: legCoat, sides: 8, name: `legH${side}` });
    const ah = hl.tip!;
    b.sweep(
      [
        [sx * 0.16, 0.038, -0.32],
        [sx * 0.16, 0.034, -0.24],
      ],
      [0.052, 0.038],
      { bone: ah, color: LEG_D, sides: 8, name: `pawH${side}` },
    );
    for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 0.034;
      const base = [sx * 0.16 + o, 0.026, -0.235] as const;
      const tipP = [sx * 0.16 + o * 1.6, 0.02, -0.17] as const;
      const toe = b.joint(`toeH${side}${i + 1}`, { parent: ah, at: base, aim: tipP, role: "digit" });
      b.sweep([base, tipP], [0.017, 0.015], { bone: toe, color: LEG_D, sides: 6, name: "toe" });
      b.part(new THREE.SphereGeometry(0.015, 6, 4), NAIL, {
        bone: toe,
        at: [tipP[0], tipP[1] - 0.001, tipP[2] + 0.002],
        scale: [1, 0.8, 1.1],
        name: "nail",
      });
    }
  }

  // ---------- fur cards ----------
  const bodySurf = b.surface(body);
  const bodyHits = bodySurf.scatter(520, { rng: rng(11), minDist: 0.04, filter: (h) => h.at.z < 0.4 });
  b.cards(bodyHits, strand, { size: [0.03, 0.065], lean: 72, bend: 20, vary: 0.3, rng: rng(12), color: coat, mirror: false });
  const faceHits = skullSurf.scatter(90, {
    rng: rng(13),
    minDist: 0.04,
    filter: (h) => h.at.z < 0.62 && h.n.y > -0.2,
  });
  b.cards(faceHits, strand, { size: [0.02, 0.04], lean: 75, vary: 0.3, rng: rng(14), color: headCoat });

  // ---------- flower behind the left ear ----------
  const fh = must(skullSurf.around([0, 0.48, 0.5]).at(126, 35), "flower");
  const fc = fh.at.clone().addScaledVector(fh.n, 0.004);
  const petal: [number, number][] = [
    [0.004, 0],
    [0.014, -0.013],
    [0.032, -0.012],
    [0.042, 0],
    [0.032, 0.012],
    [0.014, 0.013],
  ];
  b.ring(frame(fc, fh.n), { count: 6, radius: 0 }, (item) => {
    const radial = item.axis.clone();
    const tangent = fh.n.clone().cross(radial).normalize();
    b.extrude(petal, {
      at: fc,
      x: radial,
      y: tangent,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: gradient(PETAL_E, PETAL, fc, fc.clone().addScaledVector(radial, 0.035)),
      bone: head,
      name: "petal",
    });
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), FLOWER_C, {
    bone: head,
    at: fc.clone().addScaledVector(fh.n, 0.006),
    scale: [1, 1, 0.8],
    dir: fh.n,
    name: "flowerCentre",
  });

  // ---------- the bird ----------
  const crown = must(skullSurf.ray([0, 1.2, 0.52], [0, -1, 0]), "crown");
  const bc = crown.at.clone().add(new THREE.Vector3(0, 0.05, 0));
  const bb = b.joint("birdBody", {
    parent: head,
    at: bc,
    dir: [0.28, 0.32, 1],
    group: "bird",
  });
  const R = (x: number, y: number, z: number) => bb.local([x, y, z]);
  b.part(new THREE.SphereGeometry(0.052, 12, 9), birdBody, {
    bone: bb,
    at: R(0, 0, 0),
    quat: bb.quat,
    scale: [0.92, 1.22, 0.98],
    name: "birdBody",
  });
  const bh = b.joint("birdHead", { parent: bb, at: R(0, 0.042, 0.032), dir: bb.dir([0, 1, 0]), group: "bird" });
  b.part(new THREE.SphereGeometry(0.04, 12, 9), birdBody, {
    bone: bh,
    at: bh.at,
    quat: bb.quat,
    name: "birdHeadBall",
  });
  for (const sr of [1, -1]) {
    // eyes
    const ec = bh.local([sr * 0.026, 0.021, 0.014]);
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), DARK, { bone: bh, at: ec, name: "birdEye" });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), WHITE, {
      bone: bh,
      at: bh.local([sr * 0.0305, 0.0255, 0.0195]),
      name: "birdGlint",
    });
    // cheek blush
    b.part(new THREE.SphereGeometry(0.0125, 8, 5), PEACH, {
      bone: bh,
      at: bh.local([sr * 0.031, 0.016, -0.007]),
      scale: [0.45, 1, 0.8],
      quat: bb.quat,
      name: "birdCheek",
    });
    // wing
    const wing: [number, number][] = [
      [0.012, 0.012],
      [-0.01, 0.014],
      [-0.052, 0.002, "sharp"],
      [-0.082, -0.026, "sharp"],
      [-0.05, -0.022],
      [-0.008, -0.028],
      [0.016, -0.012],
    ];
    const wj = b.joint(`wing${sr > 0 ? "R" : "L"}`, {
      parent: bb,
      at: R(sr * 0.04, 0.012, 0.012),
      dir: bb.dir([sr * 0.4, -0.5, 0.1]),
      role: "wing",
      group: "bird",
    });
    b.extrude(wing, {
      at: R(sr * 0.04, 0.02, 0.012),
      x: bb.dir([0, 1, 0]),
      y: bb.dir([0, 0, 1]),
      thickness: [0.008, 0.008],
      bevel: 0.0025,
      smoothing: 1,
      color: paint((p, n, s) => {
        void p;
        void n;
        const tipZone = s[0] < -0.04 ? BLUE_D : s[1] < -0.008 ? BLUE_M : BLUE;
        return tipZone;
      }),
      bone: wj,
      name: "birdWing",
    });
    // leg + toes
    const foot = must(skullSurf.ray([sr * -0.022 + bc.x, 1.2, bc.z + 0.01], [0, -1, 0]), "bird foot");
    b.rod(R(sr * 0.022, 0.0, -0.045), foot.at.clone().add(new THREE.Vector3(0, 0.003, 0)), 0.0042, LEG_B, {
      bone: bb,
      sides: 4,
      name: "birdLeg",
    });
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.5;
      const f0 = foot.at.clone().add(new THREE.Vector3(0, 0.003, 0));
      const f1 = f0.clone().add(new THREE.Vector3(Math.sin(a) * 0.022, 0, Math.cos(a) * 0.022));
      b.rod(f0, f1, 0.003, LEG_B, { bone: bb, sides: 4, name: "birdToe" });
    }
  }
  // beak: separate upper and lower
  const beakU = b.joint("beakUpper", { parent: bh, at: bh.local([0, 0.034, 0.008]), dir: bb.dir([0, 1, 0.03]), group: "bird" });
  const beakL = b.joint("beakLower", { parent: bh, at: bh.local([0, 0.034, 0.002]), dir: bb.dir([0, 1, -0.05]), group: "bird" });
  b.spike(beakU.at, bb.dir([0, 1, 0.03]), 0.036, 0.0125, { bone: beakU, color: BEAK, sides: 6, name: "beakUpper" });
  b.spike(beakL.at, bb.dir([0, 1, -0.05]), 0.03, 0.0105, { bone: beakL, color: "#e48a1c", sides: 6, name: "beakLower" });
  b.pose(beakL, { axis: beakL.dir([1, 0, 0]), deg: 22 });
  // tail
  const tailJ = b.joint("birdTail", { parent: bb, at: R(0, -0.05, -0.006), dir: bb.dir([0, -1, -0.28]), role: "tail", group: "bird" });
  b.extrude(
    [
      [0, -0.014],
      [0.07, -0.032, "sharp"],
      [0.058, 0],
      [0.07, 0.032, "sharp"],
      [0, 0.014],
    ],
    {
      at: R(0, -0.05, -0.006),
      x: bb.dir([0, -1, -0.28]),
      y: bb.dir([1, 0, 0]),
      thickness: 0.007,
      bevel: 0.002,
      color: gradient(BLUE_M, BLUE_D, R(0, -0.06, 0), R(0, -0.12, -0.02)),
      bone: tailJ,
      name: "birdTail",
    },
  );
  // crest
  for (let k = 0; k < 3; k++) {
    const o = (k - 1) * 0.011;
    b.spike(bh.local([o, -0.012, 0.036]), bh.dir([o * 6, -0.6, 1]), 0.034 - Math.abs(k - 1) * 0.008, 0.0075, {
      bone: bh,
      color: BLUE_D,
      sides: 5,
      name: "crest",
    });
  }
  // bird feather cards on the breast & back
  const birdSurf = b.surface(b.root.getObjectByName("birdBody") ?? bb.object);
  void birdSurf;

  return b.root;
}

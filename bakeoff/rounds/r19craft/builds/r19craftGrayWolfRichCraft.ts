import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { cells, countershade, gradient, grain, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "A chunky, heroic gray wolf standing alert: oversized head, shoulders and paws, a hand-painted saddle-to-belly coat with warm highlights and cool shadows, fur-card mane and ruff, a studded leather collar with a fang pendant and stitched leather bracers.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// Head layout: every head offset is [forward, up, left] from the skull centre, scaled up for the chunky heroic head.
const HS = 1.15;
const HY = 1.13;
const HZ = 0.74;
const H = (v: number) => v * HS;
const hp = (f: number, u: number, l = 0): P3 => [l * HS, HY + u * HS, HZ + f * HS];

// Flat colours
const LEATHER_DARK = "#3d2414";
const BRASS = "#c8962c";
const GEM = "#c2241c";
const CLAW = "#2a2420";
const FANG = "#f3ecd5";
const NOSE = "#17151a";
const NOSE_SHINE = "#5b5b6b";
const NOSTRIL = "#050507";
const EYE_DARK = "#17110d";
const LIP = "#241c1e";
const WHISKER = "#ece6d3";
const INNER_EAR = "#c9ab8e";
const BROW = "#464750";

const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const KEY = new THREE.Vector3(0.3, 0.85, 0.45).normalize();

// Hand-painted lighting: warm highlight on top, cool shadow underneath, mud near the floor.
const lighten = (c: Rgb, n: THREE.Vector3, p: THREE.Vector3): Rgb => {
  const k = n.dot(KEY);
  const warm = smoothstep(0.45, 0.95, k);
  const cool = smoothstep(0.05, -0.55, k);
  const mud = smoothstep(0.16, 0.0, p.y) * 0.35;
  const keep = 1 - 0.35 * mud;
  return [
    clamp01(c[0] * (1 - 0.45 * cool) * keep + 0.075 * warm + 0.02 * mud),
    clamp01(c[1] * (1 - 0.4 * cool) * keep + 0.055 * warm + 0.012 * mud),
    clamp01(c[2] * (1 - 0.25 * cool) * keep + 0.012 * warm + 0.035 * cool),
  ];
};
const lit = (source: Parameters<typeof resolve>[0]) => paint((p, n) => lighten(resolve(source, p, n), n, p));

// Coat layers
const saddle = grain(mottle("#33363f", "#5a5d63", { size: 0.14, seed: 3 }), "#25272f", { size: 0.01, axis: "z", seed: 5 });
const flank = grain(mottle("#7f7b74", "#a89e88", { size: 0.12, seed: 8, contrast: 1.2 }), "#5e5b57", {
  size: 0.011,
  axis: "z",
  seed: 6,
});
const belly = mottle("#e0d9c3", "#c2b89d", { size: 0.09, seed: 11 });
const tan = grain(mottle("#9a7648", "#bd9966", { size: 0.08, seed: 13 }), "#6f5232", { size: 0.01, axis: "y", seed: 4 });
const topCoat = countershade(saddle, flank, { level: 0.5, soft: 0.25 });
const bodyCoat = countershade(topCoat, belly, { level: -0.3, soft: 0.2 });
const coatBase = paint((p, n) => {
  const edge = 0.46 + 0.03 * zig(p.z / 0.04 + p.x / 0.07) + 0.02 * (noise(p, 0.08, 2) - 0.5);
  if (p.y < edge && p.z > -0.62) {
    if (p.z > 0.15 && n.z > 0.55) return "#2f2a25";
    return tan;
  }
  if (p.x > 0.1 && p.y > 0.6 && p.y < 0.95 && p.z > -0.1 && p.z < 0.3 && n.x > 0.3) {
    const a = p.z - 0.55 * (p.y - 0.78);
    for (const k of [-1, 0, 1]) if (Math.abs(a - 0.1 - k * 0.022) < 0.0045 && Math.abs(p.y - 0.78) < 0.1) return "#d8c6a6";
  }
  return bodyCoat;
});
const coatLit = lit(coatBase);

const headFur = grain(mottle("#7b7870", "#9d937e", { size: 0.07, seed: 21 }), "#55524f", { size: 0.008, axis: "z", seed: 22 });
const bridgeFur = mottle("#4a4846", "#6a635a", { size: 0.05, seed: 23 });
const face = paint((p, n) => {
  const dz = p.z - HZ;
  const dy = p.y - HY;
  const ax = Math.abs(p.x);
  const eyeD = Math.hypot(ax - 0.087, (dy - 0.04) * 1.3, (dz - 0.09) * 0.7);
  if (eyeD < 0.046 && dz > 0.0) return "#2b2723";
  const edge = -0.02 + 0.016 * zig(p.z / 0.02);
  if (dy < edge && dz > -0.02) return belly;
  if (dz > 0.1 && dz < 0.3 && dy < edge + 0.045 && dy > edge && ax < 0.07) {
    const c = cells(p, 0.026, 9);
    if (c.d1 < 0.14) return "#2a2523";
  }
  if (n.y > 0.5 && dz > 0.09 && ax < 0.05) return bridgeFur;
  return headFur;
});
const faceLit = lit(face);

const earBase: Rgb = [0.42, 0.43, 0.44];
const earTip: Rgb = [0.15, 0.15, 0.18];
const earPaint = paint((_p, _n, s) => mix(earBase, earTip, smoothstep(0.06, 0.17, s[1])));

const leather = paint((p, _n, s) => {
  if (Math.abs(s[0]) > 0.029) return LEATHER_DARK;
  const stitch = Math.abs(Math.abs(s[0]) - 0.021) < 0.0018 && (((s[1] / 4) % 1) + 1) % 1 < 0.55;
  if (stitch) return "#e3cf9a";
  return noise(p, 0.03, 4) > 0.6 ? "#8a5a33" : "#6a3f22";
});
const bracerLeather = paint((p, _n, s) => {
  if (Math.abs(s[0]) > 0.02) return LEATHER_DARK;
  const stitch = Math.abs(Math.abs(s[0]) - 0.014) < 0.0016 && (((s[1] / 6) % 1) + 1) % 1 < 0.55;
  if (stitch) return "#e3cf9a";
  return noise(p, 0.025, 7) > 0.6 ? "#8a5a33" : "#6a3f22";
});

// Fur tuft cards: greys, tinted by the coat at each card's root.
const tuftGradient = `<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="0.6" stop-color="#d4d4d4"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>`;
const TUFT_A = svg(
  `<svg viewBox="0 0 32 64">${tuftGradient}<path d="M3 64 C6 44 11 22 20 0 C23 22 28 44 29 64 Z" fill="url(#g)"/><path d="M12 64 C14 48 17 34 20 14" stroke="#787878" stroke-width="1.4" fill="none"/></svg>`,
  { size: 128 },
);
const TUFT_B = svg(
  `<svg viewBox="0 0 32 64">${tuftGradient}<path d="M0 64 C2 44 4 24 7 4 C12 22 14 42 16 64 Z" fill="url(#g)"/><path d="M9 64 C11 40 17 18 26 0 C27 22 27 44 29 64 Z" fill="url(#g)"/><path d="M15 64 C21 52 26 42 31 28 C31 46 30 56 32 64 Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 40">
  <defs>
    <clipPath id="a"><path d="M4 13 C20 3 47 8 61 29 C44 37 20 31 4 13 Z"/></clipPath>
    <radialGradient id="i" cx="0.5" cy="0.55" r="0.55"><stop offset="0" stop-color="#ffd24a"/><stop offset="0.6" stop-color="#e08a14"/><stop offset="1" stop-color="#8a3a08"/></radialGradient>
  </defs>
  <path d="M4 13 C20 3 47 8 61 29 C44 37 20 31 4 13 Z" fill="#17110d"/>
  <g clip-path="url(#a)">
    <circle cx="34" cy="20" r="12.5" fill="url(#i)"/>
    <ellipse cx="34" cy="9" rx="16" ry="6" fill="#17110d" opacity="0.55"/>
    <circle cx="34" cy="20.5" r="5.2" fill="#0d0907"/>
  </g>
  <circle cx="29" cy="15.5" r="2.8" fill="#ffffff"/>
  <circle cx="39.5" cy="25" r="1.3" fill="#ffffff"/>
  <path d="M4 13 C20 3 47 8 61 29" stroke="#17110d" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M5 13 L1 9" stroke="#17110d" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const EAR_OUT: OutlinePoint[] = [
  [-0.055, 0],
  [0.055, 0],
  [0.04, 0.1],
  [0, 0.19, "sharp"],
  [-0.04, 0.1],
];
const EAR_IN: OutlinePoint[] = [
  [-0.032, 0.02],
  [0.032, 0.02],
  [0.022, 0.095],
  [0, 0.145, "sharp"],
  [-0.022, 0.095],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf", paintSize: 2048 });
  const random = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.76, -0.3], dir: [0, 0.02, 1], role: "spine" });
  const spineP = catmull([
    [0, 0.77, -0.16],
    [0, 0.785, 0.04],
    [0, 0.8, 0.2],
    [0, 0.81, 0.34],
  ]);
  const spine = b.chain("spine", spineP, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const chest = spine.joints[2];

  const neckP = catmull([
    [0, 0.83, 0.36],
    [0, 0.93, 0.47],
    [0, 1.03, 0.57],
    [0, 1.08, 0.66],
  ]);
  const neck = b.chain("neck", neckP, { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: neckP.at(1), aim: hp(0.3, -0.04), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.03, -0.085), aim: hp(0.285, -0.098), role: "jaw" });

  const tailP = catmull([
    [0, 0.76, -0.4],
    [0, 0.72, -0.58],
    [0, 0.6, -0.72],
    [0, 0.44, -0.8],
    [0, 0.28, -0.84],
  ]);
  const tail = b.chain("tail", tailP, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ---------------------------------------------------------------- body and neck
  const body = b.loft(
    [
      { at: [0, 0.76, -0.34], w: 0.27, h: 0.3 },
      { at: [0, 0.77, -0.16], w: 0.27, h: 0.28 },
      { at: [0, 0.77, 0.02], w: 0.29, h: 0.34 },
      { at: [0, 0.77, 0.18], w: 0.31, h: 0.42 },
      { at: [0, 0.77, 0.3], w: 0.31, h: 0.44 },
    ],
    { bone: [hips, spine], color: coatLit, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.15, 0.135, 0.118, 0.1], { color: coatLit, name: "neck" });
  const tailTube = b.sweep(tail, [0.06, 0.085, 0.1, 0.085, 0.035], {
    color: lit(gradient(coatBase, "#1c1e25", tailP.at(0.72), tailP.at(1))),
    name: "tail",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), coatLit, {
      bone: chest,
      at: [s * 0.16, 0.72, 0.34],
      scale: [0.09, 0.17, 0.15],
      name: "shoulderMass",
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), coatLit, {
      bone: hips,
      at: [s * 0.16, 0.68, -0.31],
      scale: [0.095, 0.18, 0.19],
      name: "haunchMass",
    });
  }

  // ---------------------------------------------------------------- legs and paws
  const pawBuild = (tip: Joint, x: number, z: number, tag: string) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), coatLit, {
      bone: tip,
      at: [x, 0.05, z + 0.015],
      scale: [0.068, 0.05, 0.085],
      name: `pad${tag}`,
    });
    const dxs = [0.048, 0.016, -0.016, -0.048];
    const lens = [0.05, 0.075, 0.075, 0.05];
    dxs.forEach((dx, i) => {
      const base: P3 = [x + dx, 0.026, z + 0.02];
      const end: P3 = [x + dx * 1.05, 0.024, z + 0.03 + lens[i]];
      const toe = b.joint(`toe${tag}${i + 1}`, { parent: tip, at: base, aim: end, role: "digit" });
      b.capsule(base, end, [0.026, 0.021], { bone: toe, color: coatLit, sides: 6, name: `toe${tag}${i + 1}` });
      b.spike([end[0], 0.024, end[2] + 0.012], [0, -0.22, 1], 0.05, 0.011, {
        bone: toe,
        color: CLAW,
        sides: 5,
        name: `claw${tag}${i + 1}`,
      });
    });
  };

  const legTubes: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg: elbow back, wrist forward
    const fx = s * 0.13;
    const fPts = limb([s * 0.145, 0.7, 0.36], [fx, 0.06, 0.41], [0.3, 0.28, 0.14], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`legF${side}`, fPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [fx, 0, 0.41],
    });
    legTubes.push(b.sweep(front, [0.085, 0.062, 0.048, 0.05], { color: coatLit, name: `legF${side}` }));
    pawBuild(front.joints[front.joints.length - 1], fx, 0.41, `F${side}`);

    // leather bracer on the forearm
    const cp = front.at(0.76);
    const bracer = b.lathe(
      [
        [0.05, -0.026],
        [0.067, -0.023],
        [0.068, 0.023],
        [0.05, 0.026],
      ],
      { at: cp.at, axis: cp.tangent, segments: 10, bone: front.joints[1], color: bracerLeather, name: `bracer${side}` },
    );
    b.ring({ at: cp.at, axis: cp.tangent }, { count: 5, radius: 0.068 }, (item) =>
      b.stick(new THREE.SphereGeometry(0.009, 6, 4), BRASS, item, { embed: 0.45, bone: front.joints[1] }),
    );
    if (!bracer) throw new Error("bracer missing");

    // hind leg: knee forward, hock back
    const hx = s * 0.13;
    const hPts = limb([s * 0.15, 0.74, -0.3], [hx, 0.06, -0.4], [0.3, 0.29, 0.25], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [hx, 0, -0.4],
    });
    legTubes.push(b.sweep(hind, [0.095, 0.07, 0.04, 0.045], { color: coatLit, name: `legH${side}` }));
    pawBuild(hind.joints[hind.joints.length - 1], hx, -0.4, `H${side}`);
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), faceLit, {
    bone: head,
    at: hp(0, 0),
    scale: [H(0.095), H(0.088), H(0.125)],
    name: "skull",
  });
  const muzzle = b.sweep([hp(0.06, -0.004), hp(0.3, -0.045)], (t) => [H(0.062 - 0.026 * t), H(0.053 - 0.022 * t)], {
    bone: head,
    color: faceLit,
    name: "muzzle",
  });
  b.sweep([hp(0.03, -0.085), hp(0.285, -0.098)], (t) => [H(0.047 - 0.022 * t), H(0.031 - 0.011 * t)], {
    bone: jaw,
    color: faceLit,
    name: "lowerJaw",
  });

  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0.318, -0.043),
    scale: [H(0.042), H(0.032), H(0.036)],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE_SHINE, {
    bone: head,
    at: hp(0.315, -0.014),
    scale: [H(0.016), H(0.006), H(0.02)],
    name: "noseShine",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: hp(0.345, -0.04, s * 0.017),
      scale: [H(0.011), H(0.008), H(0.012)],
      name: "nostril",
    });

    // lip line and upper fangs
    b.sweep(muzzle.line(-s * 112, 0.002), 0.0045, { color: LIP, sides: 4, name: "lip" });
    b.stick(new THREE.ConeGeometry(0.013, 0.058, 6), FANG, muzzle.at(0.78, -s * 122, 0), { embed: 0.35, name: "fang" });
    b.stick(new THREE.ConeGeometry(0.008, 0.03, 5), FANG, muzzle.at(0.94, -s * 118, 0), { embed: 0.3, name: "fangSmall" });

    // eye
    const ec = hp(0.075, 0.035, s * 0.075);
    const eyeball = b.part(new THREE.SphereGeometry(1, 8, 6), EYE_DARK, {
      bone: head,
      at: ec,
      scale: H(0.03),
      name: "eyeball",
    });
    const edir = new THREE.Vector3(s * 0.62, 0.1, 0.78).normalize();
    b.decal(eyeball, EYE, {
      at: new THREE.Vector3(ec[0], ec[1], ec[2]).addScaledVector(edir, H(0.03)),
      dir: edir,
      size: [0.052, 0.0325],
      mirror: s > 0,
      name: "eyeDecal",
    });
    b.capsule(hp(0.045, 0.073, s * 0.06), hp(0.115, 0.062, s * 0.095), [H(0.018), H(0.012)], {
      bone: head,
      color: BROW,
      sides: 6,
      name: "brow",
    });

    // whiskers
    for (let k = 0; k < 3; k++) {
      const root = muzzle.at(0.78, -s * (60 + k * 25), 0).at;
      const dir = new THREE.Vector3(s * 0.55, -0.15 - 0.12 * k, -0.6 + 0.2 * k).normalize();
      b.rod(root, root.clone().addScaledVector(dir, 0.15), [0.0035, 0.0008], {
        bone: head,
        color: WHISKER,
        sides: 4,
        name: "whisker",
      });
    }

    // ear on its own hinge joint
    const eb = hp(-0.045, 0.05, s * 0.062);
    const earJ = b.joint(`ear${side}`, { parent: head, at: eb, dir: [s * 0.24, 1, 0], role: "hinge" });
    const a = (14 * Math.PI) / 180;
    const ex: P3 = [Math.cos(a), -s * Math.sin(a), 0];
    const ey: P3 = [s * Math.sin(a), Math.cos(a), 0];
    b.extrude(EAR_OUT, {
      at: eb,
      x: ex,
      y: ey,
      thickness: [0.034, 0.012],
      bevel: 0.006,
      smoothing: 1,
      bone: earJ,
      color: earPaint,
      name: `ear${side}`,
    });
    b.extrude(EAR_IN, {
      at: [eb[0], eb[1], eb[2] + 0.012],
      x: ex,
      y: ey,
      thickness: [0.012, 0.004],
      smoothing: 1,
      bone: earJ,
      color: INNER_EAR,
      name: `earInner${side}`,
    });
  }

  // ---------------------------------------------------------------- collar, plate and fang pendant
  const nj = neck.joints[1];
  const collar = b.lathe(
    [
      [0.125, -0.034],
      [0.156, -0.03],
      [0.158, 0.03],
      [0.125, 0.034],
    ],
    { at: nj, axis: nj.axis, segments: 14, bone: nj, color: leather, name: "collar" },
  );
  b.ring(nj, { count: 11, radius: 0.158 }, (item) =>
    b.stick(new THREE.SphereGeometry(0.013, 6, 4), BRASS, item, { embed: 0.5, name: "collarStud" }),
  );
  const front = b.surface(collar).around(collar.at).at(0, -46);
  if (front) {
    const plate = b.stick(new THREE.BoxGeometry(0.075, 0.014, 0.06), BRASS, front, { embed: 0.3, name: "collarPlate" });
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), GEM, plate.moved([0, 0.008, 0]), { embed: 0.3, name: "collarGem" });
    const pb = new THREE.Vector3(front.at.x, front.at.y - 0.036, front.at.z + 0.012);
    b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 8), BRASS, { bone: nj, at: pb, dir: [0, 0, 1], axis: "z", name: "pendantRing" });
    const top = pb.clone().add(new THREE.Vector3(0, -0.012, 0.003));
    b.sweep(
      catmull([top, top.clone().add(new THREE.Vector3(0, -0.04, 0.012)), top.clone().add(new THREE.Vector3(0, -0.085, 0.006))]),
      [0.019, 0],
      { bone: nj, color: FANG, caps: { start: "flat", end: "point" }, sides: 6, name: "pendant" },
    );
    b.part(new THREE.TorusGeometry(0.019, 0.005, 5, 8), BRASS, {
      bone: nj,
      at: top.clone().add(new THREE.Vector3(0, -0.006, 0.002)),
      dir: [0, 1, 0],
      axis: "z",
      name: "pendantBand",
    });
  }

  // ---------------------------------------------------------------- fur cards
  const bodySurf = b.surface(body);
  b.cards(
    bodySurf.scatter(320, { rng: random, minDist: 0.045, filter: (h) => h.n.y > -0.25 }),
    [TUFT_A, TUFT_B],
    { size: [0.055, 0.085], lean: 72, bend: 25, vary: 0.3, spin: 15, rng: random, color: coatLit, name: "bodyFur" },
  );
  b.cards(
    bodySurf.scatter(70, { rng: random, minDist: 0.04, filter: (h) => h.at.z > 0.2 && h.n.y < 0.1 }),
    TUFT_B,
    { size: [0.05, 0.1], lean: 60, bend: 30, vary: 0.25, rng: random, color: coatLit, name: "chestBib" },
  );
  b.cards(
    Array.from({ length: 10 }, (_, i) => body.at(0.5 + i * 0.05, 0)),
    TUFT_B,
    { size: [0.045, 0.11], lean: 45, bend: 30, vary: 0.25, rng: random, color: coatLit, name: "backRidge" },
  );
  b.cards(
    b.surface(neckTube).scatter(200, { rng: random, minDist: 0.035 }),
    [TUFT_A, TUFT_B],
    { size: [0.06, 0.11], lean: 60, bend: 35, vary: 0.3, spin: 12, rng: random, color: coatLit, name: "neckRuff" },
  );
  const mane = [-38, 0, 38].flatMap((deg) => Array.from({ length: 10 }, (_, i) => neckTube.at(0.04 + i * 0.095, deg)));
  b.cards(mane, TUFT_B, { size: [0.05, 0.15], lean: 48, bend: 30, vary: 0.25, spin: 10, rng: random, color: coatLit, name: "mane" });
  b.cards(
    b.surface(skull).scatter(70, {
      rng: random,
      minDist: 0.03,
      filter: (h) => h.at.z < HZ + 0.03 && Math.abs(h.at.x) > 0.05 && h.n.y < 0.7,
    }),
    TUFT_A,
    { size: [0.04, 0.075], lean: 70, bend: 25, vary: 0.3, rng: random, color: faceLit, name: "cheekRuff" },
  );
  b.cards(
    b.surface(tailTube).scatter(110, { rng: random, minDist: 0.045 }),
    [TUFT_A, TUFT_B],
    { size: [0.045, 0.1], lean: 55, bend: 20, vary: 0.3, spin: 10, rng: random, color: lit(gradient(coatBase, "#1c1e25", tailP.at(0.72), tailP.at(1))), name: "tailFur" },
  );
  for (const tube of legTubes) {
    b.cards(
      b.surface(tube).scatter(24, { rng: random, minDist: 0.045, filter: (h) => h.n.z < -0.25 && h.at.y > 0.3 }),
      TUFT_A,
      { size: [0.04, 0.09], lean: 50, bend: 20, vary: 0.3, rng: random, color: coatLit, name: "legFur" },
    );
  }

  return b.root;
}

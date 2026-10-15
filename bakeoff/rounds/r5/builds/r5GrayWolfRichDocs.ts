import * as THREE from "three";
import { createBuilder, rng, mottle, countershade, gradient, svg, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "Chunky Warcraft-style gray wolf standing alert: rigged spine, neck, jaw, tail and four legs, with a shaggy mane, fur cards, erect ears and amber eyes.",
};

const GRAY_L = "#a3a9b0";
const GRAY = "#6d737a";
const GRAY_D = "#464b52";
const CHAR = "#2b2e33";
const CREAM = "#d3cdbb";
const AMBER = "#ffb02e";
const NOSE = "#15171a";
const IVORY = "#efe8d6";
const CLAW = "#2a2724";
const PAW = "#3f4348";
const EAR_IN = "#7a5a52";

export default function build() {
  const b = createBuilder({ name: "grayWolf" });

  // ---------- paints ----------
  const back = mottle("#7d838b", "#575c64", { size: 0.14, contrast: 0.8, seed: 3 });
  const saddle = mottle("#3a3e44", "#51565d", { size: 0.1, seed: 5 });
  const flank = countershade(back, "#cfc9b8", { level: -0.3, soft: 0.3 });
  const coat = countershade(saddle, flank, { level: 0.6, soft: 0.2 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.7, -0.55] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.7, -0.55],
      [0, 0.7, -0.25],
      [0, 0.69, 0.05],
      [0, 0.72, 0.35],
      [0, 0.76, 0.62],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.76, 0.62],
      [0, 0.86, 0.76],
      [0, 0.97, 0.88],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.05, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.1, -0.05), aim: hp(0.3, -0.06), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.72, -0.55],
      [0, 0.68, -0.8],
      [0, 0.55, -1.02],
      [0, 0.4, -1.14],
      [0, 0.25, -1.18],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.7, -0.62], w: 0.18, h: 0.24 },
      { at: [0, 0.7, -0.45], w: 0.3, h: 0.36 },
      { at: [0, 0.68, -0.15], w: 0.24, h: 0.3 },
      { at: [0, 0.67, 0.15], w: 0.3, h: 0.38 },
      { at: [0, 0.7, 0.42], w: 0.36, h: 0.46 },
      { at: [0, 0.76, 0.62], w: 0.28, h: 0.38 },
    ],
    { bone: spine, color: coat },
  );
  const neckTube = b.sweep(neck, [0.15, 0.13, 0.11], { color: coat });

  const tailTube = b.sweep(tail, [0.05, 0.09, 0.115, 0.1, 0.06, 0.02], {
    bands: [
      [0.78, coat],
      [1, "#202327"],
    ],
    caps: { start: "round", end: "point" },
  });

  // ---------- head ----------
  const skull = b.loft(
    [
      { at: hp(-0.04, 0.03), w: 0.21, h: 0.21 },
      { at: hp(0.09, 0.04), w: 0.2, h: 0.2 },
      { at: hp(0.2, 0.0), w: 0.12, h: 0.11 },
      { at: hp(0.31, -0.02), w: 0.095, h: 0.085 },
    ],
    { bone: head, color: gradient(coat, "#bdb9ac", hp(0.12, 0), hp(0.26, 0)) },
  );
  void skull;

  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: hp(0.325, -0.005),
    scale: [0.05, 0.04, 0.038],
    bone: head,
    flat: true,
  });

  // lower jaw with tongue
  b.frustumBox(hp(0.1, -0.065), hp(0.29, -0.075), [0.11, 0.05], [0.07, 0.04], { bone: jaw, color: CREAM });
  b.frustumBox(hp(0.12, -0.04), hp(0.25, -0.05), [0.05, 0.015], [0.04, 0.012], { bone: jaw, color: "#b5525c" });

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    void sd;
    // fangs
    b.spike(hp(0.255, -0.05, s * 0.052), [0, -1, 0], 0.055, 0.012, { bone: head, color: IVORY });
    b.spike(hp(0.265, -0.045, s * 0.032), [0, 1, 0], 0.07, 0.011, { bone: jaw, color: IVORY });

    // eyes
    b.part(new THREE.SphereGeometry(0.024, 8, 6), AMBER, {
      at: hp(0.115, 0.05, s * 0.085),
      scale: [1, 0.9, 1.25],
      bone: head,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), NOSE, {
      at: hp(0.13, 0.05, s * 0.102),
      bone: head,
      flat: true,
    });
    // angry brow
    b.rod(hp(0.13, 0.125, s * 0.04), hp(0.07, 0.09, s * 0.095), 0.015, CHAR, { bone: head });

    // ears
    const earOutline: [number, number][] = [
      [-0.06, 0],
      [0.06, 0],
      [0.065, 0.1],
      [0.05, 0.23],
      [-0.02, 0.12],
    ];
    const earIn: [number, number][] = [
      [-0.03, 0.02],
      [0.04, 0.02],
      [0.045, 0.1],
      [0.04, 0.17],
      [-0.005, 0.11],
    ];
    b.extrude(earOutline, {
      at: hp(-0.02, 0.11, s * 0.07),
      x: [s, 0, 0],
      y: [0, 0.98, -0.2],
      thickness: [0.035, 0.012],
      color: GRAY,
      bone: head,
    });
    b.extrude(earIn, {
      at: hp(-0.006, 0.11, s * 0.07),
      x: [s, 0, 0],
      y: [0, 0.98, -0.2],
      thickness: [0.016, 0.004],
      color: EAR_IN,
      bone: head,
    });

    // cheek tufts
    const tuft: [number, number][] = [
      [0.04, 0.05],
      [0.04, -0.05],
      [-0.04, -0.06],
      [-0.09, -0.13],
      [-0.1, -0.04],
      [-0.18, -0.06],
      [-0.11, 0.01],
      [-0.17, 0.06],
      [-0.07, 0.05],
    ];
    b.extrude(tuft, {
      at: hp(0.07, -0.01, s * 0.1),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      color: "#aab0b6",
      bone: head,
    });
  }

  // brow crest spikes
  for (let i = 0; i < 3; i++) {
    b.spike(hp(-0.02 + i * 0.05, 0.135), [0, 0.5, -1], 0.08 - i * 0.012, 0.025, {
      bone: head,
      color: i % 2 ? GRAY_D : CHAR,
    });
  }

  // ---------- mane / ruff ----------
  const maneCols = ["#8b9097", "#6b7078", "#a7acb2"];
  b.ring(neck.at(0.45), { count: 12, radius: 0.1, tilt: -55 }, (it) =>
    b.spike(it, it, 0.19, 0.04, { color: maneCols[it.i % 3] }),
  );
  b.ring(neck.at(0.75), { count: 10, radius: 0.09, tilt: -50 }, (it) =>
    b.spike(it, it, 0.14, 0.032, { color: maneCols[(it.i + 1) % 3] }),
  );
  b.ring(neck.at(0.1), { count: 7, radius: 0.13, fromDeg: 90, toDeg: 270, tilt: -45 }, (it) =>
    b.spike(it, it, 0.17, 0.042, { color: it.i % 2 ? CREAM : "#e6e0cf" }),
  );

  // dorsal crest
  const bodySurf = b.surface(body);
  for (let i = 0; i < 9; i++) {
    const z = -0.4 + i * 0.12;
    const h = bodySurf.ray([0, 2, z], [0, -1, 0]);
    if (!h) continue;
    const k = i / 8;
    b.spike(h, [0, 0.6, -0.8], 0.08 + 0.1 * k, 0.035, { color: i % 2 ? CHAR : GRAY_D });
  }

  // ---------- legs ----------
  const pawBuild = (leg: { joints: any[] }, x: number, z: number) => {
    const bone = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
      at: [x, 0.043, z + 0.04],
      scale: [0.062, 0.045, 0.09],
      bone,
      flat: true,
    });
    for (const tx of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), PAW, {
        at: [x + tx * 0.03, 0.036, z + 0.11],
        scale: [0.026, 0.03, 0.035],
        bone,
        flat: true,
      });
      b.spike([x + tx * 0.03, 0.03, z + 0.14], [0, -0.3, 1], 0.055, 0.012, { bone, color: CLAW });
    }
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // front leg
    const fz = 0.48;
    const fpts = limb(
      [s * 0.15, 0.64, 0.45],
      [s * 0.15, 0.06, fz],
      [0.26, 0.24, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fleg = b.chain(`legF${sd}`, fpts, {
      parent: spine.joints[3],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `pawF${sd}`],
      role: "leg",
      contact: [s * 0.15, 0, fz],
    });
    b.sweep(fleg, [0.09, 0.065, 0.052, 0.045, 0.05], {
      color: gradient(coat, PAW, [0, 0.4, 0], [0, 0.12, 0]),
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      at: [s * 0.18, 0.66, 0.45],
      scale: [0.09, 0.2, 0.18],
      bone: fleg.joints[0],
    });
    b.spike(fleg.joints[0], [s * 0.6, 0.2, -1], 0.28, 0.05, { color: GRAY_L });
    b.spike(fleg.joints[1], [0, -0.4, -1], 0.14, 0.035, { color: GRAY_L });
    pawBuild(fleg, s * 0.15, fz);

    // hind leg
    const hz = -0.56;
    const hpts = limb(
      [s * 0.16, 0.68, -0.42],
      [s * 0.15, 0.06, hz],
      [0.3, 0.3, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hleg = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `pawH${sd}`],
      role: "leg",
      contact: [s * 0.15, 0, hz],
    });
    b.sweep(hleg, [0.11, 0.08, 0.06, 0.045, 0.05], {
      color: gradient(coat, PAW, [0, 0.45, 0], [0, 0.12, 0]),
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      at: [s * 0.17, 0.62, -0.42],
      scale: [0.1, 0.2, 0.2],
      bone: hleg.joints[0],
    });
    b.spike(hleg.joints[2], [0, 0.2, -1], 0.14, 0.04, { color: GRAY_L });
    pawBuild(hleg, s * 0.15, hz);
  }

  // ---------- fur cards ----------
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M2 64 C6 40 12 18 16 0 C20 18 26 40 30 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface([body, neckTube]).scatter(220, {
    rng: rng(3),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.15,
  });
  b.cards(hits, tuftTex, { size: [0.06, 0.12], lean: 70, bend: 25, vary: 0.3, rng: rng(4), color: coat });
  const tailHits = b.surface(tailTube).scatter(80, {
    rng: rng(5),
    minDist: 0.04,
    filter: (h) => h.n.y > -0.3,
  });
  b.cards(tailHits, tuftTex, { size: [0.06, 0.12], lean: 75, bend: 25, vary: 0.3, rng: rng(6), color: coat });

  // ---------- rest pose ----------
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  return b.root;
}

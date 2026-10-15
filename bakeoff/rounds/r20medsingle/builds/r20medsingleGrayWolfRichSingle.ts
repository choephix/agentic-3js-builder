import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "A big, chunky hand-painted gray wolf standing alert: oversized paws, shoulders and head, ruffed mane of fur cards, painted saddle, tan legs, amber glowing eyes, notched ear and battle scars.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette: saturated, cool blue-grays with warm tan and cream, painted highlight/shadow.
const GRAY = "#76849a";
const GRAY_LIGHT = "#a9b6c8";
const DARK = "#2f3748";
const DARK_BACK = "#3b4358";
const TAN = "#b48f5e";
const CREAM = "#eee3c8";
const FACE = "#8d8f9c";
const FACE_LIGHT = "#c9c4b4";
const SCAR = "#d7897f";
const TIP_DARK = "#232733";
const NOSE = "#17161c";
const PAWC = "#4a4550";
const CLAW = "#2b2723";
const IVORY = "#f3ead2";
const EYE_RIM = "#20242f";
const AMBER = "#ffb21c";
const BLACK = "#0b0b10";
const WHITE = "#ffffff";
const BROW = "#2a303d";
const EAR_IN = "#d9a79a";
const MOUTH = "#4a1a24";

const EAR_OUT: OutlinePoint[] = [
  [-0.045, 0],
  [0.045, 0],
  [0.035, 0.075],
  [0.004, 0.15, "sharp"],
  [-0.036, 0.07],
];
const EAR_NOTCH: OutlinePoint[] = [
  [-0.045, 0],
  [0.045, 0],
  [0.035, 0.075],
  [0.004, 0.15, "sharp"],
  [-0.006, 0.115, "sharp"],
  [-0.018, 0.126, "sharp"],
  [-0.036, 0.07],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.028, 0.012],
  [0.028, 0.012],
  [0.02, 0.06],
  [0, 0.118, "sharp"],
  [-0.02, 0.06],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf" });

  // ---------------------------------------------------------------- paints
  const FUR = grain(GRAY, GRAY_LIGHT, { size: 0.014, axis: "z", seed: 3 });
  const coat = paint((p, n) => {
    const base = resolve(FUR, p, n);
    const wob = noise(p, 0.09, 4);
    const up = smoothstep(0.1, 0.7, n.y + (wob - 0.5) * 0.7);
    let c = mix(base, DARK_BACK, up * 0.78);
    c = mix(c, TAN, smoothstep(0.2, 0.8, wob) * 0.25 * (1 - up));
    const low = smoothstep(-0.15, -0.65, n.y + (noise(p, 0.07, 8) - 0.5) * 0.3);
    c = mix(c, CREAM, low);
    c = mix(c, GRAY_LIGHT, smoothstep(0.75, 1, n.y) * 0.2);
    // chest bib
    c = mix(c, CREAM, smoothstep(0.3, 0.85, n.z) * smoothstep(0.35, 0.5, p.z) * 0.7 * smoothstep(0.9, 0.55, p.y));
    // three old claw scars on the left flank
    if (n.x > 0.5 && Math.abs(p.y - 0.74) < 0.12) {
      const a = p.z - 0.8 * (p.y - 0.74) - 0.05;
      const k = Math.round(a / 0.045);
      if (k >= -1 && k <= 1 && Math.abs(a - k * 0.045) < 0.005) c = mix(c, SCAR, 0.8);
    }
    return c;
  });

  const legPaint = paint((p, n) => {
    const low = smoothstep(0.55, 0.15, p.y);
    let c = mix(mix(GRAY, GRAY_LIGHT, 0.25), TAN, low * 0.85);
    if (p.z > 0) c = mix(c, DARK, smoothstep(0.5, 0.85, n.z) * 0.6);
    c = mix(c, PAWC, smoothstep(0.1, 0.02, p.y) * 0.5);
    return mix(resolve(coat, p, n), c, smoothstep(0.62, 0.42, p.y));
  });

  const face = paint((p, n) => {
    let c = mix(FACE, FACE_LIGHT, smoothstep(0.9, 1.1, p.z) * 0.6);
    // dark nose bridge
    if (Math.abs(p.x) < 0.02 && n.y > 0.3 && p.z > 0.95) c = mix(c, DARK, 0.55);
    // pale eyebrow spots
    for (const sx of [1, -1]) {
      const dx = p.x - sx * 0.07;
      const dy = p.y - 1.125;
      const dz = p.z - 0.95;
      if (dx * dx + dy * dy + dz * dz < 0.025 * 0.025) c = mix(c, GRAY_LIGHT, 0.85);
    }
    // dark lips-line and cream lower face
    c = mix(c, CREAM, smoothstep(-0.1, -0.6, n.y));
    c = mix(c, GRAY, 0.0);
    return c;
  });

  const earP = paint((_p, _n, s) => mix(GRAY, TIP_DARK, smoothstep(0.08, 0.15, s[1])));

  const tailCoat = paint((p, n) => mix(resolve(coat, p, n), TIP_DARK, smoothstep(-0.92, -1.04, p.z)));

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.74, -0.42] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.42],
      [0, 0.74, -0.1],
      [0, 0.77, 0.22],
      [0, 0.78, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    [
      [0, 0.78, 0.5],
      [0, 0.93, 0.65],
      [0, 1.04, 0.78],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.965, 0.84], aim: [0, 0.95, 1.08], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.45],
      [0, 0.7, -0.75],
      [0, 0.55, -1.0],
      [0, 0.38, -1.15],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------------------------------------------------------------- body, neck, tail
  b.sweep(spine, (t) => [0.13 + 0.045 * Math.sin(Math.min(t, 1) * Math.PI * 0.8), 0.15 + 0.055 * t], {
    color: coat,
    shift: (t) => [0, -0.02 - 0.02 * t],
  });
  const neckSweep = b.sweep(neck, [0.13, 0.115, 0.095], { color: coat });
  const tailSweep = b.sweep(tail, [0.06, 0.085, 0.085, 0.045], { color: tailCoat });

  // haunches and shoulders: chunky masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hips,
      at: [s * 0.16, 0.64, -0.4],
      scale: [0.11, 0.19, 0.2],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: chest,
      at: [s * 0.16, 0.68, 0.46],
      scale: [0.1, 0.17, 0.16],
    });
  }

  // ---------------------------------------------------------------- legs
  const pawBuild = (joint: typeof hips, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), PAWC, {
      bone: joint,
      at: [x, 0.05, z + 0.04],
      scale: [1.0, 0.65, 1.45],
    });
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * 0.036;
      const zz = z + 0.11 + (i === 1 || i === 2 ? 0.014 : 0);
      b.part(new THREE.SphereGeometry(0.03, 6, 5), PAWC, {
        bone: joint,
        at: [x + off, 0.03, zz],
        scale: [1, 0.9, 1.25],
      });
      b.spike([x + off, 0.022, zz + 0.03], [0, -0.35, 1], 0.045, 0.0085, { color: CLAW, bone: joint, detail: 0.6 });
    }
  };

  const legBuild = (
    side: string,
    s: number,
    root: number[],
    foot: number[],
    lengths: number[],
    bends: number[][],
    parent: typeof hips,
    names: string[],
    radii: number[],
    seed: number,
  ) => {
    const pts = limb(root, foot, lengths, bends);
    const leg = b.chain(`leg${side}`, pts, { parent, names, role: "leg", contact: [foot[0], 0, foot[2]] });
    const sw = b.sweep(leg, radii, { color: legPaint });
    const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
    pawBuild(tip, foot[0], foot[2]);
    const hits = b.surface(sw).scatter(26, {
      rng: rng(seed),
      minDist: 0.035,
      filter: (h) => h.n.z < -0.2 && h.at.y > 0.25,
    });
    b.cards(hits, tuft, { size: [0.045, 0.09], lean: 60, bend: 20, vary: 0.3, rng: rng(seed + 1), color: coat });
    return s;
  };

  const tuftMarkup = (path: string) =>
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="${path}" fill="url(#g)"/></svg>`;
  const tuft = svg(tuftMarkup("M2 64 C4 40 10 18 16 0 C22 18 28 40 30 64 Z"), { size: 96 });
  const tuftCurl = svg(tuftMarkup("M4 64 C2 40 12 16 28 2 C24 20 26 44 28 64 Z"), { size: 96 });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    legBuild(
      `F${S}`,
      s,
      [s * 0.15, 0.7, 0.46],
      [s * 0.15, 0.11, 0.52],
      [0.3, 0.28, 0.2],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      chest,
      [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
      [0.085, 0.07, 0.05, 0.045, 0.045],
      40 + (s > 0 ? 0 : 5),
    );
    legBuild(
      `H${S}`,
      s,
      [s * 0.14, 0.7, -0.42],
      [s * 0.14, 0.11, -0.5],
      [0.27, 0.28, 0.26],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      hips,
      [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      [0.085, 0.06, 0.042, 0.04, 0.04],
      60 + (s > 0 ? 0 : 5),
    );
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), face, {
    bone: head,
    at: [0, 1.05, 0.86],
    scale: [0.105, 0.1, 0.115],
  });
  b.sweep(
    [
      [0, 1.035, 0.93],
      [0, 1.0, 1.105],
    ],
    (t) => [0.062 - 0.024 * t, 0.055 - 0.02 * t],
    { bone: head, color: face, caps: "round" },
  );
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: [0, 1.015, 1.12], scale: [1.15, 0.8, 0.9] });
  // mouth interior and lower jaw
  b.rod([0, 0.975, 0.9], [0, 0.97, 1.07], 0.028, { color: MOUTH, bone: head });
  b.sweep(
    [
      [0, 0.955, 0.84],
      [0, 0.945, 1.08],
    ],
    (t) => [0.05 - 0.022 * t, 0.036 - 0.012 * t],
    { bone: jaw, color: face, caps: "round" },
  );
  // teeth
  for (const s of [1, -1]) {
    b.spike([s * 0.035, 0.99, 1.05], [0, -1, 0.1], 0.045, 0.01, { color: IVORY, bone: head, detail: 0.6 });
    b.spike([s * 0.028, 0.95, 1.05], [0, 1, 0.15], 0.04, 0.009, { color: IVORY, bone: jaw, detail: 0.6 });
  }
  for (const x of [-0.016, 0, 0.016]) {
    b.spike([x, 0.99, 1.085], [0, -1, 0], 0.02, 0.007, { color: IVORY, bone: head, detail: 0.6 });
    b.spike([x * 0.9, 0.95, 1.075], [0, 1, 0], 0.018, 0.007, { color: IVORY, bone: jaw, detail: 0.6 });
  }

  // eyes, brows
  const sk = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = sk.around(skull.at).at(s * 50, 14);
    if (!hit) continue;
    const at = (d: number) => offset(hit, hit, d);
    b.part(new THREE.SphereGeometry(0.032, 8, 6), EYE_RIM, { bone: head, at: at(-0.002) });
    glow(b.part(new THREE.SphereGeometry(0.024, 8, 6), AMBER, { bone: head, at: at(0.008) }), 0.7);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BLACK, { bone: head, at: at(0.027) });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, {
      bone: head,
      at: at(0.037).add(new THREE.Vector3(-s * 0.004, 0.006, 0.005)),
    });
    const base = at(0.012);
    b.capsule(
      base.clone().add(new THREE.Vector3(-s * 0.035, 0.032, 0.015)),
      base.clone().add(new THREE.Vector3(s * 0.03, 0.04, -0.012)),
      0.01,
      { color: BROW, bone: head },
    );
  }

  // ears, left one notched
  for (const s of [1, -1]) {
    const x = [1, -0.2 * s, 0];
    const y = [0.2 * s, 1, -0.25];
    b.extrude(s > 0 ? EAR_NOTCH : EAR_OUT, {
      at: [s * 0.07, 1.105, 0.82],
      x,
      y,
      thickness: 0.024,
      bevel: 0.006,
      color: earP,
      bone: head,
    });
    b.extrude(EAR_INNER, {
      at: [s * 0.07, 1.108, 0.832],
      x,
      y,
      thickness: 0.012,
      bevel: 0.003,
      color: EAR_IN,
      bone: head,
    });
  }

  // ---------------------------------------------------------------- fur cards
  const furs = [tuft, tuftCurl];
  const neckHits = b.surface(neckSweep).scatter(110, { rng: rng(21), minDist: 0.028, filter: (h) => h.n.y > -0.5 });
  b.cards(neckHits, furs, { size: [0.055, 0.11], lean: 50, bend: 25, vary: 0.3, spin: 20, rng: rng(22), color: coat });

  const cheekHits = sk.scatter(40, {
    rng: rng(23),
    minDist: 0.03,
    filter: (h) => h.at.z < 0.9 && Math.abs(h.at.x) > 0.05 && h.n.y > -0.3,
  });
  b.cards(cheekHits, furs, {
    size: [0.04, 0.08],
    lean: 70,
    flow: [0, 0, -1],
    vary: 0.3,
    rng: rng(24),
    color: face,
  });

  const bodySurface = b.surface(b.root);
  void bodySurface;
  const torso = b.surface(hips);
  void torso;

  const backHits = b.surface(spine.joints[1]).scatter(170, {
    rng: rng(31),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.1,
  });
  b.cards(backHits, furs, { size: [0.05, 0.11], lean: 75, bend: 20, vary: 0.3, spin: 25, rng: rng(32), color: coat });

  const chestHits = b.surface(spine.joints[2]).scatter(70, {
    rng: rng(33),
    minDist: 0.04,
    filter: (h) => h.at.z > 0.25 && h.n.z > 0.15 && h.n.y < 0.6,
  });
  b.cards(chestHits, furs, {
    size: [0.06, 0.12],
    lean: 35,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.3,
    rng: rng(34),
    color: coat,
  });

  const tailHits = b.surface(tailSweep).scatter(90, { rng: rng(35), minDist: 0.035 });
  b.cards(tailHits, furs, {
    size: [0.05, 0.12],
    lean: 65,
    bend: 20,
    vary: 0.3,
    spin: 20,
    rng: rng(36),
    color: tailCoat,
  });

  // slightly parted jaw
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });

  return b.root;
}

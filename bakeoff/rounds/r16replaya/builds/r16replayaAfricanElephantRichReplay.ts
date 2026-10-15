import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { mix, mottle, noise, paint, resolve, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult African bush elephant bull: faceted barrel body, columnar legs with toenails, huge Africa-shaped ears with painted veins, ringed trunk, curved ivory tusks and a tufted tail, fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

// palette ------------------------------------------------------------------------------------------------------
const SK1 = "#8e887e";
const SK2 = "#7d776e";
const CRACK = "#645f58";
const DARK = "#5b5650";
const DUST = "#a3836a";
const DUST_HI = "#b39b83";
const PINK = "#b79a93";
const PINK_DK = "#a07f7b";
const LIP = "#a1928a";
const IVORY = "#f0e7d0";
const IVORY_LO = "#cdbb8d";
const IVORY_TIP = "#8a775a";
const NAIL = "#d9cfb9";
const NAIL_DK = "#b3a68c";
const HAIR = "#2b2521";
const EYE = "#7a4a22";
const PUPIL = "#1a1411";
const MOUTH = "#4a3a36";
const NOSTRIL = "#3a2f2c";

const hideBase = scales(mottle(SK1, SK2, { size: 0.9, seed: 4, contrast: 1.2 }), CRACK, {
  size: 0.28,
  width: 0.1,
  seed: 8,
});
// grey hide, dusted red-brown on the lower legs and pale on the sun-faded back, darker underneath
const hide = paint((p, n) => {
  let c = resolve(hideBase, p, n);
  c = mix(c, DUST, smoothstep(1.25, 0.12, p.y) * 0.8 * (0.7 + 0.5 * noise(p, 0.35, 21)));
  c = mix(c, DUST_HI, smoothstep(0.35, 0.95, n.y) * 0.3 * noise(p, 0.6, 33));
  c = mix(c, DARK, smoothstep(-0.2, -0.9, n.y) * 0.45);
  return c;
});

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const R = rng(11);

  // skeleton: spine --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.5, -1.3], aim: [0, 2.55, -0.35], role: "spine" });
  const spinePts = catmull([
    [0, 2.5, -1.3],
    [0, 2.55, -0.35],
    [0, 2.6, 0.55],
    [0, 2.6, 1.2],
  ]);
  const spine = b.chain("spine", spinePts, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const neckPts = catmull([
    [0, 2.6, 1.2],
    [0, 2.66, 1.55],
    [0, 2.7, 1.88],
  ]);
  const neck = b.chain("neck", neckPts, {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const head = neck.tip!;

  // body: faceted barrel --------------------------------------------------------------------------------------
  const st = (z: number, top: number, bot: number, w: number) => ({ at: [0, (top + bot) / 2, z], w, h: top - bot });
  const body = b.loft(
    [
      st(-2.2, 2.98, 2.15, 0.7),
      st(-1.85, 3.22, 1.8, 1.4),
      st(-1.3, 3.32, 1.5, 1.66),
      st(-0.4, 3.16, 1.36, 1.62),
      st(0.45, 3.24, 1.38, 1.62),
      st(1.0, 3.3, 1.55, 1.5),
      st(1.5, 3.2, 1.9, 1.15),
      st(1.85, 3.05, 2.2, 0.9),
    ],
    { bone: [hips, spine, neck], sides: 10, smooth: false, color: hide, name: "body" },
  );

  // head ------------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      st(1.45, 3.28, 2.1, 1.0),
      st(1.8, 3.42, 1.98, 1.06),
      st(2.15, 3.36, 1.9, 0.96),
      st(2.45, 2.95, 1.9, 0.66),
    ],
    { bone: head, sides: 10, smooth: false, color: hide, name: "skull" },
  );
  // twin domed forehead lobes and cheek masses
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      bone: head,
      at: [sx * 0.24, 3.22, 1.98],
      scale: [0.3, 0.26, 0.34],
      flat: true,
      name: "foreheadLobe",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      bone: head,
      at: [sx * 0.4, 2.42, 2.05],
      scale: [0.2, 0.28, 0.3],
      flat: true,
      name: "cheek",
    });
    // brow ridge
    b.rod([sx * 0.18, 3.02, 2.3], [sx * 0.46, 2.88, 2.12], [0.07, 0.07], { bone: head, color: hide, sides: 5, name: "brow" });
  }

  // lower jaw (separate part, opens at the jaw joint)
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 1.85], aim: [0, 1.82, 2.4], role: "jaw" });
  b.frustumBox([0, 1.86, 1.95], [0, 1.8, 2.42], [0.6, 0.3], [0.38, 0.26], { bone: jaw, color: LIP, name: "lowerJaw" });
  b.frustumBox([0, 1.74, 2.35], [0, 1.72, 2.52], [0.32, 0.14], [0.24, 0.12], { bone: jaw, color: PINK, name: "lowerLip" });
  for (const sx of [1, -1])
    b.rod([sx * 0.31, 2.0, 2.05], [sx * 0.26, 1.96, 2.4], 0.022, { bone: head, color: MOUTH, sides: 4, name: "mouthLine" });

  // trunk ------------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.5, 2.3],
    [0, 2.15, 2.62],
    [0, 1.7, 2.86],
    [0, 1.2, 2.96],
    [0, 0.75, 2.95],
    [0, 0.42, 3.08],
    [0, 0.22, 3.36],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunkTip"],
    role: "tentacle",
  });
  const trunkLen = trunkPath.length;
  const trunkPaint = paint((p, n, s) => {
    const base = resolve(hide, p, n);
    const f = (s[0] * trunkLen) / 0.13 - Math.floor((s[0] * trunkLen) / 0.13);
    let c = mix(base, DARK, smoothstep(0.35, 0.05, f) * 0.55);
    const under = smoothstep(120, 160, s[1]) * smoothstep(240, 200, s[1]);
    c = mix(c, PINK, under * 0.6 * smoothstep(0.1, 0.4, s[0]));
    return c;
  });
  const trunkSweep = b.sweep(trunk, [0.3, 0.28, 0.24, 0.2, 0.17, 0.14, 0.115, 0.1], {
    sides: 8,
    smooth: false,
    color: trunkPaint,
    caps: "flat",
    name: "trunk",
  });
  // raised skin ridges along the trunk
  const tsurf = b.surface(trunkSweep);
  for (let i = 0; i < 14; i++) {
    const t = 0.1 + i * 0.062;
    b.sweep(tsurf.loop(trunk.at(t), { lift: 0.004 }), 0.022 - t * 0.008, {
      color: SK2,
      sides: 5,
      smooth: false,
      name: "trunkRidge",
    });
  }
  // trunk finger tip
  const tEnd = trunkPath.at(1);
  const tTan = trunkPath.tangentAt(1);
  const tipJ = trunk.tip!;
  const dir = (v: number[]) => new THREE.Vector3(...v).normalize();
  b.spike(tEnd, dir([0, 0.35, 1]), 0.14, 0.05, { bone: tipJ, color: SK1, sides: 6, smooth: false, name: "fingerUpper" });
  b.spike(tEnd, dir([0, -0.5, 1]), 0.09, 0.04, { bone: tipJ, color: SK2, sides: 6, smooth: false, name: "fingerLower" });
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 8), NOSTRIL, {
    bone: tipJ,
    at: [tEnd.x, tEnd.y, tEnd.z],
    dir: [tTan.x, tTan.y, tTan.z],
    scale: [1, 1, 1.5],
    name: "nostril",
  });

  // tusks ------------------------------------------------------------------------------------------------------
  const tuskPaint = paint((p, n, s) => {
    let c = mix(IVORY_LO, IVORY, smoothstep(0.0, 0.45, s[0]));
    c = mix(c, IVORY_TIP, smoothstep(0.93, 1.0, s[0]));
    c = mix(c, IVORY_LO, smoothstep(0.35, 0.7, noise(p, 0.07, 5)) * 0.35);
    return mix(c, IVORY_LO, smoothstep(120, 180, s[1]) * 0.3);
  });
  for (const sx of [1, -1]) {
    const tp = catmull([
      [sx * 0.28, 2.02, 2.2],
      [sx * 0.4, 1.68, 2.72],
      [sx * 0.5, 1.42, 3.32],
      [sx * 0.47, 1.5, 3.95],
    ]);
    b.sweep(tp, [0.115, 0.0], { bone: head, color: tuskPaint, sides: 7, smooth: false, caps: "flat", name: "tusk" });
    const t0 = tp.at(0);
    const t1 = tp.tangentAt(0);
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 8), PINK_DK, {
      bone: head,
      at: [t0.x + t1.x * 0.1, t0.y + t1.y * 0.1, t0.z + t1.z * 0.1],
      dir: [t1.x, t1.y, t1.z],
      flat: true,
      name: "tuskSocket",
    });
  }

  // ears ------------------------------------------------------------------------------------------------------
  const earOutline: [number, number][] = [
    [0, 0.62],
    [0.32, 0.78],
    [0.78, 0.7],
    [1.08, 0.46],
    [1.16, 0.06],
    [1.04, -0.38],
    [0.84, -0.7],
    [0.55, -1.1],
    [0.34, -0.92],
    [0.16, -0.5],
    [0, -0.15],
  ];
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const earJ = b.joint(`ear${side}`, {
      parent: head,
      at: [sx * 0.5, 3.0, 1.72],
      dir: [0, 1, 0],
      role: "hinge",
    });
    const ex = [sx * 0.44, 0, -1];
    const ey = [sx * 0.1, 1, 0];
    const thick = new THREE.Vector3(...ex).cross(new THREE.Vector3(...ey)).normalize();
    const outward = thick.x * sx > 0 ? 1 : -1; // +1: face thick points away from the head
    const earPaint = paint((p, n, s) => {
      const face = n.dot(thick) * outward;
      if (Math.abs(face) < 0.5) return DARK; // rolled rim
      const base = resolve(hide, p, n);
      if (face > 0) return mix(base, DUST_HI, 0.15 * noise(p, 0.3, 4));
      const veins = 1 - smoothstep(0.0, 0.035, Math.abs(noise(p, 0.28, 12) - 0.5));
      const fine = 1 - smoothstep(0.0, 0.03, Math.abs(noise(p, 0.12, 19) - 0.5));
      const inner = mix(PINK, PINK_DK, smoothstep(0.2, 1.0, s[0] * 0.0 + noise(p, 0.5, 3)));
      return mix(inner, PINK_DK, Math.max(veins * 0.9, fine * 0.5));
    });
    const ear = b.extrude(earOutline, {
      at: [sx * 0.5, 3.0, 1.72],
      x: ex,
      y: ey,
      thickness: 0.05,
      bevel: 0.015,
      smoothing: 1,
      color: earPaint,
      bone: earJ,
      name: "ear",
    });
    // cartilage rib along the root edge and a fold across the ear
    b.rod([sx * 0.5, 3.64, 1.75], [sx * 0.5, 2.0, 1.7], 0.065, { bone: earJ, color: hide, sides: 5, smooth: false, name: "earRoot" });
    void ear;
  }

  // eyes ------------------------------------------------------------------------------------------------------
  const skullSurf = b.surface(skull);
  const lashCard = svg(
    `<svg viewBox="0 0 24 48"><path d="M3 48 L7 48 L9 4 Z" fill="#2b2521"/><path d="M10 48 L15 48 L12 0 Z" fill="#2b2521"/><path d="M17 48 L21 48 L15 6 Z" fill="#2b2521"/></svg>`,
    { size: 96 },
  );
  for (const sx of [1, -1]) {
    const hit = skullSurf.ray([sx * 1.5, 2.62, 2.12], [-sx, 0, 0]);
    if (!hit) throw new Error("eye ray missed");
    b.stick(new THREE.SphereGeometry(0.06, 8, 6), EYE, hit, { embed: 0.55, name: "eye" });
    b.stick(new THREE.SphereGeometry(0.032, 6, 4), PUPIL, hit.moved([0, 0.03, 0]), { embed: 0.4, name: "pupil" });
    const lid = b.ring(hit, { count: 8, radius: 0.095 });
    b.sweep(THREE.Object3D.prototype && catmull(lid.items, { closed: true }), 0.017, {
      color: DARK,
      sides: 5,
      smooth: false,
      name: "eyelid",
    });
    b.ring(hit, { count: 7, radius: 0.075, fromDeg: -80, toDeg: 80, tilt: 25 }, (lash) =>
      b.spike(lash, lash, 0.07, 0.006, { color: HAIR, sides: 3, name: "lash" }),
    );
    // temporal-gland streak below the eye
    b.stick(new THREE.BoxGeometry(0.05, 0.006, 0.2), DARK, hit.moved([0, -0.0, 0]), { embed: 0.4, name: "streak" });
  }

  // legs ------------------------------------------------------------------------------------------------------
  const legRadii = [0.4, 0.34, 0.3, 0.275, 0.265, 0.26];
  const nailAngles = (n: number) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * (n === 5 ? 26 : 24));
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    for (const kind of ["F", "H"] as const) {
      const x = sx * (kind === "F" ? 0.52 : 0.55);
      const pts =
        kind === "F"
          ? [
              [x, 2.5, 0.8],
              [x, 1.5, 0.77],
              [x, 0.85, 0.85],
              [x, 0.36, 0.85],
            ]
          : [
              [x, 2.5, -1.35],
              [x, 1.45, -1.0],
              [x, 0.8, -1.2],
              [x, 0.36, -1.17],
            ];
      const names =
        kind === "F"
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `forefoot${side}`]
          : [`hip${side}`, `knee${side}`, `hock${side}`, `hindfoot${side}`];
      const leg = b.chain(`leg${kind}${side}`, catmull(pts), {
        parent: kind === "F" ? spine.joints[2] : hips,
        names,
        role: "leg",
        contact: [x, 0, pts[3][2]],
      });
      const legSweep = b.sweep(leg, legRadii, { sides: 8, smooth: false, color: hide, name: `leg${kind}${side}` });
      const foot = leg.tip!;
      const fz = pts[3][2];
      b.part(new THREE.CylinderGeometry(0.3, 0.335, 0.38, 8), hide, {
        bone: foot,
        at: [x, 0.19, fz],
        flat: true,
        name: `foot${kind}${side}`,
      });
      b.part(new THREE.CylinderGeometry(0.31, 0.3, 0.07, 8), DARK, {
        bone: foot,
        at: [x, 0.37, fz],
        flat: true,
        name: `footCuff${kind}${side}`,
      });
      for (const a of nailAngles(kind === "F" ? 5 : 4)) {
        const r = a * (Math.PI / 180);
        const d = [Math.sin(r), 0.12, Math.cos(r)];
        b.part(new THREE.BoxGeometry(0.115, 0.13, 0.06), NAIL, {
          bone: foot,
          at: [x + d[0] * 0.325, 0.1, fz + d[2] * 0.325],
          dir: d,
          axis: "z",
          flat: true,
          name: "toenail",
        });
        b.part(new THREE.BoxGeometry(0.13, 0.05, 0.055), NAIL_DK, {
          bone: foot,
          at: [x + d[0] * 0.318, 0.035, fz + d[2] * 0.318],
          dir: d,
          axis: "z",
          flat: true,
          name: "toenailBase",
        });
      }
      // skin folds round knee/elbow and ankle
      const lsurf = b.surface(legSweep);
      for (const t of kind === "F" ? [0.42, 0.47, 0.6, 0.66, 0.8, 0.86] : [0.4, 0.45, 0.62, 0.67, 0.8, 0.86])
        b.sweep(lsurf.loop(leg.at(t), { lift: 0.004 }), 0.016, { color: DARK, sides: 4, smooth: false, name: "fold" });
    }
    // big thigh/shoulder muscle swell where the legs meet the body
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      bone: hips,
      at: [sx * 0.72, 2.55, -1.4],
      scale: [0.3, 0.65, 0.65],
      flat: true,
      name: "thigh",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      bone: spine.joints[2],
      at: [sx * 0.7, 2.65, 0.8],
      scale: [0.28, 0.6, 0.55],
      flat: true,
      name: "shoulderBlade",
    });
  }

  // tail -------------------------------------------------------------------------------------------------------
  const tailPath = catmull([
    [0, 2.85, -2.1],
    [0, 2.5, -2.28],
    [0, 1.9, -2.32],
    [0, 1.25, -2.3],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" });
  b.sweep(tail, [0.085, 0.06, 0.045, 0.035], { sides: 6, smooth: false, color: hide, name: "tail" });
  const tt = tailPath.at(1);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const d = [Math.cos(a) * 0.45 * (0.6 + 0.6 * R()), -1, Math.sin(a) * 0.45 * (0.6 + 0.6 * R())];
    b.spike([tt.x, tt.y + 0.02, tt.z], d, 0.34 + 0.12 * R(), 0.014, {
      bone: tail.tip!,
      color: HAIR,
      sides: 4,
      smooth: false,
      name: "tailHair",
    });
  }

  // bristle hair cards -----------------------------------------------------------------------------------------
  const bodySurf = b.surface(body);
  b.cards(
    bodySurf.scatter(130, { rng: R, minDist: 0.22, filter: (h) => h.n.y > 0.2 && h.at.z < 1.4 }),
    lashCard,
    { size: [0.04, 0.11], lean: 45, vary: 0.35, rng: R, flow: [0, 0, -1], bend: 15 },
  );
  b.cards(
    skullSurf.scatter(24, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.y > 0.35 }),
    lashCard,
    { size: [0.04, 0.12], lean: 35, vary: 0.3, rng: R, flow: [0, 0, -1], bend: 20 },
  );
  b.cards(
    tsurf.scatter(20, { rng: rng(9), minDist: 0.09, filter: (h) => h.at.y < 0.5 }),
    lashCard,
    { size: [0.035, 0.1], lean: 55, vary: 0.3, rng: R, bend: 15 },
  );
  // chin whiskers under the jaw
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.06;
    b.spike([x, 1.74, 2.38 + 0.03 * (i % 2)], [x * 0.5, -1, 0.2], 0.12, 0.008, {
      bone: jaw,
      color: HAIR,
      sides: 3,
      name: "whisker",
    });
  }
  void bezier;

  return b.root;
}

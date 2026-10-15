import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { offset, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Chain } from "../../../../src/skeleton";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant bull in low-poly style: faceted barrel body, columnar legs, Africa-shaped ears, curved ivory tusks and a ringed trunk, painted with dusty cracked skin.",
  style: "low-poly",
  commit: "88fc1f0",
};

const EYE = "#241812";
const NAIL = "#c2b8a4";
const IVORY = "#efe4c8";
const IVORY_BASE = "#8e7d60";
const IVORY_TIP = "#d8cba6";
const HAIR = "#2f2926";
const FOLD = "#555860";
const LID = "#6e717a";
const NOSTRIL = "#2a1f21";

const lastJoint = (c: Chain) => c.joints[c.joints.length - 1];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const squash = new THREE.Vector3();
const skin = paint((p, n) => {
  const tone = noise(p, 0.8, 2);
  let c = mix("#80838b", "#6a6e77", tone);
  c = mix(c, "#9c9ca1", 0.55 * smoothstep(-0.15, -0.85, n.y));
  const dust = smoothstep(1.7, 0.15, p.y) * (0.5 + 0.5 * noise(p, 0.4, 5));
  c = mix(c, "#a98e72", dust * 0.85);
  squash.set(p.x, p.y * 2.4, p.z);
  const cl = cells(squash, 0.22, 7);
  const crack = smoothstep(0.12, 0.03, cl.d2 - cl.d1);
  return mix(c, "#4a4d56", crack * 0.65);
});

const trunkSkin = paint((p, n, s) => {
  const base = skin.at(p, n, s);
  const k = s[0] * 40;
  const f = k - Math.floor(k);
  const groove = smoothstep(0.24, 0.05, f);
  let c = mix(base, "#464952", groove * 0.6);
  c = mix(c, "#b08f8a", smoothstep(0.86, 0.97, s[0]) * 0.6);
  return c;
});

const earSkin = paint((p, n, s) => {
  const base = skin.at(p, n, s);
  const ang = Math.atan2(s[1] - 0.05, s[0] + 0.02);
  const k = ang * 9;
  const f = k - Math.floor(k);
  const vein = smoothstep(0.1, 0.02, Math.min(f, 1 - f));
  const r = Math.hypot(s[0], s[1] - 0.05);
  const rim = smoothstep(0.7, 1.05, r);
  const blotch = smoothstep(0.55, 0.7, noise(p, 0.25, 9)) * rim;
  let c = mix(base, "#5e5e68", vein * 0.4);
  c = mix(c, "#b99d98", blotch * 0.7);
  return mix(c, "#6a6670", rim * 0.3);
});

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 2.32, -1.0], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.32, -1.0],
      [0, 2.36, -0.1],
      [0, 2.4, 0.8],
      [0, 2.42, 1.45],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.42, 1.45],
      [0, 2.58, 1.85],
    ]),
    { parent: spine, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.58, 1.85], dir: [0, -0.06, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.08, 1.95], aim: [0, 1.96, 2.4], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Body: one lofted tube from rump to neck
  const bodyPts: number[][] = [
    [0, 2.3, -1.7],
    [0, 2.32, -1.0],
    [0, 2.36, -0.1],
    [0, 2.4, 0.8],
    [0, 2.42, 1.45],
    [0, 2.58, 1.85],
  ];
  const bodyPath = catmull(bodyPts);
  const bodyTs = bodyPts.map((q) => bodyPath.closestT(q));
  const bodyRx = [0.5, 0.78, 0.8, 0.82, 0.62, 0.4];
  const bodyRy = [0.6, 0.85, 0.86, 0.9, 0.76, 0.5];
  const body = b.sweep(
    bodyPath,
    (t) => [interpolate(bodyTs, bodyRx, t), interpolate(bodyTs, bodyRy, t)],
    { bone: [hips, spine, neck], color: skin, sides: 10, smooth: false, name: "body" },
  );

  // neck / shoulder girth folds
  const bodySurf = b.surface(body);
  for (const z of [1.28, 1.44, 1.6]) {
    const lp = bodySurf.loop([0, 2.42, z], { dir: [0, 0, 1], lift: 0.01 });
    b.sweep(lp, 0.028, { color: FOLD, sides: 4, name: "neckFold" });
  }

  // sparse back bristles
  const bristle = svg(`<svg viewBox="0 0 8 32"><path d="M0.5 32 L4 0 L7.5 32 Z" fill="#35302c"/></svg>`, { size: 96 });
  b.cards(
    bodySurf.scatter(70, { rng: rng(12), minDist: 0.22, filter: (h) => h.n.y > 0.6 }),
    bristle,
    { size: [0.025, 0.1], lean: 35, bend: 20, vary: 0.3, spin: 180, rng: rng(13), name: "backBristles" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const headPts: number[][] = [
    [0, 2.68, 1.5],
    [0, 2.62, 1.95],
    [0, 2.42, 2.25],
  ];
  const headPath = catmull(headPts);
  const headTs = headPts.map((q) => headPath.closestT(q));
  const headRx = [0.5, 0.48, 0.34];
  const headRy = [0.62, 0.6, 0.45];
  const skull = b.sweep(
    headPath,
    (t) => [interpolate(headTs, headRx, t), interpolate(headTs, headRy, t)],
    { bone: head, color: skin, sides: 10, smooth: false, name: "skull" },
  );

  // twin forehead domes
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.27, 8, 6), skin, {
      at: [s * 0.2, 3.14, 1.75],
      bone: head,
      scale: [1, 0.8, 1.1],
      flat: true,
      name: "foreheadDome",
    });

  // crown bristles
  b.cards(
    b.surface(skull).scatter(40, {
      rng: rng(11),
      minDist: 0.09,
      filter: (h) => h.n.y > 0.5 && h.at.z > 1.4,
    }),
    bristle,
    { size: [0.03, 0.13], lean: 30, bend: 20, vary: 0.3, spin: 180, rng: rng(5), name: "crownBristles" },
  );

  // lower jaw
  b.frustumBox([0, 2.04, 1.95], [0, 1.96, 2.35], [0.46, 0.2], [0.26, 0.15], {
    bone: jaw,
    color: skin,
    name: "lowerJaw",
  });
  b.frustumBox([0, 2.0, 2.0], [0, 1.94, 2.3], [0.3, 0.05], [0.18, 0.05], {
    bone: jaw,
    color: "#8a5f62",
    name: "mouthLining",
  });

  // eyes with heavy lids and lashes
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around([0, 2.6, 2.0]).at(90 * s, 0);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.1, 7, 5), LID, hit, { embed: 0.65, scale: [1, 0.45, 1], name: "eyelid" });
    b.stick(new THREE.SphereGeometry(0.05, 6, 5), EYE, hit, { embed: 0.3, name: "eye" });
    b.stick(new THREE.SphereGeometry(0.014, 4, 3), "#ffffff", hit.moved([0.018, 0.04, 0.02]), {
      embed: 0,
      name: "eyeGleam",
    });
    b.ring(hit, { count: 6, radius: 0.055, fromDeg: -90, toDeg: 90, tilt: 20 }, (l) =>
      b.spike(l, l, 0.05, 0.006, HAIR, { sides: 4 }),
    );
  }

  // ears
  const earOutline: OutlinePoint[] = [
    [0, 0.5],
    [0.27, 0.65],
    [0.58, 0.63],
    [0.86, 0.45],
    [1.0, 0.14],
    [0.95, -0.22],
    [0.77, -0.54],
    [0.56, -0.86],
    [0.4, -1.08, "sharp"],
    [0.27, -0.81],
    [0.11, -0.45],
    [0, -0.09],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.4, 2.8, 1.72],
      dir: [s * 0.88, 0, -0.48],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: [s * 0.4, 2.8, 1.72],
      x: [s * 0.88, 0, -0.48],
      y: [0, 1, 0],
      thickness: [0.03, 0.07],
      bevel: 0.012,
      smoothing: 1,
      color: earSkin,
      bone: earJoint,
      name: `ear${side}`,
    });
  }

  // tusks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tuskPts = [
      [s * 0.28, 2.12, 2.3],
      [s * 0.42, 1.7, 2.65],
      [s * 0.5, 1.4, 3.1],
      [s * 0.46, 1.3, 3.6],
      [s * 0.38, 1.4, 4.0],
    ];
    b.sweep(catmull(tuskPts), [0.1, 0.025], {
      bone: head,
      color: IVORY,
      bands: [
        [0.12, IVORY_BASE],
        [0.94, IVORY],
        [1, IVORY_TIP],
      ],
      caps: { start: "flat", end: "point" },
      sides: 8,
      name: `tusk${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.12, 8), skin, {
      at: [s * 0.28, 2.14, 2.3],
      dir: [s * 0.14, -0.42, 0.35],
      bone: head,
      flat: true,
      name: `tuskCollar${side}`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Trunk
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.4, 2.3],
      [0, 2.05, 2.78],
      [0, 1.5, 3.02],
      [0, 0.95, 3.08],
      [0, 0.55, 3.12],
      [0, 0.3, 3.3],
      [0, 0.42, 3.6],
    ]),
    { parent: head, count: 8, role: "tentacle" },
  );
  const trunkSweep = b.sweep(trunk, [0.3, 0.27, 0.23, 0.19, 0.15, 0.115, 0.09, 0.07], {
    color: trunkSkin,
    sides: 8,
    smooth: false,
    name: "trunk",
  });
  const trunkTip = lastJoint(trunk);
  const tp = trunk.at(1);
  const tdir = tp.axis.clone();
  b.spike(offset(tp.at, [0, 1, 0], 0.035), [0, tdir.y + 0.5, tdir.z], 0.16, 0.04, "#b08f8a", {
    bone: trunkTip,
    sides: 6,
    name: "trunkFingerTop",
  });
  b.spike(offset(tp.at, [0, 1, 0], -0.03), [0, tdir.y - 0.1, tdir.z], 0.08, 0.035, "#b08f8a", {
    bone: trunkTip,
    sides: 6,
    name: "trunkFingerLow",
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), NOSTRIL, {
    at: offset(tp.at, tdir, 0.07),
    dir: tdir,
    bone: trunkTip,
    name: "nostril",
  });
  b.cards(
    b.surface(trunkSweep).scatter(22, { rng: rng(21), minDist: 0.14, filter: (h) => h.at.y > 1.0 && h.n.y > 0.2 }),
    bristle,
    { size: [0.022, 0.08], lean: 40, bend: 15, vary: 0.3, spin: 180, rng: rng(22), name: "trunkBristles" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const footGeo = () => new THREE.CylinderGeometry(0.31, 0.38, 0.32, 8);
  const legSpecs = [
    { kind: "front", z: 0.8, fz: 0.85, names: ["shoulder", "elbow", "wrist"], parent: spine.joints[2], nails: 5 },
    { kind: "hind", z: -1.25, fz: -1.3, names: ["hip", "knee", "ankle"], parent: hips, nails: 4 },
  ] as const;
  for (const spec of legSpecs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const x = s * (spec.kind === "front" ? 0.56 : 0.55);
      const pts = limb([x, spec.kind === "front" ? 2.02 : 2.0, spec.z], [x, 0.3, spec.fz], [0.87, 0.87], [0, 0, 1]);
      const leg = b.chain(`leg${spec.kind === "front" ? "F" : "H"}${side}`, pts, {
        parent: spec.parent,
        names: spec.names.map((n) => `${n}${side}`),
        role: "leg",
        contact: [x, 0, spec.fz],
      });
      const radii = spec.kind === "front" ? [0.46, 0.38, 0.32, 0.3, 0.3] : [0.5, 0.4, 0.33, 0.3, 0.3];
      const legSweep = b.sweep(leg, radii, {
        color: skin,
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "flat" },
        name: `leg${spec.kind}${side}`,
      });
      const legSurf = b.surface(legSweep);
      for (const t of [0.3, 0.48, 0.7, 0.88]) {
        const lp = legSurf.loop(leg.at(t), { lift: 0.012 });
        b.sweep(lp, 0.02, { color: FOLD, sides: 4, name: "legFold" });
      }
      const foot = lastJoint(leg);
      const fz = spec.fz + 0.04;
      b.part(footGeo(), skin, { at: [x, 0.16, fz], bone: foot, flat: true, name: "foot" });
      const angs = spec.nails === 5 ? [-48, -24, 0, 24, 48] : [-36, -12, 12, 36];
      for (const a of angs) {
        const r = (a * Math.PI) / 180;
        b.part(new THREE.BoxGeometry(0.11, 0.12, 0.07), NAIL, {
          at: [x + 0.365 * Math.sin(r), 0.11, fz + 0.365 * Math.cos(r)],
          dir: [Math.sin(r), 0, Math.cos(r)],
          axis: "z",
          bone: foot,
          name: "toenail",
        });
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.5, -2.15],
      [0, 2.25, -2.4],
      [0, 1.8, -2.5],
      [0, 1.35, -2.5],
      [0, 1.05, -2.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, [0.08, 0.05, 0.035, 0.03, 0.025], { color: skin, sides: 6, smooth: false, name: "tail" });
  const tailEnd = tail.at(1).at;
  const tailTip = lastJoint(tail);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.spike(tailEnd, [0.4 * Math.cos(a), -1, 0.4 * Math.sin(a)], 0.28, 0.022, HAIR, {
      bone: tailTip,
      sides: 4,
      name: "tailHair",
    });
  }

  return b.root;
}

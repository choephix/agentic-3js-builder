import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, gradient, mix, noise, paint, smoothstep } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in a faceted low-poly style: huge Africa-shaped ears, curved ivory tusks, ringed trunk, wrinkled dusty hide, mud-stained legs and a bristled tail.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette
const SKIN_A = "#8c837c";
const SKIN_B = "#706863";
const SKIN_DK = "#4d4641";
const PINKISH = "#a98e8a";
const DUST = "#ad8d68";
const MUD = "#7b5d44";
const IVORY = "#ece0c3";
const IVORY_TIP = "#a8916a";
const GUM = "#8d6a62";
const NAIL = "#bdb29d";
const EYE = "#2f1c12";
const LID = "#5b514b";
const LASH = "#241c18";
const BRISTLE = "#2a2320";
const VEIN = "#7d5459";
const EAR_IN = "#b5918e";
const NOSTRIL = "#2d2522";

// Hide skin: blotches, folds, cracked-pebble lines, pale belly, dust on top, mud low down.
const skin = paint((p, n) => {
  const blot = noise(p, 1.1, 5);
  let c = mix(SKIN_A, SKIN_B, smoothstep(0.3, 0.7, blot));
  const fold = Math.abs(Math.sin((p.y * 3.6 + noise(p, 0.7, 9) * 2.6) * Math.PI));
  c = mix(c, SKIN_DK, 0.5 * smoothstep(0.16, 0.03, fold));
  const cell = cells(p, 0.22, 4);
  c = mix(c, SKIN_DK, 0.28 * smoothstep(0.09, 0.0, cell.d2 - cell.d1));
  c = mix(c, PINKISH, 0.45 * smoothstep(-0.25, -0.85, n.y));
  c = mix(c, DUST, 0.4 * smoothstep(0.25, 0.9, n.y) * smoothstep(0.35, 0.7, noise(p, 0.6, 12)));
  c = mix(c, MUD, 0.75 * smoothstep(0.8, 0.1, p.y) * (0.6 + 0.4 * noise(p, 0.15, 2)));
  return c;
});

// Trunk: skin plus tight transverse rings, paler and deeper-ridged underneath.
const trunkSkin = paint((p, n, s) => {
  let c = skin.at(p, n, s);
  const ringV = Math.abs(Math.sin(s[0] * Math.PI * 60));
  const under = smoothstep(-0.1, -0.7, n.y);
  c = mix(c, SKIN_DK, (0.45 + 0.2 * under) * smoothstep(0.22, 0.05, ringV));
  c = mix(c, PINKISH, 0.3 * under);
  return c;
});

// Ear: outer face like the hide, inner face pink with a network of veins, darker rim and tip.
const earPaint = (side: number) =>
  paint((p, n, s) => {
    let c = skin.at(p, n, s);
    const outer = n.x * side > 0.35;
    const inner = n.x * side < -0.35;
    if (inner) {
      c = mix(EAR_IN, PINKISH, 0.3 * noise(p, 0.4, 3));
      const v = cells(p, 0.17, 7);
      c = mix(c, VEIN, 0.7 * smoothstep(0.1, 0.02, v.d2 - v.d1));
    } else if (!outer) {
      c = mix(c, SKIN_DK, 0.6);
    }
    c = mix(c, SKIN_DK, 0.55 * smoothstep(2.2, 1.55, p.y));
    return c;
  });

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const rand = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 2.35, -1.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.35, -1.1],
      [0, 2.25, -0.2],
      [0, 2.4, 0.7],
      [0, 2.5, 1.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neckChain",
    catmull([
      [0, 2.5, 1.4],
      [0, 2.55, 1.8],
      [0, 2.5, 2.1],
    ]),
    { parent: spine.tip ?? spine.joints[spine.joints.length - 1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.5, 2.1],
    dir: [0, -0.1, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 2.3], aim: [0, 1.9, 2.9], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -2.3],
      [0, 2.25, -2.6],
      [0, 1.7, -2.72],
      [0, 1.1, -2.7],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  const trunkPts = [
    [0, 2.4, 2.95],
    [0, 1.95, 3.3],
    [0, 1.4, 3.45],
    [0, 0.9, 3.5],
    [0, 0.5, 3.62],
    [0, 0.3, 3.88],
  ];
  const trunk = b.chain("trunk", catmull(trunkPts), {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
    role: "tentacle",
  });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 2.3, -1.7], w: 1.3, h: 1.6 },
      { at: [0, 2.35, -1.1], w: 1.75, h: 2.0 },
      { at: [0, 2.15, 0], w: 1.8, h: 2.0 },
      { at: [0, 2.4, 1.0], w: 1.7, h: 2.1 },
      { at: [0, 2.45, 1.6], w: 1.4, h: 1.8 },
    ],
    { bone: [spine], color: skin, sides: 10, smooth: false, name: "body" },
  );
  b.sweep(neck, [0.74, 0.68, 0.6], { color: skin, sides: 8, smooth: false, name: "neck" });

  const skull = b.loft(
    [
      { at: [0, 2.62, 1.95], w: 0.95, h: 1.1 },
      { at: [0, 2.72, 2.3], w: 1.0, h: 1.25 },
      { at: [0, 2.62, 2.6], w: 0.85, h: 1.05 },
      { at: [0, 2.45, 2.8], w: 0.6, h: 0.8 },
    ],
    { bone: head, color: skin, sides: 8, smooth: false, name: "skull" },
  );
  b.frustumBox([0, 1.98, 2.35], [0, 1.92, 2.85], [0.55, 0.25], [0.38, 0.22], {
    bone: jaw,
    color: skin,
    name: "lowerJaw",
  });

  // Body bumps: shoulder blades, hip bones, forehead domes.
  const bodySurf = b.surface(body);
  const bumpGeo = new THREE.SphereGeometry(0.42, 7, 5);
  for (const s of [1, -1]) {
    const sh = bodySurf.nearest([s * 1.1, 3.1, 0.9]);
    b.stick(bumpGeo, skin, sh, { embed: 0.5, scale: [1, 0.55, 1.3] });
    const hp = bodySurf.nearest([s * 1.1, 3.2, -1.2]);
    b.stick(bumpGeo, skin, hp, { embed: 0.5, scale: [1, 0.55, 1.3] });
  }
  const skullSurf = b.surface(skull);
  const domeGeo = new THREE.SphereGeometry(0.26, 7, 5);
  for (const s of [1, -1]) {
    const dome = skullSurf.nearest([s * 0.22, 3.7, 2.3]);
    b.stick(domeGeo, skin, dome, { embed: 0.55, scale: [1, 0.55, 1] });
  }

  // Eyes, lids, lashes, temporal streaks.
  for (const s of [1, -1]) {
    const hit = skullSurf.nearest([s * 0.8, 2.62, 2.62]);
    b.stick(new THREE.SphereGeometry(0.085, 7, 5), LID, hit, { embed: 0.6, scale: [1, 0.5, 0.85] });
    const eye = b.stick(new THREE.SphereGeometry(0.05, 8, 6), EYE, hit, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#ffffff", hit.moved([0.012, 0.045, 0.014]), { embed: 0 });
    b.ring(eye, { count: 6, radius: 0.045, fromDeg: -70, toDeg: 70, tilt: 25 }, (it) =>
      b.spike(it, it, 0.05, 0.007, { color: LASH }),
    );
    const streak = skullSurf.nearest([s * 0.8, 2.42, 2.58]);
    b.stick(new THREE.SphereGeometry(0.07, 6, 4), SKIN_DK, streak, { embed: 0.3, scale: [0.6, 0.4, 1.9] });
  }

  // Forehead bristles.
  const bristleGeo = new THREE.ConeGeometry(0.011, 0.09, 4);
  for (const hit of skullSurf.scatter(24, { rng: rand, minDist: 0.12, filter: (h) => h.n.y > 0.4 }))
    b.stick(bristleGeo, BRISTLE, hit, { embed: 0.2 });
  for (const hit of bodySurf.scatter(22, { rng: rand, minDist: 0.3, filter: (h) => h.n.y > 0.7 }))
    b.stick(bristleGeo, BRISTLE, hit, { embed: 0.2 });

  // ---------------------------------------------------------------- ears
  const earOutline: Array<[number, number]> = [
    [0, 0.15],
    [0.25, 0.28],
    [0.6, 0.3],
    [0.95, 0.22],
    [1.2, 0.05],
    [1.25, -0.3],
    [1.15, -0.7],
    [0.95, -1.05],
    [0.7, -1.3],
    [0.55, -1.45],
    [0.38, -1.2],
    [0.2, -0.85],
    [0.05, -0.5],
    [-0.02, -0.2],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const dirOut: [number, number, number] = [s * 0.55, 0, -0.83];
    const ear = b.joint(`ear${S}`, { parent: head, at: [s * 0.46, 3.0, 2.25], dir: dirOut, role: "hinge" });
    b.extrude(earOutline, {
      at: [s * 0.46, 3.0, 2.25],
      x: dirOut,
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: earPaint(s),
      bone: ear,
      name: `ear${S}Plate`,
    });
  }

  // ---------------------------------------------------------------- trunk
  b.sweep(trunk, [0.33, 0.27, 0.21, 0.16, 0.115, 0.08], {
    color: trunkSkin,
    sides: 8,
    smooth: false,
    name: "trunkTube",
  });
  const trunkTip = trunk.tip ?? trunk.joints[trunk.joints.length - 1];
  const tEnd = trunk.at(1);
  const tDir = tEnd.tangent.clone().normalize();
  for (const s of [1, -1]) {
    const pos = tEnd.at
      .clone()
      .addScaledVector(tDir, 0.07)
      .add(new THREE.Vector3(s * 0.03, 0, 0));
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.015, 6), NOSTRIL, { bone: trunkTip, at: pos, dir: tDir });
  }
  b.spike(
    tEnd.at.clone().add(new THREE.Vector3(0, 0.055, 0)).addScaledVector(tDir, -0.03),
    tDir,
    0.12,
    0.032,
    { color: skin, bone: trunkTip, sides: 6, smooth: false },
  );

  // ---------------------------------------------------------------- tusks
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pth = catmull([
      [s * 0.3, 2.2, 2.85],
      [s * 0.42, 1.85, 3.15],
      [s * 0.5, 1.6, 3.6],
      [s * 0.5, 1.7, 4.2],
    ]);
    b.sweep(pth, [0.1, 0.012], {
      bone: head,
      color: gradient(IVORY, IVORY_TIP, pth.at(0.5), pth.at(1)),
      caps: { start: "round", end: "point" },
      sides: 7,
      smooth: false,
      name: `tusk${S}`,
    });
    b.part(new THREE.SphereGeometry(0.13, 7, 5), GUM, {
      bone: head,
      at: [s * 0.3, 2.2, 2.85],
      scale: [1, 0.9, 0.9],
      name: `gum${S}`,
    });
  }

  // ---------------------------------------------------------------- legs
  const makeLeg = (
    names: [string, string, string],
    parent: typeof hips,
    root: number[],
    target: number[],
    lengths: number[],
    nailAngles: number[],
  ) => {
    const pts = limb(root, target, lengths, [[0, 0, 1]]);
    const leg = b.chain(`leg_${names[0]}`, pts, { parent, names, role: "leg" });
    const tube = b.sweep(leg, [0.36, 0.29, 0.27, 0.28], {
      color: skin,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "flat" },
      name: `leg_${names[0]}`,
    });
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.31, 0.34, 0.2, 8), skin, {
      bone: foot,
      at: [target[0], 0.095, target[2]],
      flat: true,
      name: `pad_${names[0]}`,
    });
    for (const deg of nailAngles) {
      const a = (deg * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      b.part(new THREE.CylinderGeometry(0.065, 0.07, 0.08, 6), NAIL, {
        bone: foot,
        at: [target[0] + dx * 0.325, 0.1, target[2] + dz * 0.325],
        dir: [dx, 0, dz],
        scale: [1, 0.6, 1],
        flat: true,
      });
    }
    const kneeAt = leg.joints[1].at;
    const kneeHit = b.surface(tube).nearest([kneeAt.x, kneeAt.y, kneeAt.z + 0.5]);
    b.stick(new THREE.SphereGeometry(0.17, 7, 5), skin, kneeHit, { embed: 0.5, scale: [1, 0.5, 1] });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    makeLeg(
      [`shoulder${S}`, `elbow${S}`, `footF${S}`],
      spine.joints[2],
      [s * 0.62, 2.0, 1.0],
      [s * 0.64, 0.2, 1.0],
      [0.92, 0.92],
      [-56, -28, 0, 28, 56],
    );
    makeLeg(
      [`hip${S}`, `knee${S}`, `footH${S}`],
      hips,
      [s * 0.66, 2.0, -1.35],
      [s * 0.7, 0.2, -1.45],
      [0.95, 0.95],
      [-42, -14, 14, 42],
    );
  }

  // ---------------------------------------------------------------- tail
  b.sweep(tail, [0.12, 0.07, 0.05, 0.04], { color: skin, sides: 6, smooth: false, name: "tailTube" });
  b.ring(tail.tip ?? tail.joints[tail.joints.length - 1], { count: 10, radius: 0.02, tilt: 55 }, (it) =>
    b.spike(it, it, 0.3, 0.014, { color: BRISTLE, sides: 4, smooth: false }),
  );

  return b.root;
}

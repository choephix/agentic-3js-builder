import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A faceted low-poly adult African bush elephant: a heavy barrel body, pillar legs with toenails, huge Africa-shaped ears, curved ivory tusks, a ringed segmented trunk and a tufted tail, on a full skeleton with separate jaw and hinged ears.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette (flat colours)
const IVORY = "#efe5cb";
const IVORY_DARK = "#a39478";
const IVORY_TIP = "#d9cfb6";
const NAIL = "#cfc5b2";
const NAIL_DARK = "#8f8676";
const EYE = "#20160f";
const LASH = "#3a2e28";
const LID = "#6b655f";
const HAIR = "#2a221d";
const MOUTH = "#8c6a66";
const DUST = "#a98d73";
const DARKSKIN = "#5e5955";
const PINK = "#b5958e";
const RIDGE = "#78726d";

// Painted hide: grey mottle, polygonal wrinkle creases, red-brown dust on the lower legs, belly and back.
const coat = mottle("#908983", "#7b756f", { size: 0.5, seed: 4 });
const SKIN = paint((p, n) => {
  let c = resolve(coat, p, n);
  const c1 = cells(p, 0.24, 9);
  const crease = 1 - smoothstep(0.02, 0.14, c1.d2 - c1.d1);
  c = mix(c, "#625d59", crease * 0.55);
  const big = cells(p, 0.9, 21);
  c = mix(c, "#6a6561", (1 - smoothstep(0.0, 0.08, big.d2 - big.d1)) * 0.35);
  const dust = Math.min(1, (1 - smoothstep(0.2, 1.3, p.y)) * 0.6 + Math.max(n.y, 0) * 0.16 + noise(p, 0.7, 2) * 0.12);
  return mix(c, DUST, dust);
});

// Trunk: SKIN with dark ring bands along it and a paler underside.
const TRUNK = paint((p, n, s) => {
  const base = resolve(SKIN, p, n);
  const f = (s[0] * 40) % 1;
  let c = f < 0.22 ? mix(base, DARKSKIN, 0.45) : base;
  c = mix(c, PINK, smoothstep(-0.3, -0.9, n.y) * 0.3);
  return c;
});

// Ear: veins radiate from the attachment, pinker toward the lower tip.
const EAR = paint((p, n, s) => {
  const base = resolve(SKIN, p, n);
  const ang = Math.atan2(s[1] - 0.45, s[0] + 0.05);
  const f = (((ang * 9) % 1) + 1) % 1;
  const c = mix(base, PINK, smoothstep(0.1, -1.0, s[1]) * 0.5);
  return f < 0.1 ? mix(c, DARKSKIN, 0.5) : c;
});

const EAR_OUTLINE: OutlinePoint[] = [
  [0, 0.55],
  [0.5, 0.68],
  [1.0, 0.6],
  [1.45, 0.25],
  [1.6, -0.4],
  [1.4, -1.0],
  [1.0, -1.5, "sharp"],
  [0.65, -1.2],
  [0.3, -0.7],
  [0, -0.3],
];

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 2.25, -1.4] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.25, -1.4],
      [0, 2.15, -0.4],
      [0, 2.2, 0.6],
      [0, 2.3, 1.35],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.3, 1.35],
      [0, 2.5, 1.75],
      [0, 2.65, 2.0],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.65, 2.0],
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.05, 2.1],
    aim: [0, 1.98, 2.65],
    role: "jaw",
  });

  // ---------------------------------------------------------------- body
  b.loft(
    [
      { at: [0, 2.2, -2.0], w: 0.8, h: 1.1 },
      { at: [0, 2.25, -1.45], w: 1.45, h: 1.7 },
      { at: [0, 2.1, -0.4], w: 1.5, h: 1.65 },
      { at: [0, 2.2, 0.6], w: 1.5, h: 1.8 },
      { at: [0, 2.3, 1.25], w: 1.35, h: 1.8 },
      { at: [0, 2.25, 1.7], w: 0.95, h: 1.3 },
    ],
    { bone: [hips, spine], color: SKIN, sides: 10, smooth: false, name: "body" },
  );
  const spineMid = spine.joints[2];
  for (const side of [
    { n: "L", s: 1 },
    { n: "R", s: -1 },
  ]) {
    const s = side.s;
    // haunch and shoulder masses
    b.part(new THREE.SphereGeometry(0.5, 8, 6), SKIN, {
      at: [s * 0.5, 2.3, -1.15],
      scale: [0.8, 1.3, 1.15],
      bone: hips,
      flat: true,
      name: `haunch${side.n}`,
    });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), SKIN, {
      at: [s * 0.52, 2.2, 0.95],
      scale: [0.8, 1.25, 1.1],
      bone: spineMid,
      flat: true,
      name: `shoulder${side.n}`,
    });
  }
  // sacrum bump and withers
  b.part(new THREE.SphereGeometry(0.4, 8, 6), SKIN, {
    at: [0, 2.85, -1.2],
    scale: [1.1, 0.6, 1.5],
    bone: hips,
    flat: true,
    name: "sacrum",
  });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), SKIN, {
    at: [0, 2.95, 1.05],
    scale: [1.3, 0.6, 1.3],
    bone: spineMid,
    flat: true,
    name: "withers",
  });

  // neck
  b.sweep(neck, (t) => [0.5 + 0.05 * t, 0.62], { color: SKIN, sides: 10, smooth: false, name: "neck" });

  // ---------------------------------------------------------------- legs
  const legR = (scale: number) => (t: number) => scale * (0.43 - 0.17 * Math.pow(t, 1.2));
  const legs: Array<{ front: boolean; n: string; s: number }> = [];
  for (const side of [
    { n: "L", s: 1 },
    { n: "R", s: -1 },
  ]) {
    legs.push({ front: true, n: side.n, s: side.s });
    legs.push({ front: false, n: side.n, s: side.s });
  }
  for (const leg of legs) {
    const s = leg.s;
    const x = s * 0.52;
    const z = leg.front ? 0.98 : -1.2;
    const pts = limb([x, 2.3, z], [x, 0.27, z + (leg.front ? 0.02 : 0)], [1.03, 1.03], [[0, 0, leg.front ? -1 : 1]]);
    const names = leg.front
      ? [`shoulder${leg.n}`, `elbow${leg.n}`, `wrist${leg.n}`]
      : [`hipH${leg.n}`, `kneeH${leg.n}`, `ankleH${leg.n}`];
    const chain = b.chain(`leg${leg.front ? "F" : "H"}${leg.n}`, pts, {
      parent: leg.front ? spineMid : hips,
      names,
      role: "leg",
      contact: [x, 0, z],
    });
    const radius = legR(leg.front ? 1 : 1.06);
    b.sweep(chain, radius, { color: SKIN, sides: 8, smooth: false, name: `leg${leg.front ? "F" : "H"}${leg.n}` });
    // wrinkle ridges around the leg
    for (const t of [0.3, 0.5, 0.72, 0.9]) {
      const cp = chain.at(t);
      b.part(new THREE.TorusGeometry(radius(t) * 1.06, 0.014, 4, 8), RIDGE, {
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
        bone: cp.bone ?? chain.joints[0],
        flat: true,
      });
    }
    // foot pad and toenails
    const foot = chain.joints[chain.joints.length - 1];
    const fz = z + 0.02 + (leg.front ? 0.03 : 0.02);
    const fr = leg.front ? 0.3 : 0.28;
    b.part(new THREE.CylinderGeometry(fr * 0.9, fr * 1.08, 0.21, 8), SKIN, {
      at: [x, 0.105, fz],
      bone: foot,
      flat: true,
      name: `foot${leg.front ? "F" : "H"}${leg.n}`,
    });
    const toes = leg.front ? 4 : 3;
    for (let i = 0; i < toes; i++) {
      const a = toes === 1 ? 0 : -0.55 + (1.1 * i) / (toes - 1);
      const dx = Math.sin(a + s * 0.12);
      const dz = Math.cos(a + s * 0.12);
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.07), i % 2 ? NAIL : NAIL_DARK, {
        at: [x + dx * (fr * 1.02), 0.075, fz + dz * (fr * 1.02)],
        dir: [dx, 0, dz],
        axis: "z",
        bone: foot,
        flat: true,
        name: `nail${leg.front ? "F" : "H"}${leg.n}${i}`,
      });
    }
  }

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: [0, 2.6, 1.55], w: 0.95, h: 1.2 },
      { at: [0, 2.62, 2.05], w: 1.0, h: 1.25 },
      { at: [0, 2.42, 2.5], w: 0.66, h: 1.0 },
      { at: [0, 2.3, 2.78], w: 0.5, h: 0.65 },
    ],
    { bone: head, color: SKIN, sides: 10, smooth: false, name: "skull" },
  );
  const domes: Array<ReturnType<typeof b.part>> = [];
  for (const s of [1, -1])
    domes.push(
      b.part(new THREE.SphereGeometry(0.45, 8, 6), SKIN, {
        at: [s * 0.27, 2.95, 1.95],
        scale: [0.95, 0.8, 1.0],
        bone: head,
        flat: true,
        name: `forehead${s > 0 ? "L" : "R"}`,
      }),
    );
  // temple and cheek masses
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.3, 7, 5), SKIN, {
      at: [s * 0.4, 2.35, 2.2],
      scale: [0.8, 0.9, 1.1],
      bone: head,
      flat: true,
    });

  // crown bristles
  const crown = b.surface([skull, ...domes]);
  for (const hit of crown.scatter(16, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.y > 0.55 && h.at.z > 1.6 }))
    b.stick(new THREE.ConeGeometry(0.014, 0.1, 4), HAIR, hit, { embed: 0.1 });

  // jaw: lower jaw slab and dark mouth
  b.frustumBox([0, 2.0, 2.2], [0, 1.95, 2.62], [0.5, 0.22], [0.34, 0.18], { bone: jaw, color: SKIN, name: "jaw" });
  b.part(new THREE.BoxGeometry(0.36, 0.12, 0.3), MOUTH, { at: [0, 1.99, 2.38], bone: head, name: "mouth" });

  // eyes with lids and lashes
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSurface.nearest([s * 0.7, 2.55, 2.3]);
    b.stick(new THREE.SphereGeometry(0.075, 6, 4), LID, hit, { embed: 0.55, scale: [1, 1, 0.65] });
    b.stick(new THREE.SphereGeometry(0.042, 6, 4), EYE, hit, { embed: 0.2 });
    b.ring(hit, { count: 5, radius: 0.05, fromDeg: -70, toDeg: 70 }, (lash) =>
      b.spike(lash, lash, 0.06, 0.007, { color: LASH }),
    );
  }

  // ---------------------------------------------------------------- ears
  for (const side of [
    { n: "L", s: 1 },
    { n: "R", s: -1 },
  ]) {
    const s = side.s;
    const anchor: [number, number, number] = [s * 0.4, 2.7, 1.9];
    const earJ = b.joint(`ear${side.n}`, {
      parent: head,
      at: anchor,
      dir: [s * 0.4, -1, -0.3],
      role: "hinge",
    });
    b.extrude(EAR_OUTLINE, {
      at: anchor,
      x: [s * 0.55, 0, -0.85],
      y: [-s * 0.3, 1, 0],
      thickness: [0.03, 0.08],
      bevel: 0.012,
      smoothing: 1,
      color: EAR,
      bone: earJ,
      name: `ear${side.n}`,
    });
  }

  // ---------------------------------------------------------------- tusks
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.3, 2.1, 2.35],
        [s * 0.4, 1.8, 2.85],
        [s * 0.46, 1.6, 3.4],
        [s * 0.42, 1.62, 3.95],
        [s * 0.38, 1.78, 4.1],
      ]),
      [0.08, 0.015],
      {
        bone: head,
        color: IVORY,
        bands: [
          [0.12, IVORY_DARK],
          [0.9, IVORY],
          [1, IVORY_TIP],
        ],
        sides: 8,
        smooth: false,
        caps: { start: "flat", end: "point" },
        name: `tusk${s > 0 ? "L" : "R"}`,
      },
    );

  // ---------------------------------------------------------------- trunk
  const trunkR = (t: number) => 0.26 * (1 - t) + 0.075 * t;
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.3, 2.62],
      [0, 2.0, 3.0],
      [0, 1.5, 3.25],
      [0, 1.0, 3.3],
      [0, 0.62, 3.4],
      [0, 0.42, 3.65],
    ]),
    { parent: head, count: 8, role: "tentacle" },
  );
  b.sweep(trunk, trunkR, { color: TRUNK, sides: 8, smooth: false, name: "trunk" });
  for (let k = 0; k < 14; k++) {
    const t = 0.06 + k * 0.065;
    const cp = trunk.at(t);
    b.part(new THREE.TorusGeometry(trunkR(t) * 1.06, 0.012, 4, 8), RIDGE, {
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
      bone: cp.bone ?? head,
      flat: true,
    });
  }
  const trunkTip = trunk.at(1);
  const lastTrunk = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1]) {
    const a = offset(trunkTip.at, trunkTip.binormal, s * 0.025);
    const e = offset(a, trunkTip.tangent, 0.12);
    b.capsule(a, e, 0.035, { bone: lastTrunk, color: SKIN, sides: 6, name: `finger${s > 0 ? "L" : "R"}` });
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.95],
      [0, 2.45, -2.05],
      [0, 1.9, -2.25],
      [0, 1.2, -2.3],
      [0, 0.8, -2.25],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.09, 0.03], { color: SKIN, sides: 6, smooth: false, caps: "round", name: "tail" });
  const tailTip = tail.joints[3];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([0, 0.85, -2.25], [Math.cos(a) * 0.1, 0.5 - 0.04 * (i % 2), -2.25 + Math.sin(a) * 0.1], null, 0.03, {
      bone: tailTip,
      color: HAIR,
      sides: 4,
    });
  }

  return b.root;
}

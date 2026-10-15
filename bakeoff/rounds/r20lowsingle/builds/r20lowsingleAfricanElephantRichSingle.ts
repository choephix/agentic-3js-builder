import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { gradient, mix, mottle, paint, smoothstep, stripes } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in a faceted low-poly style: huge fanned ears, ringed trunk, curved ivory tusks, wrinkled dusty hide, columnar legs with toenails. Full rigged skeleton with jaw, ears and trunk chain.",
  style: "low-poly",
  commit: "88fc1f0",
};

const SKIN = "#8a8379";
const SKIN2 = "#766f66";
const DARK = "#6d675f";
const WRINKLE = "#5a554e";
const DUST = "#a98f6c";
const PINK = "#b98f88";
const IVORY = "#e8dfc6";
const IVORY_TIP = "#c9b88f";
const NAIL = "#d9cfb8";
const HAIR = "#2b2724";
const EYE = "#1c1410";
const IRIS = "#6b3f1a";
const LID = "#5f5750";
const FOOT = "#7b7468";

const D2R = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "africanElephant" });
  const random = rng(11);

  // ---- paints -----------------------------------------------------------------------------------------------
  const hide = stripes(mottle(SKIN, SKIN2, { size: 0.45, seed: 3 }), WRINKLE, {
    size: 0.13,
    axis: [0, 1, 0.4],
    width: 0.1,
    wobble: 1,
    seed: 4,
  });
  const COAT = gradient(hide, DUST, [0, 1.5, 0], [0, 0.1, 0]);
  const TRUNKP = paint((_p, _n, s) => {
    const r = (s[0] * 34) % 1;
    return r < 0.25 ? WRINKLE : COAT;
  });
  const EAR = paint((_p, _n, s) => {
    const k = smoothstep(0.1, 0.55, s[0]);
    const base = mix(SKIN, PINK, k * 0.8);
    const vein = Math.abs(Math.sin(s[0] * 9 - s[1] * 5)) < 0.08;
    return vein ? mix(base, WRINKLE, 0.35) : base;
  });

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 2.35, -1.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.35, -1.4],
      [0, 2.35, -0.3],
      [0, 2.45, 0.8],
      [0, 2.5, 1.5],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.85],
      [0, 2.3, -2.3],
      [0, 1.75, -2.5],
      [0, 1.05, -2.55],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 2.5, 1.5],
      [0, 2.5, 1.85],
    ],
    { parent: spine.joints[2], names: ["neck1"], role: "neck" },
  );
  const headJ = b.joint("head", { parent: neck.joints[0], at: [0, 2.5, 1.85], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: headJ, at: [0, 2.05, 2.3], aim: [0, 1.95, 2.7], role: "jaw" });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.05, 2.6],
      [0, 1.75, 3.0],
      [0, 1.2, 3.2],
      [0, 0.65, 3.2],
      [0, 0.3, 3.3],
      [0, 0.22, 3.6],
    ]),
    { parent: headJ, names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5"], role: "tentacle" },
  );

  // ---- body, tail, neck, head -------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 2.35, -1.9], w: 1.2, h: 1.5 },
      { at: [0, 2.35, -1.4], w: 1.5, h: 1.8 },
      { at: [0, 2.35, -0.3], w: 1.55, h: 1.9 },
      { at: [0, 2.45, 0.8], w: 1.55, h: 1.95 },
      { at: [0, 2.5, 1.5], w: 1.2, h: 1.6 },
    ],
    { bone: spine, color: COAT, smooth: false, name: "body" },
  );
  b.sweep(tail, [0.12, 0.04], { color: COAT, sides: 6, smooth: false, name: "tailTube" });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    b.spike([0, 1.07, -2.55], [Math.cos(a) * 0.45, -1, Math.sin(a) * 0.45], 0.32, 0.03, {
      color: HAIR,
      bone: tail.joints[2],
      sides: 4,
    });
  }

  const head = b.loft(
    [
      { at: [0, 2.55, 1.8], w: 1.0, h: 1.3 },
      { at: [0, 2.5, 2.25], w: 0.95, h: 1.3 },
      { at: [0, 2.3, 2.65], w: 0.7, h: 0.95 },
    ],
    { bone: headJ, color: COAT, smooth: false, name: "skull" },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.3, 8, 6), COAT, {
      bone: headJ,
      at: [s * 0.2, 3.0, 2.25],
      scale: [1, 0.85, 1],
      flat: true,
      name: `forehead${s}`,
    });
  b.frustumBox([0, 2.0, 2.3], [0, 1.9, 2.7], [0.5, 0.22], [0.3, 0.16], { bone: jaw, color: DARK, name: "lowerJaw" });

  // ---- trunk ------------------------------------------------------------------------------------------------
  b.sweep(trunk, [0.27, 0.22, 0.17, 0.12, 0.09, 0.07], { color: TRUNKP, sides: 8, smooth: false, name: "trunkTube" });
  const trunkTip = trunk.joints[4];
  b.spike([0, 0.26, 3.58], [0, 0.5, 1], 0.14, 0.035, { color: PINK, bone: trunkTip, sides: 5 });
  b.spike([0, 0.18, 3.6], [0, -0.1, 1], 0.1, 0.035, { color: PINK, bone: trunkTip, sides: 5 });

  // ---- tusks ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.3, 2.0, 2.55],
      [s * 0.42, 1.65, 2.95],
      [s * 0.5, 1.35, 3.45],
      [s * 0.46, 1.38, 4.0],
    ]);
    b.sweep(path, [0.08, 0.065, 0.02], {
      bone: headJ,
      color: gradient(IVORY, IVORY_TIP, path.at(0.2), path.at(1)),
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: `tusk${s}`,
    });
    b.part(new THREE.SphereGeometry(0.11, 6, 5), DARK, { bone: headJ, at: [s * 0.3, 2.0, 2.52], flat: true });
  }

  // ---- ears -------------------------------------------------------------------------------------------------
  const earOutline: Array<[number, number]> = [
    [0, 0.4],
    [0.2, 0.58],
    [0.55, 0.5],
    [0.9, 0.2],
    [1.1, -0.2],
    [1.0, -0.7],
    [0.7, -1.05],
    [0.4, -1.15],
    [0.2, -0.85],
    [0.05, -0.4],
  ];
  const ears = [] as Array<{ j: ReturnType<typeof b.joint>; s: number }>;
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const j = b.joint(`ear${side}`, {
      parent: headJ,
      at: [s * 0.46, 2.75, 2.0],
      dir: [s, 0, -0.2],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: j,
      x: [0, 0, -1],
      thickness: 0.05,
      bevel: 0.015,
      smoothing: 1,
      color: EAR,
      bone: j,
      name: `ear${side}`,
    });
    ears.push({ j, s });
  }

  // ---- eyes and head dressing -------------------------------------------------------------------------------
  const skull = b.surface(head);
  for (const s of [1, -1]) {
    const hit = skull.nearest([s * 0.8, 2.5, 2.3]);
    b.stick(new THREE.SphereGeometry(0.075, 6, 5), LID, hit, { embed: 0.4 });
    b.stick(new THREE.SphereGeometry(0.045, 6, 4), IRIS, hit.moved([0, 0.03, 0]), { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.025, 5, 4), EYE, hit.moved([0, 0.06, 0]), { embed: 0.3 });
    const brow = skull.nearest([s * 0.8, 2.68, 2.3]);
    b.stick(new THREE.SphereGeometry(0.1, 6, 4), SKIN2, brow, { embed: 0.5, scale: [1.3, 0.6, 1] });
  }
  const tufts = skull.scatter(14, { rng: rng(3), minDist: 0.15, filter: (h) => h.n.y > 0.5 });
  for (const h of tufts) b.spike(h, h, 0.1, 0.012, { color: HAIR, sides: 4 });

  // ---- legs -------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.85 : -1.4;
      const fz = front ? 0.9 : -1.45;
      const pts = limb(
        [s * 0.55, 2.0, z],
        [s * 0.55, 0.2, fz],
        front ? [0.95, 0.9] : [0.95, 0.9],
        front ? [0, 0, -1] : [0, 0, 1],
      );
      const nm = front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"];
      const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
        parent: front ? spine.joints[2] : pelvis,
        names: nm.map((n) => `${n}${side}`),
        role: "leg",
      });
      const tipJ = chain.tip ?? chain.joints[chain.joints.length - 1];
      const legSw = b.sweep(chain, [0.46, 0.36, 0.3, 0.3], { color: COAT, sides: 8, smooth: false });
      b.part(new THREE.SphereGeometry(0.5, 8, 6), COAT, {
        bone: chain.joints[0],
        at: [s * 0.62, 2.2, z],
        scale: [0.6, 1.15, 1.1],
        flat: true,
      });
      for (const t of [0.2, 0.45, 0.72]) {
        const lp = b.surface(legSw).loop(chain.at(t), { lift: 0.012 });
        b.sweep(lp, 0.016, { color: WRINKLE, sides: 4 });
      }
      const x = s * 0.55;
      b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.22, 8), FOOT, { bone: tipJ, at: [x, 0.11, fz], flat: true });
      for (const phi of [-48, -16, 16, 48]) {
        b.part(new THREE.BoxGeometry(0.11, 0.13, 0.07), NAIL, {
          bone: tipJ,
          at: [x + Math.sin(phi * D2R) * 0.37, 0.09, fz + Math.cos(phi * D2R) * 0.37],
          rotation: [0, phi, 0],
        });
      }
    }
  }

  // ---- girth wrinkles on the barrel -------------------------------------------------------------------------
  const barrel = b.surface(body);
  for (const t of [0.2, 0.45, 0.7]) {
    const lp = barrel.loop(spine.at(t), { lift: 0.012 });
    b.sweep(lp, 0.02, { color: WRINKLE, sides: 4 });
  }
  void random;

  // ---- rest pose: ears swung out ----------------------------------------------------------------------------
  for (const e of ears) b.pose(e.j, { axis: [0, 1, 0], deg: -e.s * 30 });

  return b.root;
}

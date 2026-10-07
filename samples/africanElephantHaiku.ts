import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { line } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { countershade, gradient, noise, paint, scales } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "African bush elephant",
  description:
    "An adult African bush elephant, about 3.2 m at the shoulder: faceted grey hide, huge fan ears, ivory tusks, a ringed trunk and a rigged skeleton.",
  style: "low-poly",
  commit: "b816db2",
};

const HIDE = "#8e887e";
const HIDE_DEEP = "#7a7369";
const HIDE_LIGHT = "#9f988b";
const HIDE_EDGE = "#5b564f";
const BELLY = "#a59e91";
const DUST = "#ad8756";
const DUST_TOP = "#a48a68";
const EAR_OUT = "#807a6f";
const EAR_IN = "#cba797";
const TRUNK = "#887f74";
const TRUNK_RING = "#625c54";
const IVORY = "#f2e8cf";
const IVORY_DARK = "#d6c7a1";
const NAIL = "#3a3430";
const EYE = "#1d1915";
const PAD = "#5b544b";
const HAIR = "#2a2421";

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // Faceted hide: broad plates, each shaded a little differently, with dark seams and blotches of dust on the back.
  const plates = scales([HIDE, HIDE_DEEP, HIDE_LIGHT], HIDE_EDGE, { size: 0.55, width: 0.025 });
  const dusty = paint((p, n) => (n.y > 0.55 && p.y > 2.5 && noise(p, 0.45, 3) > 0.68 ? DUST_TOP : plates));
  const body = countershade(dusty, BELLY);
  const legPaint = gradient(plates, DUST, [0, 1.0, 0], [0, 0.1, 0]);
  const trunkPaint = paint((_p, _n, s) => (Math.floor(s[0] * 22) % 2 === 0 ? TRUNK : TRUNK_RING));
  const ivoryPaint = paint((_p, _n, s) => (Math.floor(s[0] * 7) % 2 === 0 ? IVORY : IVORY_DARK));

  // Skeleton: hips, spine to the withers, a short neck, the head, trunk, ears, tail, four legs.
  const hips = b.joint("hips", { at: [0, 2.35, -1.6], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.0],
      [0, 2.25, -0.2],
      [0, 2.2, 0.6],
      [0, 2.55, 1.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain("neck", catmull([[0, 2.55, 1.3], [0, 2.8, 1.6], [0, 2.82, 1.95]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.82, 1.95], aim: [0, 2.7, 2.7], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.2, 2.3], aim: [0, 2.0, 2.8], role: "jaw" });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.1, 2.62],
      [0, 1.82, 2.92],
      [0, 1.45, 3.06],
      [0.02, 1.08, 3.14],
      [0.08, 0.78, 3.06],
      [0.11, 0.58, 2.94],
      [0.1, 0.48, 2.76],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6"], role: "tentacle" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.35, -2.0],
      [0, 2.05, -2.35],
      [0, 1.7, -2.55],
      [0, 1.25, -2.6],
      [0, 0.85, -2.52],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // Body: a barrel with a convex back, a sagging belly and a deep chest, skinned to the spine.
  b.loft(
    [
      { at: [0, 2.4, -2.0], w: 1.2, h: 1.35 },
      { at: [0, 2.35, -1.2], w: 1.6, h: 1.55 },
      { at: [0, 2.2, -0.2], w: 1.8, h: 1.7 },
      { at: [0, 2.05, 0.5], w: 1.9, h: 1.7 },
      { at: [0, 2.1, 1.0], w: 1.85, h: 1.9 },
      { at: [0, 2.45, 1.4], w: 1.55, h: 1.45 },
    ],
    { bone: spine, color: body, sides: 8, smooth: false },
  );

  // Head: a domed skull with a bulging forehead, narrowing to the trunk root.
  const headSkin = b.loft(
    [
      { at: [0, 2.7, 1.3], w: 0.95, h: 0.95 },
      { at: [0, 2.85, 1.75], w: 1.2, h: 0.92 },
      { at: [0, 2.78, 2.15], w: 1.25, h: 0.9 },
      { at: [0, 2.55, 2.4], w: 1.1, h: 0.85 },
      { at: [0, 2.3, 2.6], w: 0.85, h: 0.78 },
      { at: [0, 2.15, 2.7], w: 0.7, h: 0.6 },
    ],
    { bone: [neck, head], color: body, sides: 8, smooth: false },
  );
  b.frustumBox([0, 2.22, 2.2], [0, 2.1, 2.7], [0.5, 0.22], [0.34, 0.14], { bone: jaw, color: body });

  // Sparse bristle tufts on the crown and nape, the only hair an adult bush elephant carries.
  const bristle = svg(
    '<svg viewBox="0 0 20 40"><path d="M10 39 Q8 20 5 4 M10 39 Q10 20 10 3 M10 39 Q12 20 15 5" stroke="#4d4339" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>',
    { size: 128 },
  );
  const crown = b.surface(headSkin).scatter(36, { rng: rng(11), minDist: 0.12, filter: (h) => h.n.y > 0.35 });
  b.cards(crown, bristle, { size: [0.04, 0.1], lean: 55, vary: 0.3, rng: rng(12) });

  // Trunk: ringed, tapering, with a two-lobed tip.
  b.sweep(trunk, [0.3, 0.25, 0.19, 0.15, 0.12, 0.095, 0.075], { color: trunkPaint, sides: 6, smooth: false });
  b.part(new THREE.SphereGeometry(0.035, 5, 4), TRUNK_RING, { bone: trunk.joints[5], at: [0.07, 0.44, 2.7] });
  b.part(new THREE.SphereGeometry(0.035, 5, 4), TRUNK_RING, { bone: trunk.joints[5], at: [0.14, 0.44, 2.7] });

  // Tail with a brush tuft.
  b.sweep(tail, [0.1, 0.075, 0.05, 0.02], { color: HIDE_DEEP, sides: 6, smooth: false });
  const tipLine = line(tail.at(0.85).at, tail.at(1).at);
  b.ring(tipLine, { count: 14, radius: 0.04, tilt: 55 }, (item) => b.spike(item, item, 0.26, 0.014, { color: HAIR }));

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Small eye set into the side of the head, just forward of the ear.
    b.part(new THREE.SphereGeometry(0.05, 6, 4), EYE, { bone: head, at: [s * 0.58, 2.8, 2.3] });

    // Tusk: rooted in the upper lip, curving out, forward and down.
    b.sweep(
      catmull([
        [s * 0.2, 2.02, 2.5],
        [s * 0.36, 1.85, 2.8],
        [s * 0.52, 1.55, 2.98],
        [s * 0.6, 1.24, 2.96],
      ]),
      (t) => 0.075 * (1 - t) + 0.012,
      { bone: head, color: ivoryPaint, sides: 6, smooth: false, caps: { start: "round", end: "point" } },
    );

    // Ear: a hinged fan hanging from the temple and flaring outward; outer face grey, inner face pale.
    const pivot: [number, number, number] = [s * 0.6, 2.8, 1.75];
    const ear = b.joint(`ear${side}`, { parent: head, at: pivot, aim: [s * 0.9, 1.9, 1.8], role: "hinge" });
    b.extrude(
      [
        [-0.34, 0.02],
        [0.2, 0.05],
        [0.46, -0.2],
        [0.56, -0.66],
        [0.4, -1.1],
        [0.02, -1.3],
        [-0.36, -1.2],
        [-0.62, -0.72],
        [-0.54, -0.24],
      ],
      {
        at: pivot,
        x: [0, 0, 1],
        y: [-s * 0.42, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: paint((_p, n) => (n.x * s < -0.5 ? EAR_IN : EAR_OUT)),
        bone: ear,
      },
    );

    // Front leg: a pillar solved onto the floor, cropped above its pad so the pad carries the contact.
    const fore = b.chain(
      `legFore${side}`,
      limb([s * 0.62, 2.5, 0.85], [s * 0.62, 0.13, 0.95], [1.02, 0.85, 0.55], [
        [0, 0, 1],
        [0, 0, 1],
      ]),
      {
        parent: spine.joints[2],
        names: [`foreShoulder${side}`, `foreElbow${side}`, `foreWrist${side}`, `forePaw${side}`],
        role: "leg",
      },
    );
    b.sweep(fore, [0.48, 0.38, 0.29, 0.32], { color: legPaint, sides: 7, smooth: false, to: 0.9 });
    b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.4, 8), PAD, { bone: fore.joints[3], at: [s * 0.62, 0.2, 0.95] });
    for (const a of [-64, -32, 0, 32, 64]) {
      const r = (a * Math.PI) / 180;
      b.part(new THREE.CylinderGeometry(0.035, 0.03, 0.04, 6), NAIL, {
        bone: fore.joints[3],
        at: [s * 0.62 + 0.31 * Math.sin(r), 0.2, 0.95 + 0.31 * Math.cos(r)],
        dir: [Math.sin(r), -0.3, Math.cos(r)],
      });
    }

    // Hind leg: knee forward, hock back, the same pillar and pad.
    const hind = b.chain(
      `legHind${side}`,
      limb([s * 0.56, 2.45, -1.3], [s * 0.6, 0.12, -1.25], [1.0, 0.9, 0.5], [
        [0, 0, 1],
        [0, 0, -1],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, [0.46, 0.36, 0.28, 0.3], { color: legPaint, sides: 7, smooth: false, to: 0.9 });
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.36, 8), PAD, { bone: hind.joints[3], at: [s * 0.6, 0.18, -1.25] });
    for (const a of [-50, -17, 17, 50]) {
      const r = (a * Math.PI) / 180;
      b.part(new THREE.CylinderGeometry(0.03, 0.025, 0.035, 6), NAIL, {
        bone: hind.joints[3],
        at: [s * 0.6 + 0.28 * Math.sin(r), 0.22, -1.25 + 0.28 * Math.cos(r)],
        dir: [Math.sin(r), -0.3, Math.cos(r)],
      });
    }
  }

  return b.root;
}

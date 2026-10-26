```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, mottle, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A horned stone gargoyle crouched on a cathedral ledge, with folded bat wings, a spade tail, glowing amber eyes and a jaw that can open.",
};

// ---------- palette ----------
const STONE = countershade(mottle("#8f8c85", "#7a776f", { size: 0.09, seed: 3 }), "#5f5d59", { level: -0.35 });
const STONE_LIGHT = "#a7a499";
const STONE_MID = "#827f78";
const STONE_DARK = "#5a5855";
const SHADOW = "#2f2e2d";
const WING = countershade(mottle("#7d8080", "#6c6f6f", { size: 0.12, seed: 8 }), "#4f5252", { level: -0.3 });
const HORN = "#6d6a64";
const CLAW = "#3a3937";
const EYE = "#ffb02a";
const MOSS = "#5d7b38";
const MOSS2 = "#7f9c4a";
const LEDGE = countershade(mottle("#9a978e", "#85827a", { size: 0.14, seed: 5 }), "#625f5a", { level: -0.4 });
const LEDGE_DARK = "#4d4b48";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ico = (r: number) => new THREE.IcosahedronGeometry(r, 0);
const cone = (r: number, l: number, n = 5) => new THREE.ConeGeometry(r, l, n);
const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const P = (geo: THREE.BufferGeometry, color: any, opts: any) => b.part(geo, color, { flat: true, ...opts });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.42, -0.25], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.25],
      [0, 0.52, -0.06],
      [0, 0.66, 0.1],
      [0, 0.76, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.76, 0.22],
      [0, 0.83, 0.34],
      [0, 0.84, 0.46],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  // ---------- ledge ----------
  // Plinth, cornice lip, blind pointed arcade, moss.
  P(box(1.55, 0.14, 2.0), LEDGE, { bone: hips, at: [0, 0.07, -0.25] });
  P(box(1.62, 0.06, 2.08), STONE_LIGHT, { bone: hips, at: [0, 0.17, -0.25] });
  P(box(1.66, 0.02, 2.12), LEDGE, { bone: hips, at: [0, 0.139, -0.25] });
  const arch = [
    [-0.055, 0],
    [0.055, 0],
    [0.055, 0.06],
    [0, 0.115, "sharp"],
    [-0.055, 0.06],
  ] as any;
  for (let i = -3; i <= 3; i++) {
    b.extrude(arch, { at: [i * 0.2, 0.012, 0.752], x: [1, 0, 0], thickness: 0.012, color: LEDGE_DARK, bone: hips });
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.03, 0.04],
        [0, 0.07, "sharp"],
        [-0.03, 0.04],
      ] as any,
      { at: [i * 0.2, 0.02, 0.76], x: [1, 0, 0], thickness: 0.006, color: SHADOW, bone: hips },
    );
  }
  // corner corbels
  for (const s of [1, -1])
    P(cone(0.05, 0.1, 4), STONE_MID, { bone: hips, at: [s * 0.78, 0.05, 0.75], rotation: [180, 45, 0] });
  const mossBits: [number, number, number, number][] = [
    [0.5, 0.2, 0.45, 0.14],
    [-0.55, 0.2, 0.2, 0.12],
    [0.45, 0.2, -0.7, 0.16],
    [-0.4, 0.2, -0.95, 0.12],
    [0.72, 0.2, -0.1, 0.09],
    [0.0, 0.2, -1.15, 0.1],
  ];
  mossBits.forEach(([x, y, z, r], i) => {
    P(ball(r, 6, 4), i % 2 ? MOSS : MOSS2, { bone: hips, at: [x, y, z], scale: [1.2, 0.22, 1] });
    P(ball(r * 0.5, 5, 4), i % 2 ? MOSS2 : MOSS, { bone: hips, at: [x + r * 0.6, y, z + r * 0.4], scale: [1, 0.3, 1] });
  });

  // ---------- torso ----------
  const body = b.sweep(spine, [0.15, 0.2, 0.2, 0.14], { color: STONE, sides: 10, smooth: false });
  // chest keel and shoulder mass
  P(ico(0.16), STONE, { bone: chest, at: [0, 0.68, 0.2], scale: [1.25, 0.95, 1] });
  // belly ribs
  for (let i = 0; i < 4; i++) {
    const t = 0.18 + i * 0.2;
    const p = body.at(t, 180);
    b.stick(box(0.2 - i * 0.015, 0.016, 0.03), STONE_DARK, p, { embed: 0.5 });
  }
  // dorsal spine spikes
  b.along(body, 6, (at) => b.spike(at, at, 0.1, 0.03, { color: STONE_LIGHT, sides: 5 }));
  // carved quatrefoil emblem on the chest
  const chestHit = b.surface(body).nearest([0, 0.6, 0.45]);
  b.stick(new THREE.TorusGeometry(0.055, 0.009, 5, 12).rotateX(Math.PI / 2), STONE_DARK, chestHit, { embed: 0.3 });
  b.stick(ball(0.018, 5, 4), SHADOW, chestHit, { embed: 0.2 });
  // moss on the back
  P(ball(0.1, 6, 4), MOSS, { bone: spine.joints[1], at: [0.05, 0.85, -0.02], scale: [1.1, 0.25, 1.3] });
  P(ball(0.06, 5, 4), MOSS2, { bone: spine.joints[1], at: [-0.07, 0.86, 0.05], scale: [1, 0.3, 1] });

  // ---------- neck ----------
  b.sweep(neck, [0.115, 0.1, 0.095], { color: STONE, sides: 8, smooth: false });
  // mane of stone blades behind neck
  for (let i = 0; i < 3; i++) {
    const t = 0.15 + i * 0.3;
    const pt = neck.at(t);
    b.spike([pt.at.x, pt.at.y + 0.09, pt.at.z - 0.02], [0, 1, -0.5], 0.09, 0.03, { color: STONE_LIGHT, sides: 4, bone: neck.joints[0] });
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.84, 0.46], dir: [0, -0.1, 1], role: "head" });
  const hp = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  P(box(0.3, 0.24, 0.28), STONE, { bone: head, at: hp(0, 0.03, 0.04) });
  P(box(0.2, 0.1, 0.17), STONE, { bone: head, at: hp(0, -0.03, 0.2) }); // upper jaw / snout
  P(box(0.1, 0.05, 0.1), STONE_LIGHT, { bone: head, at: hp(0, 0.045, 0.22), rotation: [-14, 0, 0] }); // nose bridge
  P(box(0.22, 0.05, 0.04), STONE_MID, { bone: head, at: hp(0, 0.0, 0.29) }); // snout lip
  // cheek blocks
  for (const s of [1, -1]) {
    P(box(0.06, 0.1, 0.14), STONE_MID, { bone: head, at: hp(s * 0.15, -0.02, 0.06) });
    // brow
    P(box(0.17, 0.055, 0.12), STONE_LIGHT, { bone: head, at: hp(s * 0.085, 0.13, 0.14), rotation: [0, 0, s * 16] });
    // eye socket, eye, slit pupil
    P(ball(0.047, 8, 6), SHADOW, { bone: head, at: hp(s * 0.085, 0.075, 0.165) });
    glow(P(ball(0.032, 8, 6), EYE, { bone: head, at: hp(s * 0.085, 0.07, 0.185) }), 1.5);
    P(box(0.009, 0.04, 0.01), SHADOW, { bone: head, at: hp(s * 0.085, 0.07, 0.213) });
    // nostrils
    P(box(0.03, 0.025, 0.02), SHADOW, { bone: head, at: hp(s * 0.05, 0.0, 0.312) });
    // upper fangs
    P(cone(0.02, 0.075, 5), STONE_LIGHT, { bone: head, at: hp(s * 0.075, -0.115, 0.255), rotation: [180, 0, 0] });
    P(cone(0.012, 0.04, 5), STONE_LIGHT, { bone: head, at: hp(s * 0.035, -0.1, 0.285), rotation: [180, 0, 0] });
    // frill fan behind cheeks
    b.extrude(
      [
        [0, 0],
        [0.1, -0.02],
        [0.06, 0.03],
        [0.15, 0.06],
        [0.05, 0.09],
        [0.11, 0.16],
        [0, 0.13],
      ] as any,
      { at: hp(s * 0.15, -0.03, -0.08), x: [0, 0, -1], thickness: 0.025, color: STONE_MID, bone: head },
    );
    // swept horns with banded bases
    const horn = b.sweep(bezier(hp(s * 0.09, 0.11, 0.0), hp(s * 0.17, 0.2, -0.06), hp(s * 0.21, 0.25, -0.2), hp(s * 0.16, 0.36, -0.31)), [0.045, 0.004], {
      color: HORN,
      bone: head,
      sides: 6,
      smooth: false,
      caps: { end: "point" },
    });
    b.along(horn, 3, (at) => b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), STONE_DARK, { frame: at, flat: true, scale: [1 - at.t * 0.5, 1 - at.t * 0.5, 1] }));
    P(ball(0.05, 6, 4), STONE_DARK, { bone: head, at: hp(s * 0.09, 0.11, 0.0) });
    // moss on the head top
  }
  P(ball(0.07, 6, 4), MOSS, { bone: head, at: hp(0.03, 0.155, 0.02), scale: [1.2, 0.3, 1] });
  // central forehead gem-stud
  P(box(0.03, 0.03, 0.02), STONE_DARK, { bone: head, at: hp(0, 0.1, 0.19), rotation: [0, 0, 45] });

  // jaw (separate lower jaw so it can open)
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.075, 0.07), aim: hp(0, -0.075, 0.3), role: "jaw" });
  P(box(0.17, 0.05, 0.2), STONE_MID, { bone: jaw, at: hp(0, -0.115, 0.19) });
  P(box(0.11, 0.04, 0.05), STONE_MID, { bone: jaw, at: hp(0, -0.12, 0.3) });
  for (const s of [1, -1]) {
    P(cone(0.02, 0.07, 5), STONE_LIGHT, { bone: jaw, at: hp(s * 0.065, -0.07, 0.285) });
    P(cone(0.011, 0.035, 5), STONE_LIGHT, { bone: jaw, at: hp(s * 0.04, -0.082, 0.22) });
  }
  P(cone(0.035, 0.12, 4), STONE_LIGHT, { bone: jaw, at: hp(0, -0.185, 0.29), rotation: [180, 45, 0] }); // goatee
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, 0.64, 0.14], [s * 0.2, 0.25, 0.4], [0.26, 0.26], [[s * 0.6, 0.2, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.085, 0.06, 0.05], { color: STONE, sides: 8, smooth: false });
    const wrist = arm.joints[2];
    P(ico(0.12), STONE, { bone: arm.joints[0], at: [s * 0.2, 0.66, 0.12], scale: [1, 0.9, 1.1] });
    P(ico(0.055), STONE_MID, { bone: arm.joints[1], at: pts[1] });
    P(box(0.12, 0.05, 0.17), STONE, { bone: wrist, at: [s * 0.2, 0.23, 0.45] });
    for (let i = -1; i <= 1; i++) {
      P(cone(0.016, 0.07, 5), CLAW, { bone: wrist, at: [s * 0.2 + i * 0.04, 0.225, 0.56], dir: [0, -0.25, 1] });
      P(ball(0.02, 5, 4), STONE_MID, { bone: wrist, at: [s * 0.2 + i * 0.04, 0.235, 0.52] });
    }
    // wrist cuff
    P(new THREE.TorusGeometry(0.052, 0.012, 4, 8), STONE_DARK, { bone: wrist, at: [s * 0.2, 0.27, 0.38], dir: [0, 0.3, 1], axis: "z" });
  }

  // ---------- hind legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, 0.44, -0.24], [s * 0.2, 0.235, -0.02], [0.26, 0.26], [[s * 0.3, 0.4, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.095, 0.065, 0.05], { color: STONE, sides: 8, smooth: false });
    P(ico(0.15), STONE, { bone: leg.joints[0], at: [s * 0.22, 0.46, -0.24], scale: [0.85, 1, 1.15] });
    P(ico(0.065), STONE_MID, { bone: leg.joints[1], at: pts[1] });
    const ankle = leg.joints[2];
    P(box(0.11, 0.04, 0.2), STONE, { bone: ankle, at: [s * 0.2, 0.22, 0.05] });
    for (let i = -1; i <= 1; i++)
      P(cone(0.016, 0.07, 5), CLAW, { bone: ankle, at: [s * 0.2 + i * 0.037, 0.222, 0.17], dir: [0, -0.15, 1] });
  }

  // ---------- wings (folded up behind) ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const R0 = [s * 0.1, 0.74, 0.04];
    const E = [s * 0.28, 0.98, -0.1];
    const W = [s * 0.42, 1.22, -0.2];
    const wing = b.chain(`wing${S}`, catmull([R0, E, W]), {
      parent: chest,
      names: [`wingRoot${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.05, 0.038, 0.03], { color: STONE, sides: 6, smooth: false });
    const wr = wing.joints[2];
    P(ico(0.05), STONE_MID, { bone: wing.joints[1], at: E });
    const tips = [
      [s * 0.52, 1.05, -0.56],
      [s * 0.38, 0.88, -0.64],
      [s * 0.22, 0.76, -0.52],
    ];
    for (const t of tips) b.rod(W, t, [0.022, 0.008], { bone: wr, color: STONE_MID, sides: 5, smooth: false });
    b.membrane([W, tips[0]], [W, tips[1]], { color: WING, thickness: 0.02, bone: wr });
    b.membrane([W, tips[1]], [W, tips[2]], { color: WING, thickness: 0.02, bone: wr });
    b.membrane([W, tips[2]], [R0, [s * 0.1, 0.6, -0.38]], { color: WING, thickness: 0.02, bone: wr });
    const up = new THREE.Vector3(s * 0.3, 1, 0.2).normalize();
    b.spike(W, up, 0.11, 0.022, { bone: wr, color: CLAW, sides: 5 });
    for (const t of tips) b.spike(t, [0, -0.4, -1], 0.06, 0.014, { bone: wr, color: CLAW, sides: 5 });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.42, -0.25],
      [0, 0.34, -0.5],
      [0, 0.28, -0.75],
      [0, 0.3, -0.98],
      [0, 0.4, -1.1],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.09, 0.065, 0.045, 0.03, 0.022], { color: STONE, sides: 8, smooth: false });
  b.along(tailTube, 4, (at) => b.spike(at, at, 0.07, 0.025, { color: STONE_LIGHT, sides: 4 }));
  const tip = tail.at(1);
  b.spike(tip, tip, 0.15, 0.06, { color: STONE_LIGHT, sides: 4, bone: tail.joints[3] });
  P(ball(0.035, 5, 4), STONE_DARK, { bone: tail.joints[3], at: tip.at });

  return b.root;
}
```
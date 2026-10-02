import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, gradient, mottle, paint } from "../src/paint";
import { rng } from "../src/math";
import { svg } from "../src/texture";

const COAT = "#a96f43";
const COAT_DARK = "#70442d";
const BELLY = "#d99b63";
const NOSE = "#3a2923";
const EYE = "#1f1716";
const EYE_GLOW = "#f6d36b";
const CLAW = "#f2d6a0";
const BIRD_BLUE = "#4d9bc4";
const BIRD_BLUE_DARK = "#28627f";
const BEAK = "#e39145";
const LEAF = "#6e9b4f";
const FLOWER = "#e77b83";
const WHITE = "#fff5de";

const coat = countershade(mottle(COAT, BELLY, { size: 0.2, contrast: 0.32, seed: 14 }), BELLY, { level: -0.2, soft: 0.3 });
const legCoat = gradient(coat, COAT_DARK, [0, 0.56, 0], [0, 0.16, 0]);
const cheekPaint = paint((p, n, s) => (p.y > 1.05 && n.z > 0.4 && s[1] > 0.5 ? "#c98260" : COAT));

const furTuft = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0 C12 14 6 20 5 31 C4 43 10 54 16 64 C22 54 28 43 27 31 C26 20 20 14 16 0Z" fill="#f4d09b"/>
    <path d="M16 4 C14 22 12 35 16 58 C20 35 18 22 16 4Z" fill="#fff0c8" opacity=".65"/>
  </svg>`,
  { size: 96 },
);
const featherTex = svg(
  `<svg viewBox="0 0 32 72" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0 C7 14 4 31 9 72 L16 62 L23 72 C28 31 25 14 16 0Z" fill="#e8f2e6"/>
    <path d="M16 5 L16 64" stroke="#7eb2c5" stroke-width="3"/>
    <path d="M16 20 L9 34 M16 31 L23 45 M16 43 L10 55" stroke="#b4d1d1" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);
const eyeTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#fff5de"/>
    <circle cx="34" cy="34" r="21" fill="#3a241e"/>
    <circle cx="38" cy="27" r="8" fill="#fffdf3"/>
    <circle cx="27" cy="43" r="4" fill="#d98b55"/>
  </svg>`,
  { size: 128 },
);

export const meta = {
  name: "Capybara & Head-Perched Songbird",
  description: "A cheerful, richly textured capybara with a tiny songbird balancing between its rounded ears.",
  style: "whimsical",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "capybara", detail: 0.9, paintSize: 1024 });

  // Skeleton: a broad barrel, four planted legs, expressive head, tail, and the perched bird.
  const hips = b.joint("hips", { at: [0, 0.59, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.59, -0.52],
      [0, 0.62, -0.22],
      [0, 0.68, 0.12],
      [0, 0.76, 0.42],
    ]),
    { parent: hips, names: ["spineRear", "spineMid", "spineFront", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.76, 0.42],
      [0, 0.88, 0.6],
      [0, 1.0, 0.73],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckMid", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.05, 0.77], dir: [0, -0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.19, down: 0.08 }), dir: [0, -0.2, 1], role: "jaw" });

  const body = b.sweep(spine, (t) => [0.39 + 0.035 * Math.sin(t * Math.PI), 0.31 + 0.03 * Math.sin(t * Math.PI)], {
    color: coat,
    sides: 10,
    section: "circle",
    group: "body",
    name: "barrel",
  });
  const throat = b.sweep(neck, (t) => [0.29 - t * 0.05, 0.28 - t * 0.04], {
    color: coat,
    sides: 9,
    section: "circle",
    group: "body",
    name: "neckFur",
  });

  // Hind and fore legs use explicit IK points so all four feet land on the floor.
  const legSpecs = [
    { side: 1, kind: "F", root: [0.29, 0.63, 0.3] as [number, number, number], foot: [0.3, 0.075, 0.39] as [number, number, number], parent: spine.joints[2] },
    { side: -1, kind: "F", root: [-0.29, 0.63, 0.3] as [number, number, number], foot: [-0.3, 0.075, 0.39] as [number, number, number], parent: spine.joints[2] },
    { side: 1, kind: "H", root: [0.3, 0.58, -0.34] as [number, number, number], foot: [0.32, 0.075, -0.55] as [number, number, number], parent: spine.joints[0] },
    { side: -1, kind: "H", root: [-0.3, 0.58, -0.34] as [number, number, number], foot: [-0.32, 0.075, -0.55] as [number, number, number], parent: spine.joints[0] },
  ];
  for (const spec of legSpecs) {
    const pts = limb(spec.root, spec.foot, [0.22, 0.2, 0.18], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${spec.kind}${spec.side > 0 ? "L" : "R"}`, pts, {
      parent: spec.parent,
      names: [`hip${spec.kind}${spec.side > 0 ? "L" : "R"}`, `knee${spec.kind}${spec.side > 0 ? "L" : "R"}`, `ankle${spec.kind}${spec.side > 0 ? "L" : "R"}`, `foot${spec.kind}${spec.side > 0 ? "L" : "R"}`],
      role: "leg",
      contact: spec.foot,
    });
    b.sweep(leg, (t) => [0.1 - t * 0.034, 0.105 - t * 0.03], {
      color: legCoat,
      sides: 7,
      section: "circle",
      skin: "rigid",
      group: `leg${spec.kind}`,
      name: `legTube${spec.kind}${spec.side > 0 ? "L" : "R"}`,
    });
    const foot = leg.tip;
    b.part(new THREE.SphereGeometry(1, 8, 5), COAT_DARK, { bone: foot!, at: foot!.at, scale: [0.11, 0.065, 0.14], flat: true, group: "feet", name: `paw${spec.kind}${spec.side > 0 ? "L" : "R"}` });
    for (let toe = -1; toe <= 1; toe++) {
      b.spike(foot!.at, foot!.local([toe * 0.035, -0.02, 0.11]), 0.05, 0.012, { color: CLAW, group: "toes", name: `toe${spec.kind}${spec.side > 0 ? "L" : "R"}${toe}` });
    }
  }

  // A little tail with a tuft, kept visible behind the barrel.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.57, -0.48],
      [0, 0.54, -0.69],
      [0, 0.57, -0.84],
      [0, 0.64, -0.93],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip", "tailEnd"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.075 - t * 0.05, { color: coat, sides: 7, group: "tail", name: "tailTube" });
  b.cards([tail.at(1)], furTuft, { size: [0.12, 0.18], lean: 35, bend: -20, color: BELLY, group: "tail", name: "tailTuft" });

  // Head and muzzle, with a separate lower jaw for a readable creature rig.
  b.part(new THREE.SphereGeometry(1, 12, 8), cheekPaint, { bone: head, at: head.at, scale: [0.31, 0.29, 0.37], flat: true, group: "head", name: "skull" });
  b.frustumBox(head.local({ forward: 0.14, down: 0.02 }), head.local({ forward: 0.38, down: 0.06 }), [0.24, 0.2], [0.19, 0.15], { bone: head, color: coat, group: "muzzle", name: "muzzleBox" });
  b.sweep(catmull([jaw.at, jaw.local({ forward: 0.18, down: 0.02 })]), [0.11, 0.075], { bone: jaw, color: BELLY, sides: 8, group: "jaw", name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 8, 5), NOSE, { bone: head, at: head.local({ forward: 0.4, down: 0.05 }), scale: [0.15, 0.1, 0.08], flat: true, group: "face", name: "nose" });
  b.sweep(catmull([head.local({ forward: 0.37, down: 0.13 }), head.local({ forward: 0.38, down: 0.1 }), head.local({ forward: 0.4, down: 0.08 })]), 0.012, { bone: jaw, color: NOSE, sides: 5, caps: "round", group: "face", name: "mouthLine" });
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.18, up: 0.08, forward: 0.18 });
    b.decal(head, eyeTex, { at: eyeAt, dir: [s * 0.28, 0.1, 1], size: [0.12, 0.12], segments: 5, lift: 0.004, mirror: s < 0, group: "face", name: `eye${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE_GLOW, { bone: head, at: head.local({ left: s * 0.19, up: 0.085, forward: 0.19 }), scale: [0.026, 0.026, 0.012], group: "face", name: `eyeSpark${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, { bone: head, at: head.local({ left: s * 0.075, down: 0.03, forward: 0.44 }), scale: [0.025, 0.022, 0.012], group: "face", name: `nostril${s > 0 ? "L" : "R"}` });
    b.sweep(catmull([head.local({ left: s * 0.2, up: 0.02, forward: 0.23 }), head.local({ left: s * 0.31, up: 0.0, forward: 0.34 })]), [0.006, 0], { bone: head, color: WHITE, sides: 5, caps: "point", group: "face", name: `whisker${s > 0 ? "L" : "R"}a` });
    b.sweep(catmull([head.local({ left: s * 0.2, down: 0.02, forward: 0.23 }), head.local({ left: s * 0.32, down: 0.04, forward: 0.27 })]), [0.005, 0], { bone: head, color: WHITE, sides: 5, caps: "point", group: "face", name: `whisker${s > 0 ? "L" : "R"}b` });
  }
  // Rounded ears, each with a warm inner patch and a few fur cards.
  for (const s of [1, -1]) {
    const ear = head.local({ left: s * 0.2, up: 0.22, back: 0.02 });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: head, at: ear, scale: [0.105, 0.13, 0.055], flat: true, group: "ears", name: `ear${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { bone: head, at: head.local({ left: s * 0.205, up: 0.22, forward: 0.018 }), scale: [0.065, 0.085, 0.017], flat: true, group: "ears", name: `earInner${s > 0 ? "L" : "R"}` });
    b.cards([frame(head.local({ left: s * 0.21, up: 0.31, back: 0.02 }), [s * 0.3, 0.9, 0.1])], furTuft, { size: [0.04, 0.075], lean: 60, color: BELLY, group: "ears", name: `earTuft${s > 0 ? "L" : "R"}` });
  }

  // Fur tufts scattered over the body and neck make the simple masses feel hand-crafted.
  const bodyHits = b.surface([body, throat]).scatter(120, { rng: rng(91), minDist: 0.055, filter: (h) => h.n.y > -0.45 });
  b.cards(bodyHits, furTuft, { size: [0.028, 0.065], lean: 58, bend: 18, vary: 0.3, rng: rng(92), color: BELLY, group: "furCards", name: "coatFur" });
  const freckles = b.surface(head).scatter(18, { rng: rng(93), minDist: 0.035, filter: (h) => h.n.z > 0.15 && h.n.y > -0.2 });
  for (const hit of freckles) b.stick(new THREE.SphereGeometry(0.012, 5, 4), COAT_DARK, hit, { embed: 0.5, group: "freckles", name: "freckle" });

  // Bird skeleton seated on the crown.
  const birdHip = b.joint("birdHip", { parent: head, at: head.local({ up: 0.34, back: 0.04 }), dir: [0, 1, 0.05], role: "spine" });
  const birdBodyChain = b.chain(
    "birdBody",
    catmull([
      birdHip.at,
      [0, 1.46, 0.77],
      [0, 1.55, 0.81],
    ]),
    { parent: birdHip, names: ["birdSpine", "birdChest", "birdTip"], role: "spine" },
  );
  const birdHead = b.joint("birdHead", { parent: birdBodyChain.tip!, at: [0, 1.61, 0.83], dir: [0, 0.05, 1], role: "head" });
  const birdJaw = b.joint("birdJaw", { parent: birdHead, at: birdHead.local({ forward: 0.1, down: 0.015 }), dir: [0, -0.3, 1], role: "jaw" });
  b.sweep(birdBodyChain, (t) => [0.105 - t * 0.02, 0.11 - t * 0.025], { color: BIRD_BLUE, sides: 8, section: "circle", group: "bird", name: "birdBody" });
  b.part(new THREE.SphereGeometry(1, 10, 7), BIRD_BLUE, { bone: birdHead, at: birdHead.at, scale: [0.12, 0.12, 0.13], flat: true, group: "bird", name: "birdHead" });
  b.frustumBox(birdHead.local({ forward: 0.07, down: 0.015 }), birdHead.local({ forward: 0.19, down: 0.02 }), [0.055, 0.045], [0.01, 0.01], { bone: birdJaw, color: BEAK, group: "bird", name: "birdBeak" });
  for (const s of [1, -1]) {
    const wing = b.joint(`birdWing${s > 0 ? "L" : "R"}`, { parent: birdBodyChain.joints[1], at: [s * 0.09, 1.51, 0.78], dir: [s * 0.3, -0.15, -0.2], role: "wing" });
    b.extrude(
      [[0, 0], [0.1, -0.01], [0.16, -0.1], [0.11, -0.22], [0.02, -0.27], [-0.015, -0.12]],
      { at: wing.at, x: [s, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.008, smoothing: 1, color: BIRD_BLUE_DARK, bone: wing, group: "birdWings", name: `birdWing${s > 0 ? "L" : "R"}` },
    );
    b.cards([frame(wing.at, [s * 0.25, 0.8, -0.15])], featherTex, { size: [0.055, 0.16], lean: 22, bend: 12, color: WHITE, group: "birdWings", name: `wingFeather${s > 0 ? "L" : "R"}` });
    const eyeAt = birdHead.local({ left: s * 0.07, up: 0.035, forward: 0.105 });
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE, { bone: birdHead, at: eyeAt, scale: [0.018, 0.018, 0.01], group: "birdFace", name: `birdEye${s > 0 ? "L" : "R"}` });
  }
  // Bird feet wrap the capybara's crown with two tiny three-toed grips.
  for (const s of [1, -1]) {
    const footTarget: [number, number, number] = [s * 0.055, 1.34, 0.78];
    const birdLegPts = limb([s * 0.055, 1.49, 0.78], footTarget, [0.08, 0.08], [[0, 0, -1]]);
    const birdLeg = b.chain(`birdLeg${s > 0 ? "L" : "R"}`, birdLegPts, { parent: birdHip, names: [`birdAnkle${s > 0 ? "L" : "R"}`, `birdFoot${s > 0 ? "L" : "R"}`, `birdToeBase${s > 0 ? "L" : "R"}`], role: "leg", contact: footTarget });
    b.sweep(birdLeg, [0.012, 0.009], { color: BEAK, sides: 5, group: "birdFeet", name: `birdLegTube${s > 0 ? "L" : "R"}` });
    for (const toe of [-1, 0, 1]) b.spike(birdLeg.tip!.at, birdLeg.tip!.local([toe * 0.018, -0.008, 0.05]), 0.035, 0.006, { color: BEAK, group: "birdFeet", name: `birdToe${s > 0 ? "L" : "R"}${toe}` });
  }
  // A tiny leaf-like crown feather adds a storybook silhouette without a logo or emblem.
  b.extrude([[0, 0], [0.045, 0.02], [0.08, 0.1], [0.02, 0.16], [-0.02, 0.08]], { at: birdHead.local({ up: 0.08, back: 0.03 }), x: [1, 0, 0], thickness: 0.012, bevel: 0.004, color: LEAF, bone: birdHead, group: "bird", name: "leafCrest" });
  b.part(new THREE.SphereGeometry(1, 8, 5), FLOWER, { bone: head, at: head.local({ left: 0.07, up: 0.29, back: 0.01 }), scale: [0.032, 0.032, 0.018], flat: true, group: "headAccessory", name: "tinyFlower" });

  return b.root;
}

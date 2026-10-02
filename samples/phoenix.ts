import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull, bezier } from "../src/path";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { animeEye, cel, furEdge, INK, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";

const EMBER = cel("#ff5b22", "#b92839");
const FLAME = cel("#ff9f2f", "#db4528");
const GOLD = cel("#ffd15a", "#c86a28");
const CRIMSON = cel("#d83455", "#761f4c");
const INK_FLAME = inkLines(FLAME, { levels: [-0.25, 0.45], axis: [0, 1, 0], width: 0.06 });
const COAT = furEdge(EMBER, FLAME, { level: -0.15, teeth: 0.2, period: 0.055, along: [0, 0, 1], ink: INK, inkWidth: 0.035 });
const EYE = animeEye({ iris: "#ffbf3f", irisLight: "#fff0a1", irisDark: "#7c214f", blush: "#ff6686", size: 512 });
const FEATHER = svg(
  `<svg viewBox="0 0 64 128"><path d="M32 128 C14 111 4 87 13 62 C18 47 28 27 32 0 C36 27 46 47 51 62 C60 87 50 111 32 128Z" fill="#ffb22e"/><path d="M32 124 C26 95 27 58 32 8 C37 58 38 95 32 124Z" fill="#ff5a25"/><path d="M32 120 L32 20" stroke="#ffe27a" stroke-width="5"/></svg>`,
  { size: 256 },
);
const FLAME_CARD = svg(
  `<svg viewBox="0 0 64 128"><path d="M31 128 C8 107 9 85 25 66 C18 48 29 33 40 11 C44 36 59 47 48 72 C61 91 52 111 31 128Z" fill="#ffcf53"/><path d="M32 123 C19 103 25 83 35 70 C31 55 41 43 44 33 C54 60 48 81 40 94 C47 108 42 118 32 123Z" fill="#ff5625"/></svg>`,
  { size: 256 },
);

export const meta = {
  name: "Astral Phoenix",
  description: "A Genshin Impact-inspired phoenix with cel-shaded flame plumage, spread wings, jeweled eyes, and radiant tail feathers.",
  style: "Genshin Impact",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "phoenix", detail: 1, paintSize: 1024 });
  const hips = b.joint("hips", { at: [0, 0.94, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, 0],
      [0, 1.12, 0.08],
      [0, 1.34, 0.22],
      [0, 1.53, 0.42],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "spineTop", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.53, 0.42],
      [0, 1.66, 0.56],
      [0, 1.77, 0.66],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.82, 0.75], dir: [0, 0.05, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.045, down: 0.04 }), dir: [0, -0.12, 1], role: "jaw", group: "head" });

  const body = b.sweep(spine, (t) => 0.23 - t * 0.045, {
    color: COAT,
    section: { ngon: 8 },
    group: "body",
    name: "bodyCoat",
  });
  b.sweep(neck, (t) => 0.15 - t * 0.035, {
    color: INK_FLAME,
    section: { ngon: 7 },
    group: "body",
    name: "flameNeck",
  });

  for (const s of [1, -1]) {
    const shoulder = [s * 0.22, 1.38, 0.3] as [number, number, number];
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        shoulder,
        [s * 0.56, 1.63, 0.24],
        [s * 0.88, 1.9, 0.3],
        [s * 1.17, 2.03, 0.43],
        [s * 1.46, 1.92, 0.56],
      ]),
      {
        parent: spine.joints[2],
        names: s > 0 ? ["wingLRoot", "wingLElbow", "wingLWrist", "wingLHand", "wingLTip"] : ["wingRRoot", "wingRElbow", "wingRWrist", "wingRHand", "wingRTip"],
        role: "wing",
        group: "wings",
      },
    );
    const lower = catmull([
      shoulder,
      [s * 0.5, 1.35, 0.2],
      [s * 0.82, 1.5, 0.24],
      [s * 1.12, 1.62, 0.42],
      [s * 1.46, 1.92, 0.56],
    ]);
    b.membrane(wing, lower, { color: CRIMSON, thickness: 0.018, rows: 4, cols: 10, scallop: 0.12, group: "wings", name: `wingMembrane${s > 0 ? "L" : "R"}` });
    b.sweep(wing, [0.06, 0.012], { color: GOLD, section: { ngon: 5 }, caps: { start: "round", end: "point" }, group: "wings", name: `wingRidge${s > 0 ? "L" : "R"}` });
    b.cards([wing.at(0.22), wing.at(0.42), wing.at(0.62), wing.at(0.82)], FLAME_CARD, {
      size: [0.12, 0.3],
      lean: 62,
      bend: 22,
      vary: 0.25,
      rng: rng(42 + (s > 0 ? 1 : 2)),
      color: FLAME,
      sink: 0.04,
    });
    for (let i = 0; i < 5; i += 1) {
      const t = 0.16 + i * 0.16;
      const root = wing.at(t).at;
      const tip = [s * (0.92 + i * 0.14), 1.45 + i * 0.1, 0.6 + i * 0.11] as [number, number, number];
      const featherPath = bezier(root, [s * (0.7 + i * 0.1), 1.65 + i * 0.05, 0.46 + i * 0.08], [s * (0.84 + i * 0.14), 1.53 + i * 0.08, 0.58 + i * 0.1], tip);
      b.sweep(featherPath, [0.052 - i * 0.006, 0.006], {
        color: i % 2 === 0 ? FLAME : EMBER,
        caps: { start: "round", end: "point" },
        section: { ngon: 5 },
        bone: wing,
        group: "feathers",
        name: `flightFeather${s > 0 ? "L" : "R"}${i}`,
      });
      const cardFrame = frame([tip[0], tip[1], tip[2] + 0.01], [0, 0.8, 0.6]);
      b.cards([cardFrame], FEATHER, { size: [0.11, 0.35 - i * 0.025], lean: 55, bend: 18, color: i % 2 === 0 ? FLAME : GOLD, sink: 0.02, bone: wing.joints[wing.joints.length - 1] });
    }
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.12],
      [0, 0.74, -0.38],
      [0, 0.58, -0.72],
      [0, 0.67, -1.02],
      [0, 0.92, -1.28],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail", group: "tail" },
  );
  b.sweep(tail, (t) => 0.16 - t * 0.12, { color: CRIMSON, section: { ngon: 7 }, group: "tail", name: "tailCore" });
  for (const s of [-1, -0.5, 0, 0.5, 1]) {
    const base = tail.at(0.35 + Math.abs(s) * 0.04).at;
    const tip = [s * (0.36 + Math.abs(s) * 0.22), 1.02 + Math.abs(s) * 0.17, -1.62 - Math.abs(s) * 0.08] as [number, number, number];
    b.sweep(bezier(base, [s * 0.15, 0.62, -1.2], [s * 0.3, 0.95, -1.4], tip), [0.09, 0], {
      color: s === 0 ? GOLD : FLAME,
      caps: { start: "round", end: "point" },
      section: { ngon: 6 },
      bone: tail,
      group: "tail",
      name: `tailFlame${s}`,
    });
  }

  const legTargets = [
    [0.2, 0.1, 0.2] as [number, number, number],
    [-0.2, 0.1, 0.2] as [number, number, number],
  ];
  for (const s of [1, -1]) {
    const root = [s * 0.14, 0.98, 0.08] as [number, number, number];
    const target = legTargets[s > 0 ? 0 : 1];
    const points = limb(root, target, [0.27, 0.24, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, points, { parent: hips, names: s > 0 ? ["hipL", "kneeL", "ankleL", "footL"] : ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: target });
    b.sweep(leg, [0.065, 0.04], { color: GOLD, section: { ngon: 6 }, group: "legs", name: `legScale${s > 0 ? "L" : "R"}` });
    const ankle = leg.tip;
    if (!ankle) continue;
    for (let toe = -1; toe <= 1; toe += 1) {
      const toeEnd = [s * (0.2 + toe * 0.07), -0.002, 0.34 + Math.abs(toe) * 0.02] as [number, number, number];
      b.sweep([ankle.at, toeEnd], [0.018, 0], { color: CRIMSON, caps: { start: "round", end: "point" }, section: { ngon: 5 }, bone: ankle, group: "talons", name: `talon${s > 0 ? "L" : "R"}${toe}` });
    }
  }

  const skull = b.part(new THREE.SphereGeometry(0.17, 12, 9), INK_FLAME, { bone: head, at: head.at, scale: [1, 1.08, 1.18], group: "head", name: "skull" });
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = face.around(head.at).at(s * 34, 7);
    if (hit) b.decal(face, EYE, { at: hit, size: [0.105, 0.14], mirror: s > 0, lift: 0.004, name: `eye${s > 0 ? "L" : "R"}`, group: "face" });
  }
  b.spike(head.local({ forward: 0.12, down: 0.015 }), [0, 0, 1], 0.22, 0.065, { color: GOLD, caps: { start: "round", end: "point" }, bone: head, group: "face", name: "upperBeak" });
  b.spike(jaw.at, [0, -0.12, 1], 0.19, 0.052, { color: FLAME, caps: { start: "round", end: "point" }, bone: jaw, group: "face", name: "lowerBeak" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  for (const s of [1, -1]) {
    const crestBase = head.local({ left: s * 0.1, up: 0.08, back: 0.02 });
    const crestTip = head.local({ left: s * 0.2, up: 0.42, back: -0.04 });
    b.sweep(bezier(crestBase, head.local({ left: s * 0.13, up: 0.22 }), head.local({ left: s * 0.18, up: 0.3, back: -0.02 }), crestTip), [0.07, 0], { color: GOLD, caps: { start: "round", end: "point" }, section: { ngon: 5 }, bone: head, group: "crest", name: `crest${s > 0 ? "L" : "R"}` });
  }

  const breast = b.surface(body);
  for (const hit of breast.scatter(26, { rng: rng(19), minDist: 0.07, filter: (h) => h.n.z > 0.1 && h.n.y > -0.4 })) {
    b.stick(new THREE.ConeGeometry(0.035, 0.09, 5), GOLD, hit, { embed: 0.45, group: "breastPlumes" });
  }

  const emberRings = b.ring(head, { count: 7, radius: 0.205, fromDeg: -62, toDeg: 62, tilt: -10 });
  for (const item of emberRings.items) {
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), "#ffdf71", { frame: item, group: "embers", name: "crownEmber" }), 1.8);
  }
  for (const t of [0.14, 0.3, 0.48, 0.66, 0.82]) {
    const p = tail.at(t);
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), "#ff8b32", { at: p.at, bone: p.bone, group: "embers", name: "tailEmber" }), 1.5);
  }

  return b.root;
}

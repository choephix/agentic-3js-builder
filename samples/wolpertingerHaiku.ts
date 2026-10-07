import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { offset, rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, mottle, paint, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Wolpertinger",
  description:
    "A horned, winged, fanged hare: long ears, branching antlers, a fan of teal feathers with gold tips on each half-open wing, a bell on a red collar and a daisy tucked behind one ear.",
  style: "whimsical",
  commit: "b816db2",
};

const FUR = "#b5804a";
const FUR_DARK = "#7b4f2b";
const CREAM = "#f8e8c8";
const PINK = "#f4a0ab";
const NOSE = "#e56f7a";
const TEAL = "#2e9f8e";
const TEAL_DEEP = "#23806f";
const MINT = "#dff5ee";
const GOLD = "#f2bb45";
const ANTLER = "#f1e0b8";
const IVORY = "#fff9ee";
const INK = "#2a1a10";
const RED = "#d9503f";
const PETAL = "#fff1f5";

const PRIMARIES = 7;
const COVERTS = 4;

const coat = countershade(mottle(FUR, FUR_DARK, { size: 0.11, seed: 3 }), CREAM, { level: -0.2 });
const primaryPaint = paint((_p, _n, s) => (s[0] > 0.18 ? GOLD : spots(TEAL, MINT, { size: 0.03, amount: 0.3, seed: 5 })));
const covertPaint = spots(TEAL_DEEP, "#7fd6c2", { size: 0.025, amount: 0.3, seed: 8 });
const earPaint = paint((_p, _n, s) => (s[1] > 0.012 && Math.abs(s[0]) < 0.02 * (1 - s[1] / 0.16) ? PINK : coat));

// A leaf-shaped feather plate in its own plane: x runs out along the feather, y across it.
function featherOutline(len: number): OutlinePoint[] {
  return [
    [0, -0.02],
    [len * 0.35, -0.052],
    [len * 0.8, -0.03],
    [len, 0, "sharp"],
    [len * 0.8, 0.03],
    [len * 0.35, 0.05],
    [0, 0.02],
  ];
}

// Long hare ear, width along x, height along y (leaned back in the model).
const earOutline: OutlinePoint[] = [
  [-0.03, 0],
  [-0.027, 0.07],
  [-0.016, 0.13],
  [0, 0.16, "sharp"],
  [0.016, 0.13],
  [0.027, 0.07],
  [0.03, 0],
];

export default function build() {
  const b = createBuilder({ name: "wolpertinger" });

  // Skeleton: hips root, spine, neck and head, jaw.
  const hips = b.joint("hips", { at: [0, 0.3, -0.14], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.3, -0.14], [0, 0.32, -0.02], [0, 0.34, 0.11]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.34, 0.11], [0, 0.4, 0.19], [0, 0.455, 0.25]]), {
    parent: spine.joints[1],
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 0.48, 0.27], dir: [0, 0, 1], role: "head" });
  const hp = (left: number, up: number, forward: number) => head.local({ left, up, forward });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.075, 0), dir: [0, 0, 1], role: "jaw" });

  // Body, neck and head masses.
  const body = b.sweep(spine, (t) => [0.102 + 0.02 * Math.sin(Math.PI * t), 0.122 + 0.012 * Math.sin(Math.PI * t)], {
    color: coat,
  });
  const neckTube = b.sweep(neck, (t) => 0.072 - 0.018 * t, { color: coat });
  const skull = b.sweep(
    catmull([hp(0, 0, -0.04), hp(0, 0.01, 0), hp(0, 0, 0.03)]),
    (t) => {
      const k = Math.sin(Math.PI * (0.3 + 0.4 * t));
      return [0.1 * k, 0.093 * k];
    },
    { bone: head, color: coat },
  );
  const muzzle = b.part(new THREE.SphereGeometry(0.05, 12, 8), CREAM, { bone: head, at: hp(0, -0.04, 0.1) });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), NOSE, { bone: head, at: hp(0, -0.005, 0.15) });

  // Faces: big eyes, rosy cheeks, a smiling mouth.
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#fffdf6"/><circle cx="32" cy="33" r="22" fill="#6b4226"/><circle cx="32" cy="34" r="13" fill="${INK}"/><circle cx="39" cy="25" r="7" fill="#ffffff"/><circle cx="26" cy="43" r="3" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const blushTex = svg(`<svg viewBox="0 0 32 24"><ellipse cx="16" cy="12" rx="15" ry="10" fill="${PINK}"/></svg>`, {
    size: 128,
  });
  const mouthTex = svg(
    `<svg viewBox="0 0 64 32"><path d="M6 6 Q18 26 32 9 Q46 26 58 6" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  b.decal(muzzle, mouthTex, { at: hp(0, -0.05, 0.13), dir: [0, -0.2, 1], size: [0.05, 0.025] });

  for (const s of [1, -1]) {
    const cheek = b.part(new THREE.SphereGeometry(0.042, 10, 8), CREAM, { bone: head, at: hp(s * 0.075, -0.03, 0.03) });
    b.decal(skull, eyeTex, { at: hp(s * 0.075, 0.02, 0.07), dir: [s * 0.5, 0.1, 1], size: [0.065, 0.065] });
    b.decal(cheek, blushTex, { at: hp(s * 0.115, -0.035, 0.045), dir: [s, 0, 0.4], size: [0.04, 0.028] });

    // Upper fang over the closed lower jaw.
    b.spike(hp(s * 0.03, -0.065, 0.1), [0, -1, 0], 0.05, 0.009, { bone: head, color: IVORY });

    // Whiskers.
    for (const k of [0, 1])
      b.rod(hp(s * 0.04, -0.035 + 0.012 * k, 0.14), hp(s * 0.2, -0.04 + 0.03 * k, 0.13), 0.0025, {
        bone: head,
        color: IVORY,
      });

    // Antlers: a beam with two tines.
    b.sweep(catmull([hp(s * 0.055, 0.07, 0.03), hp(s * 0.1, 0.15, 0), hp(s * 0.13, 0.245, -0.045)]), (t) => 0.014 - 0.009 * t, {
      bone: head,
      color: ANTLER,
      caps: { start: "round", end: "point" },
    });
    b.sweep([hp(s * 0.1, 0.15, 0), hp(s * 0.155, 0.19, 0.03)], [0.008, 0.003], {
      bone: head,
      color: ANTLER,
      caps: { start: "round", end: "point" },
    });
    b.sweep([hp(s * 0.12, 0.2, -0.02), hp(s * 0.2, 0.29, -0.02)], [0.008, 0.003], {
      bone: head,
      color: ANTLER,
      caps: { start: "round", end: "point" },
    });

    // Long hare ears, leaning back and splayed.
    b.extrude(earOutline, {
      at: hp(s * 0.03, 0.06, -0.05),
      x: [1, 0, 0],
      y: [s * 0.18, 0.96, -0.24],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: earPaint,
      bone: head,
    });
  }

  // Lower jaw, with two small fangs pointing up.
  b.sweep(catmull([jaw.at, hp(0, -0.085, 0.07), hp(0, -0.082, 0.11)]), (t) => [0.03 - 0.005 * t, 0.02], {
    bone: jaw,
    color: CREAM,
  });
  for (const s of [1, -1])
    b.spike(hp(s * 0.03, -0.09, 0.09), [0, 1, 0], 0.03, 0.007, { bone: jaw, color: IVORY });

  // Daisy tucked behind the right ear.
  const flower = hp(-0.085, 0.045, -0.02);
  b.ring(frame(flower, [-1, 0.3, 0.2]), { count: 5, radius: 0.028 }, (petal) =>
    b.part(new THREE.SphereGeometry(0.018, 8, 6), PETAL, { bone: head, at: petal }),
  );
  b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { bone: head, at: flower });

  // Red collar with a bell hanging under the neck.
  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.006 });
  b.sweep(collar, 0.008, { color: RED });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, {
    bone: neck.joints[1],
    at: offset(collar.at(0.5), [0, -1, 0], 0.02),
  });

  // Legs: digitigrade hind legs with a flat foot, straight front arms with paws.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.075, 0.3, -0.12];
    const foot: [number, number, number] = [s * 0.085, 0.03, 0.06];
    const hindPts = limb(hip, foot, [0.13, 0.13, 0.1], [[0, 0, 1]], { sole: [0, 0, 1] });
    const hind = b.chain(`hind${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hind, (t) => 0.072 - 0.03 * t, { color: FUR_DARK, bands: [[0.66, coat]] });

    const armPts = limb([s * 0.07, 0.3, 0.09], [s * 0.07, 0.03, 0.15], [0.14, 0.14], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, (t) => 0.03 - 0.008 * t, { color: coat });

    const wrist = arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.036, 10, 8), FUR_DARK, { bone: wrist, at: [s * 0.07, 0.036, 0.15] });
    for (const dx of [-0.018, 0, 0.018])
      b.spike([s * 0.07 + dx, 0.03, 0.18], [0, -0.3, 1], 0.022, 0.006, { bone: wrist, color: IVORY });

    const toeJoint = hind.joints[hind.joints.length - 1];
    for (const dx of [-0.022, 0, 0.022]) {
      b.part(new THREE.SphereGeometry(0.026, 8, 6), FUR_DARK, {
        bone: toeJoint,
        at: [s * 0.085 + dx, 0.026, 0.085],
      });
      b.spike([s * 0.085 + dx, 0.02, 0.105], [0, -0.2, 1], 0.024, 0.006, { bone: toeJoint, color: IVORY });
    }
  }

  // Cotton tail puff.
  const tail = b.part(new THREE.SphereGeometry(0.085, 10, 8), CREAM, { bone: hips, at: [0, 0.34, -0.25] });

  // Half-open wings: a fan of long primaries with gold tips over a row of short coverts.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const top = new THREE.Vector3(s * 0.3, 0.95, -0.2);
    const back = new THREE.Vector3(s * 0.95, 0.12, -0.45);
    const mid = top.clone().lerp(back, 0.5).normalize();
    const root: [number, number, number] = [s * 0.075, 0.42, 0.02];
    const wing = b.joint(`wing${side}`, {
      parent: spine.joints[1],
      at: root,
      dir: [mid.x, mid.y, mid.z],
      role: "wing",
    });
    const feather = (k: number, len: number, thick: number, color: typeof primaryPaint) => {
      const u = new THREE.Vector3().lerpVectors(top, back, k).normalize();
      const v = new THREE.Vector3(0, 0, 1).addScaledVector(u, -u.z).normalize();
      b.extrude(featherOutline(len), {
        at: root,
        x: [u.x, u.y, u.z],
        y: [v.x, v.y, v.z],
        thickness: thick,
        bevel: thick / 3,
        smoothing: 1,
        color,
        bone: wing,
      });
    };
    for (let i = 0; i < PRIMARIES; i++) {
      const k = i / (PRIMARIES - 1);
      feather(k, 0.2 + 0.06 * Math.sin(Math.PI * (0.15 + 0.7 * k)), 0.008, primaryPaint);
    }
    for (let i = 0; i < COVERTS; i++) {
      const k = 0.1 + (0.8 * i) / (COVERTS - 1);
      feather(k, 0.12, 0.01, covertPaint);
    }
  }

  // Fur: tufts on the body, head and tail.
  const tuft = svg(`<svg viewBox="0 0 32 64"><path d="M16 64 C6 44 3 22 16 2 C29 22 26 44 16 64Z" fill="#ffffff"/></svg>`, {
    size: 128,
  });
  const bodyHits = b.surface(body).scatter(260, { rng: rng(3), minDist: 0.022, filter: (h) => h.n.y > -0.4 });
  b.cards(bodyHits, tuft, { size: [0.03, 0.065], lean: 60, bend: 25, vary: 0.3, rng: rng(4), color: coat });
  const headHits = b.surface(skull).scatter(60, { rng: rng(5), minDist: 0.02, filter: (h) => h.n.z < 0.1 });
  b.cards(headHits, tuft, { size: [0.025, 0.05], lean: 60, bend: 20, vary: 0.3, rng: rng(6), color: coat });
  const puffHits = b.surface(tail).scatter(70, { rng: rng(7), minDist: 0.02 });
  b.cards(puffHits, tuft, { size: [0.03, 0.06], lean: 60, vary: 0.3, rng: rng(8), color: CREAM });

  return b.root;
}

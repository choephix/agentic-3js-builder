import { BoxGeometry, ConeGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";

export const meta = {
  name: "Silverback Gorilla",
  description: "A massive silverback mountain gorilla in a grounded knuckle-walking stance, with a silver saddle, crest, brow and leathery face.",
  builtBy: "GPT-6 Astra",
};

const FUR = "#202626";
const FUR_LIT = "#3b4140";
const FUR_DEEP = "#101313";
const SILVER = "#7d8581";
const SILVER_HI = "#aeb5ae";
const FACE = "#2d2a27";
const FACE_LIT = "#554a42";
const NOSE = "#131515";
const MOUTH = "#120d0e";
const EYE = "#0a0b0b";
const IRIS = "#6e5130";
const NAIL = "#6e665d";
const TONGUE = "#673a3d";

type V3 = [number, number, number];

const coat = paint((p, n) => {
  if (p.z > -0.72 && p.z < 0.3 && n.y > 0.2) return n.y > 0.72 ? SILVER_HI : SILVER;
  return n.y > 0.6 ? FUR_LIT : FUR;
});

export default function build() {
  const b = createBuilder({ name: "silverbackGorilla", detail: 1 });
  const random = rng(41);

  // A low, deep torso swells into the characteristic shoulder hump.
  const stations = [
    { at: [0, 0.98, -0.78] as V3, w: 0.36, h: 0.42 },
    { at: [0, 1.02, -0.58] as V3, w: 0.62, h: 0.62 },
    { at: [0, 1.04, -0.24] as V3, w: 0.72, h: 0.72 },
    { at: [0, 1.11, 0.08] as V3, w: 0.68, h: 0.82 },
    { at: [0, 1.19, 0.33] as V3, w: 0.59, h: 0.78 },
    { at: [0, 1.28, 0.48] as V3, w: 0.42, h: 0.56 },
  ] as const;
  const bodyPath = catmull(stations.map((s) => s.at));
  const hips = b.joint("hips", { at: stations[2].at, role: "spine", group: "body" });
  const spine = b.chain("spine", bodyPath.slice(bodyPath.knots[2], 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "shoulder", "neckBase"],
    role: "spine",
    group: "body",
  });
  const body = b.loft(stations, {
    bone: [hips, spine],
    color: coat,
    sides: 10,
    caps: { start: "round", end: "round" },
    group: "body",
    name: "massive torso",
  });

  // A short tail nub is tucked into the rump, mostly hidden by the fur.
  const tail = b.chain("tail", catmull([[0, 1.11, -0.7], [0, 1.0, -0.88], [0, 0.91, -0.97]]), {
    parent: hips,
    count: 2,
    names: ["tailBase", "tailTip"],
    role: "tail",
    group: "body",
  });
  b.sweep(tail, [0.09, 0.025], { color: FUR_DEEP, sides: 7, group: "body" });

  // Arms are longer than the legs and finish on broad, dark knuckles.
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const arm = b.chain(`arm${side}`, [
      [s * 0.37, 1.28, 0.34],
      [s * 0.43, 0.93, 0.4],
      [s * 0.39, 0.58, 0.48],
      [s * 0.34, 0.23, 0.55],
      [s * 0.33, 0.09, 0.59],
    ], {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `knuckle${side}`],
      role: "arm",
      contact: [s * 0.33, 0, 0.59],
      group: `arm${side}`,
    });
    b.sweep(arm, (t) => [0.115 - 0.07 * t, 0.13 - 0.075 * t], {
      color: coat,
      sides: 8,
      caps: { start: "round", end: "flat" },
      group: `arm${side}`,
    });
    const wrist = arm.joints[2];
    b.part(new BoxGeometry(0.2, 0.14, 0.22), FACE, {
      bone: wrist,
      at: [s * 0.33, 0.085, 0.61],
      group: `arm${side}`,
      name: `knuckle block ${side}`,
    });
    for (const dx of [-0.055, 0, 0.055]) {
      b.sweep([
        [s * 0.33 + dx, 0.032, 0.66],
        [s * 0.33 + dx, 0.017, 0.73],
      ], [0.022, 0.016], { bone: wrist, color: NAIL, sides: 6, caps: "round", group: `arm${side}` });
    }

    // Compact hind legs tuck under the pelvis with wide, planted feet.
    const leg = b.chain(`leg${side}`, [
      [s * 0.3, 1.01, -0.45],
      [s * 0.38, 0.72, -0.48],
      [s * 0.34, 0.42, -0.35],
      [s * 0.29, 0.16, -0.28],
      [s * 0.29, 0.08, -0.22],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.29, 0, -0.18],
      group: `leg${side}`,
    });
    b.sweep(leg, (t) => [0.13 - 0.075 * t, 0.14 - 0.085 * t], {
      color: coat,
      sides: 8,
      caps: { start: "round", end: "flat" },
      group: `leg${side}`,
    });
    const foot = leg.joints[2];
    b.part(new BoxGeometry(0.25, 0.13, 0.32), FACE, {
      bone: foot,
      at: [s * 0.29, 0.075, -0.17],
      group: `leg${side}`,
      name: `hind foot ${side}`,
    });
    for (const dx of [-0.06, 0, 0.06]) {
      b.spike([s * 0.29 + dx, 0.025, -0.02], [0, 0.02, 1], 0.1, 0.018, {
        bone: foot,
        color: NAIL,
        group: `leg${side}`,
      });
    }
  }

  // Head and neck: a wedge-like skull rides the forward end of the spine.
  const skull = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 1.57, 0.49],
    dir: [0, -0.16, 1],
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim([0, -0.16, 1], [0, 1, 0], "z") });
  b.loft([
    { at: head.p([0, 0.02, -0.12]), w: 0.38, h: 0.36 },
    { at: head.p([0, 0.02, 0.08]), w: 0.42, h: 0.38 },
    { at: head.p([0, -0.015, 0.25]), w: 0.34, h: 0.29 },
    { at: head.p([0, -0.04, 0.4]), w: 0.29, h: 0.24 },
  ], { bone: skull, color: FUR, sides: 9, group: "head", name: "heavy skull" });
  b.loft([
    { at: head.p([0, -0.09, 0.2]), w: 0.27, h: 0.2 },
    { at: head.p([0, -0.13, 0.35]), w: 0.24, h: 0.17 },
    { at: head.p([0, -0.14, 0.48]), w: 0.2, h: 0.14 },
  ], { bone: skull, color: FACE, sides: 8, group: "face", name: "leathery face" });

  // A tall sagittal crest and a low, projecting brow make the silhouette unmistakable.
  b.extrude([[0, 0], [0.1, 0.08], [0.19, 0.2], [0.28, 0.12], [0.33, 0]] as [number, number][], {
    at: head.p([0, 0.03, -0.12]),
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.07,
    bevel: 0.01,
    color: FUR_DEEP,
    bone: skull,
    group: "head",
    name: "sagittal crest",
  });
  b.capsule(head.p([-0.18, 0.08, 0.13]), head.p([0.18, 0.08, 0.13]), 0.045, {
    bone: skull,
    color: FUR_DEEP,
    sides: 8,
    group: "head",
    name: "heavy brow",
  });

  // Eyes are small and deep-set beneath the brow; the nose and muzzle stay nearly black.
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.037, b.segments(7), b.segments(5)), IRIS, { bone: skull, at: head.p([s * 0.12, 0.025, 0.22]), group: "face" });
    b.part(new SphereGeometry(0.019, b.segments(6), b.segments(4)), EYE, { bone: skull, at: head.p([s * 0.12, 0.023, 0.245]), group: "face" });
    b.part(new SphereGeometry(0.007, b.segments(5), b.segments(3)), "#d8c9a1", { bone: skull, at: head.p([s * 0.126, 0.03, 0.253]), group: "face" });
    b.part(new SphereGeometry(0.115, b.segments(8), b.segments(6)), FUR, {
      bone: skull,
      at: head.p([s * 0.245, 0.1, -0.1]),
      scale: [1, 0.9, 0.48],
      group: "head",
      name: `rounded ear ${s > 0 ? "L" : "R"}`,
    });
    b.part(new SphereGeometry(0.072, b.segments(7), b.segments(5)), FACE_LIT, {
      bone: skull,
      at: head.p([s * 0.252, 0.1, -0.145]),
      scale: [1, 0.8, 0.22],
      group: "head",
    });
  }
  b.part(new SphereGeometry(0.13, b.segments(8), b.segments(6)), NOSE, { bone: skull, at: head.p([0, -0.12, 0.49]), scale: [1.2, 0.65, 0.7], group: "face", name: "flat nose" });
  for (const s of [1, -1]) b.part(new SphereGeometry(0.024, 6, 4), MOUTH, { bone: skull, at: head.p([s * 0.055, -0.13, 0.505]), scale: [1, 0.6, 0.55], group: "face" });

  // Lower jaw is its own chain so a rigger can open the mouth.
  const jaw = head.joint("jaw", { parent: skull, at: [0, -0.11, 0.12], aim: [0, -0.15, 0.45], role: "jaw", group: "jaw" });
  b.loft([
    { at: head.p([0, -0.12, 0.12]), w: 0.23, h: 0.12 },
    { at: head.p([0, -0.16, 0.32]), w: 0.2, h: 0.1 },
    { at: head.p([0, -0.17, 0.46]), w: 0.17, h: 0.07 },
  ], { bone: jaw, color: FACE_LIT, sides: 8, group: "jaw" });
  b.rod(head.p([0, -0.16, 0.47]), head.p([0, -0.18, 0.52]), 0.012, { bone: skull, color: MOUTH, group: "jaw" });
  b.sweep([head.p([0, -0.18, 0.43]), head.p([0, -0.2, 0.52])], [0.018, 0.008], { bone: jaw, color: TONGUE, sides: 6, group: "jaw" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // Sparse, angular fur tufts break the smooth primitive silhouette around the saddle and mane.
  const bodySkin = b.surface(body);
  for (const hit of bodySkin.scatter(28, {
    rng: random,
    minDist: 0.09,
    filter: (h) => h.n.y > 0.35 && h.at.z > -0.65 && h.at.z < 0.42,
  })) {
    b.stick(new ConeGeometry(0.028, 0.11, b.segments(5)), hit.at.z > -0.65 && hit.at.z < 0.18 ? SILVER_HI : FUR_LIT, hit, {
      embed: 0.45,
      flow: [0, 0, -1],
      scale: 0.7 + random() * 0.55,
      group: "fur tufts",
    });
  }
  // A beard of coarse tufts hangs below the jaw.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.spike(head.p([s * (0.08 + i * 0.035), -0.12, 0.2 + i * 0.035]), [0, -1, 0.15], 0.11 + i * 0.012, 0.018, {
        bone: skull,
        color: FUR_DEEP,
        group: "head",
      });
    }
  }

  return b.root;
}

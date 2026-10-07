```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, scales, stripes, spots } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon with Egg",
  description:
    "A house-cat-sized baby dragon sitting beside its broken speckled egg: teal scales, buttery belly, orange back spines, oversized amber-webbed wings, a spade tail, a toothy grin and a wisp of smoke.",
};

const TEAL = "#2fa59a";
const TEAL2 = "#38b9a8";
const TEAL_D = "#1c7a7a";
const BELLY_A = "#f7e3a1";
const BELLY_B = "#e8c97a";
const ORANGE = "#ff9a3c";
const AMBER = "#ffb83f";
const AMBER_DK = "#e8892a";
const HORN = "#f3dfb0";
const TOOTH = "#fffaf0";
const DARK = "#1d2a2e";
const WHITE = "#ffffff";
const SMOKE = "#d6dadd";
const SHELL = "#f1e6c8";
const SPECK = "#c4784a";

const side = (s: number, x: number) => (s > 0 ? { left: x } : { right: x });
const ell = (sx: number, sy: number, sz: number, w = 10, h = 8) =>
  new THREE.SphereGeometry(1, w, h).scale(sx, sy, sz);

export default function build() {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- paints ----------
  const coat = scales([TEAL, TEAL2], TEAL_D, { size: 0.028, width: 0.15, seed: 3 });
  const belly = stripes(BELLY_A, BELLY_B, { size: 0.02, axis: "y", width: 0.5, seed: 2 });
  const bodyPaint = paint((_p, n) => (n.z > 0.4 && n.y < 0.7 ? belly : coat));
  const tailPaint = paint((_p, n) => (n.y < -0.35 ? belly : coat));
  const shellPaint = spots(SHELL, SPECK, { size: 0.022, amount: 0.3, seed: 5 });
  const wingSkin = paint((_p, _n, s) => (s[1] < 0.1 || s[1] > 0.9 ? AMBER_DK : s[1] > 0.4 && s[1] < 0.6 ? "#ffc965" : AMBER));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.09, -0.07], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.09, -0.07],
      [0, 0.16, -0.04],
      [0, 0.235, -0.01],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.235, -0.01],
      [0, 0.29, 0.04],
      [0, 0.32, 0.09],
    ]),
    { parent: chest, count: 2, role: "neck" },
  );
  const H: [number, number, number] = [0, 0.325, 0.11];
  const head = b.joint("head", { parent: neck.joints[1], at: H, dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.025 }),
    aim: head.local({ forward: 0.1, down: 0.025 }),
    role: "jaw",
  });

  // ---------- body, neck ----------
  const bodyTube = b.sweep(spine, [0.088, 0.092, 0.07], { color: bodyPaint });
  const neckTube = b.sweep(neck, [0.062, 0.05, 0.046], { color: bodyPaint });

  // back spines
  b.along(bodyTube, 5, (at) => b.spike(at, at, 0.04, 0.014, { color: ORANGE, sides: 5 }));
  b.along(neckTube, 3, (at) => b.spike(at, at, 0.036, 0.012, { color: ORANGE, sides: 5 }));

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.085, -0.09],
      [-0.03, 0.06, -0.19],
      [-0.12, 0.045, -0.25],
      [-0.2, 0.035, -0.2],
      [-0.23, 0.028, -0.12],
      [-0.24, 0.026, -0.05],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.06, 0.05, 0.04, 0.032, 0.024], { color: tailPaint });
  b.along(tailTube, 6, (at) => b.spike(at, at, 0.034 * (1 - 0.55 * at.t), 0.012, { color: ORANGE, sides: 5 }));
  b.extrude(
    [
      [0, -0.01],
      [0.015, -0.03],
      [0.05, -0.02],
      [0.075, 0, "sharp"],
      [0.05, 0.02],
      [0.015, 0.03],
      [0, 0.01],
    ],
    {
      at: [-0.24, 0.027, -0.05],
      x: [-0.14, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: ORANGE,
      bone: tail.joints[tail.joints.length - 1],
    },
  );

  // ---------- feet helper ----------
  const foot = (bone: any, x: number, z: number, sc: number) => {
    b.capsule([x, 0.022 * sc, z - 0.03 * sc], [x, 0.022 * sc, z], 0.022 * sc, { bone, color: TEAL });
    for (const k of [-1, 0, 1]) {
      const base: [number, number, number] = [x + k * 0.02 * sc, 0.014 * sc, z];
      const tip: [number, number, number] = [x + k * 0.03 * sc, 0.013 * sc, z + 0.04 * sc];
      b.capsule(base, tip, 0.011 * sc, { bone, color: TEAL, sides: 6 });
      b.spike(tip, [k * 0.25, -0.02, 1], 0.02 * sc, 0.007 * sc, { bone, color: HORN, sides: 5 });
    }
  };

  // ---------- legs & arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // hind leg
    const hipP: [number, number, number] = [s * 0.07, 0.085, -0.05];
    const footP: [number, number, number] = [s * 0.085, 0.025, 0.07];
    const legPts = limb(hipP, footP, [0.085, 0.085], [s * 0.6, 1, 0.2]);
    const leg = b.chain(`leg${S}`, legPts, {
      parent: spine.joints[0],
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [footP[0], 0, footP[2]],
    });
    b.part(ell(0.06, 0.065, 0.07), coat, { bone: leg.joints[0], at: [s * 0.075, 0.085, -0.045], flat: true });
    b.sweep(leg, [0.05, 0.032, 0.026], { color: coat });
    foot(leg.tip, footP[0], footP[2], 1);

    // arm
    const shP: [number, number, number] = [s * 0.07, 0.2, 0.03];
    const handP: [number, number, number] = [s * 0.09, 0.022, 0.12];
    const armPts = limb(shP, handP, [0.095, 0.095], [s * 1, 0, 0.3]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.034, 0.024, 0.02], { color: coat });
    foot(arm.tip, handP[0], handP[2], 0.8);

    // ---------- wing ----------
    const W: [number, number, number] = [s * 0.27, 0.4, -0.07];
    const wing = b.chain(
      `wing${S}`,
      catmull([[s * 0.055, 0.22, -0.01], [s * 0.15, 0.34, -0.07], W]),
      { parent: chest, names: [`wingArm${S}`, `wingFore${S}`, `wingWrist${S}`], role: "wing" },
    );
    b.sweep(wing, [0.026, 0.014], { color: TEAL_D });
    b.spike(wing.at(1), [s * 0.3, 0.6, 0.8], 0.035, 0.009, { bone: wing.tip!, color: HORN, sides: 5 });
    const defs: [string, [number, number, number], [number, number, number]][] = [
      ["A", [s * 0.41, 0.46, -0.08], [s * 0.56, 0.5, -0.1]],
      ["B", [s * 0.41, 0.38, -0.15], [s * 0.56, 0.34, -0.2]],
      ["C", [s * 0.34, 0.3, -0.17], [s * 0.42, 0.2, -0.26]],
    ];
    const fingers = defs.map(([n, mid, tip]) => {
      const f = b.chain(`finger${n}${S}`, catmull([W, mid, tip]), {
        parent: wing.tip!,
        names: [`finger${n}${S}1`, `finger${n}${S}2`],
        role: "digit",
      });
      b.sweep(f, [0.011, 0.004], { color: TEAL_D });
      b.spike(f.at(1), f.at(1), 0.028, 0.006, { color: HORN, sides: 5 });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: wingSkin, thickness: 0.004, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { color: wingSkin, thickness: 0.004, scallop: 0.12 });
    b.membrane(fingers[2], [W, [s * 0.07, 0.13, -0.13]], {
      color: wingSkin,
      thickness: 0.004,
      scallop: 0.1,
      bone: spine.joints[1],
    });
  }

  // ---------- head ----------
  b.part(ell(0.068, 0.062, 0.066, 12, 9), coat, { bone: head, at: head.local({ up: 0.012 }), flat: true });
  b.part(ell(0.045, 0.034, 0.065), coat, { bone: head, at: head.local({ forward: 0.085, up: -0.005 }), flat: true });
  b.part(ell(0.037, 0.015, 0.055), BELLY_A, { bone: jaw, at: head.local({ forward: 0.075, down: 0.045 }), flat: true });

  // teeth
  const upper: [number, number][] = [[0.05, 0.034], [0.075, 0.038], [0.1, 0.038], [0.122, 0.028], [0.145, 0.01]];
  for (const [f, x] of upper)
    for (const s of [1, -1])
      b.spike(head.local({ ...side(s, x), forward: f, up: -0.03 }), [0, -1, 0], 0.017, 0.006, {
        bone: head, color: TOOTH, sides: 4,
      });
  const lower: [number, number][] = [[0.045, 0.026], [0.07, 0.029], [0.095, 0.026], [0.115, 0.016]];
  for (const [f, x] of lower)
    for (const s of [1, -1])
      b.spike(head.local({ ...side(s, x), forward: f, down: 0.04 }), [0, 1, 0], 0.014, 0.005, {
        bone: jaw, color: TOOTH, sides: 4,
      });

  // nostrils & smoke
  const nostrilL = head.local({ left: 0.016, forward: 0.128, up: 0.02 });
  for (const s of [1, -1])
    b.part(ell(0.008, 0.006, 0.006, 6, 4), DARK, {
      bone: head,
      at: head.local({ ...side(s, 0.016), forward: 0.128, up: 0.02 }),
    });
  const add = (v: THREE.Vector3, x: number, y: number, z: number) => v.clone().add(new THREE.Vector3(x, y, z));
  b.sweep(
    catmull([
      add(nostrilL, 0, 0.012, 0.01),
      add(nostrilL, 0.012, 0.045, 0.03),
      add(nostrilL, -0.01, 0.08, 0.035),
      add(nostrilL, 0.014, 0.12, 0.03),
      add(nostrilL, 0, 0.158, 0.025),
    ]),
    [0.005, 0.011, 0.016, 0.021, 0.013],
    { bone: head, color: SMOKE, sides: 6 },
  );

  // eyes
  for (const s of [1, -1]) {
    const e = head.local({ ...side(s, 0.04), forward: 0.045, up: 0.032 });
    const d = new THREE.Vector3(s * 0.5, 0.1, 0.85).normalize();
    b.part(new THREE.SphereGeometry(0.031, 10, 8), AMBER, { bone: head, at: e });
    b.part(ell(0.011, 0.017, 0.006, 8, 6), DARK, {
      bone: head, at: e.clone().addScaledVector(d, 0.027), dir: d, axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), WHITE, {
      bone: head, at: e.clone().addScaledVector(d, 0.03).add(new THREE.Vector3(-s * 0.008, 0.011, 0)),
    });
    // brow ridge
    b.part(ell(0.026, 0.009, 0.03, 8, 5), TEAL_D, {
      bone: head, at: head.local({ ...side(s, 0.04), forward: 0.045, up: 0.06 }), flat: true,
    });
    // stubby horns
    b.spike(head.local({ ...side(s, 0.035), up: 0.055, back: 0.015 }), [s * 0.25, 0.8, -0.55], 0.058, 0.016, {
      bone: head, color: HORN, sides: 6,
    });
    // cheek frills
    b.spike(head.local({ ...side(s, 0.055), back: 0.01, up: -0.005 }), [s, 0.1, -0.6], 0.04, 0.012, {
      bone: head, color: ORANGE, sides: 5,
    });
  }

  // ---------- egg ----------
  const ex = 0.25, ez = 0.1;
  b.lathe(
    [
      [0, 0],
      [0.04, 0.003],
      [0.07, 0.025],
      [0.08, 0.07],
      [0.076, 0.1],
      [0.068, 0.1],
      [0.07, 0.07],
      [0.062, 0.03],
      [0.035, 0.012],
      [0, 0.01],
    ],
    { at: [ex, 0, ez], bone: hips, color: shellPaint, segments: 14 },
  );
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    b.spike(
      [ex + Math.cos(a) * 0.073, 0.092, ez + Math.sin(a) * 0.073],
      [Math.cos(a) * 0.2, 1, Math.sin(a) * 0.2],
      i % 2 ? 0.048 : 0.026,
      0.015,
      { bone: hips, color: shellPaint, sides: 4 },
    );
  }
  // loose shards
  b.extrude(
    [[0, 0], [0.05, 0.005], [0.07, 0.04], [0.035, 0.06, "sharp"], [0.005, 0.035]],
    { at: [0.16, 0.004, 0.23], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.005, bevel: 0.0015, color: shellPaint, bone: hips },
  );
  b.extrude(
    [[0, 0], [0.06, 0.004], [0.08, 0.03], [0.04, 0.055, "sharp"], [0.01, 0.04]],
    { at: [0.33, 0.003, 0.03], x: [0, 0, 1], y: [0.5, 0.85, 0], thickness: 0.005, bevel: 0.0015, color: shellPaint, bone: hips },
  );
  b.extrude(
    [[0, 0], [0.035, 0.002], [0.045, 0.025], [0.015, 0.035, "sharp"]],
    { at: [0.3, 0.004, 0.2], x: [1, 0, 0.3], y: [-0.3, 0, 1], thickness: 0.004, bevel: 0.001, color: shellPaint, bone: hips },
  );

  // open the grin a touch
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
```
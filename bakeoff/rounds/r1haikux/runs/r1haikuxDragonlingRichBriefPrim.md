```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const mix = (a: V, b: V, t: number): V => add(mul(a, 1 - t), mul(b, t));
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => mul(a, 1 / len(a));
const side = (s: number, p: V): V => [s * p[0], p[1], p[2]];
const sided = (stem: string, s: number): string => stem + (s > 0 ? "L" : "R");

/** Ellipsoid with radii r (metres), made from a unit sphere stretched on its axes. */
function ellipsoid(r: V, seg: number): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7)));
  g.scale(r[0], r[1], r[2]);
  return g;
}

// Wing outline on the +X side; the -X wing is mirrored.
const WING: Record<string, V> = {
  sh: [0.058, 0.262, 0.02],
  el: [0.135, 0.34, -0.01],
  wr: [0.2, 0.42, -0.04],
  f1: [0.31, 0.37, -0.02],
  f2: [0.3, 0.28, -0.1],
  f3: [0.23, 0.2, -0.2],
  fl: [0.08, 0.19, -0.08],
};

export const meta = {
  name: "Baby dragon by its egg",
  description:
    "A teal hatchling sits proudly beside its cracked, speckled egg: butter belly, soft orange spines, amber wing skin, a toothy grin and a wisp of smoke.",
};

export default function build() {
  const b = createBuilder({ name: "baby_dragon" });

  // ---- palette ---------------------------------------------------------
  const TEAL = "#2bb3a1";
  const TEAL_D = "#17806f";
  const TEAL_L = "#8ae0cc";
  const BUTTER = "#f6e4a0";
  const BUTTER_D = "#e2c168";
  const ORANGE = "#f9a25a";
  const CREAM = "#f7f0da";
  const WHITE = "#fffdf4";
  const AMBER = "#ffae1e";
  const AMBER_SKIN = "#f6b64e";
  const PUPIL = "#1d1a24";
  const MOUTH = "#7c2d3b";
  const BLUSH = "#f5969b";
  const SMOKE = "#dde3ea";
  const NOSTRIL = "#2b2327";
  const EGG = "#f1e8cf";
  const SPECK_BROWN = "#7b5638";
  const SPECK_TEAL = "#2c9c8c";

  // ---- helpers ---------------------------------------------------------
  const ball = (at: any, r: V, color: string, seg = 12) =>
    b.part({ geo: ellipsoid(r, seg), color, at });

  // a capsule from p to q
  const bone = (p: V, q: V, rad: number, color: string) => {
    const L = len(sub(q, p));
    b.part({
      geo: new THREE.CapsuleGeometry(rad, Math.max(0.002, L - 2 * rad), 4, 10),
      color,
      at: mix(p, q, 0.5),
      aim: q,
    });
  };

  // a cone whose base sits at `base` and whose tip points along `dir`
  const cone = (anchor: any, base: V, dir: V, h: number, rad: number, color: string, seg = 8) => {
    const d = unit(dir);
    const c = add(base, mul(d, h / 2));
    b.part({
      geo: new THREE.ConeGeometry(rad, h, seg, 1),
      color,
      at: anchor ? anchor.moved(c) : c,
      dir: d,
    });
  };

  // ---- skeleton --------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.08, -0.05] });
  const spine = b.joint("spine", { at: [0, 0.15, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.215, 0.04], parent: spine });
  const neck1 = b.joint("neck1", { at: [0, 0.255, 0.085], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 0.29, 0.12], parent: neck1 });
  const head = b.joint("head", { at: [0, 0.335, 0.135], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 0.283, 0.1], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.075, -0.14], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.065, -0.22], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0.045, 0.055, -0.28], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0.1, 0.05, -0.31], parent: tail3 });
  const tail5 = b.joint("tail5", { at: [0.14, 0.085, -0.31], parent: tail4 });

  const H = (p: V) => head.moved(p);
  const J = (p: V) => jaw.moved(p);

  // ---- body ------------------------------------------------------------
  ball([0, 0.13, 0], [0.086, 0.1, 0.112], TEAL, 18); // torso
  ball([0, 0.19, 0.05], [0.08, 0.068, 0.078], TEAL, 16); // chest
  ball([0, 0.08, -0.07], [0.09, 0.08, 0.078], TEAL, 16); // rump, sitting on the floor
  ball([0, 0.12, 0.05], [0.066, 0.078, 0.085], BUTTER, 16); // buttery belly
  ball([0, 0.068, 0.035], [0.06, 0.036, 0.07], BUTTER, 14); // underside

  // belly plates, sitting on the belly surface
  for (const y of [0.088, 0.11, 0.132]) {
    for (const x of [-0.03, 0, 0.03]) {
      const z =
        0.05 + 0.085 * Math.sqrt(Math.max(0, 1 - (x / 0.066) ** 2 - ((y - 0.12) / 0.078) ** 2));
      b.part({ geo: new THREE.BoxGeometry(0.026, 0.01, 0.012), color: BUTTER_D, at: [x, y, z] });
    }
  }

  // scale bumps on the flanks, teal dark and light
  for (const phi of [0.6, 0.95, 1.3]) {
    for (let k = 0; k < 10; k++) {
      const th = (k / 10) * Math.PI * 2;
      const p: V = [
        0.086 * Math.sin(phi) * Math.cos(th),
        0.13 + 0.1 * Math.cos(phi),
        0.112 * Math.sin(phi) * Math.sin(th),
      ];
      if (Math.abs(p[0]) < 0.035 || p[1] < 0.15 || p[2] > 0.07 || p[2] < -0.1) continue;
      ball(p, [0.011, 0.011, 0.011], (k + Math.round(phi * 10)) % 2 ? TEAL_D : TEAL_L, 6);
    }
  }

  // neck
  bone([0, 0.215, 0.04], [0, 0.255, 0.085], 0.05, TEAL);
  bone([0, 0.255, 0.085], [0, 0.29, 0.12], 0.046, TEAL);
  bone([0, 0.29, 0.12], [0, 0.335, 0.135], 0.042, TEAL);

  // tail: chubby, tapering toward the spade
  bone([0, 0.08, -0.06], [0, 0.075, -0.14], 0.058, TEAL);
  bone([0, 0.075, -0.14], [0, 0.065, -0.22], 0.05, TEAL);
  bone([0, 0.065, -0.22], [0.045, 0.055, -0.28], 0.042, TEAL);
  bone([0.045, 0.055, -0.28], [0.1, 0.05, -0.31], 0.035, TEAL);
  bone([0.1, 0.05, -0.31], [0.14, 0.085, -0.31], 0.029, TEAL);
  ball([0.14, 0.085, -0.31], [0.03, 0.03, 0.03], TEAL, 10);

  // little spade on the tail tip, standing in the YZ plane
  const spadeOutline: number[][] = [
    [0, 0.08], [0.022, 0.05], [0.05, 0.02], [0.052, -0.004], [0.03, -0.02],
    [0.008, -0.03], [0.008, -0.05], [-0.008, -0.05], [-0.008, -0.03],
    [-0.03, -0.02], [-0.052, -0.004], [-0.05, 0.02], [-0.022, 0.05],
  ].map(([u, v]) => [u * 0.85, v * 0.85]);
  b.extrude(spadeOutline, {
    at: tail5.moved([0.14, 0.1275, -0.31]),
    x: [0, 0, 1],
    y: [0, 1, 0],
    depth: 0.012,
    color: ORANGE,
  });

  // soft orange dorsal spines, neck to tail
  const dorsal: [V, number, number][] = [
    [[0, 0.302, 0.075], 0.026, 0.011],
    [[0, 0.292, 0.045], 0.03, 0.012],
    [[0, 0.248, 0.012], 0.036, 0.013],
    [[0, 0.226, -0.03], 0.042, 0.014],
    [[0, 0.204, -0.075], 0.04, 0.014],
    [[0, 0.155, -0.11], 0.036, 0.013],
    [[0, 0.122, -0.165], 0.034, 0.012],
    [[0, 0.112, -0.215], 0.03, 0.011],
    [[0.035, 0.1, -0.265], 0.026, 0.01],
  ];
  for (const [p, h, r] of dorsal) cone(null, p, [0, 1, -0.3], h, r, ORANGE, 8);

  // ---- limbs and wings -------------------------------------------------
  for (const s of [1, -1]) {
    // joints
    const hip = b.joint(sided("hip", s), { at: side(s, [0.07, 0.105, -0.03]), parent: hips });
    const knee = b.joint(sided("knee", s), { at: side(s, [0.11, 0.06, 0.085]), parent: hip });
    const ankle = b.joint(sided("ankle", s), { at: side(s, [0.08, 0.022, 0.125]), parent: knee });
    b.joint(sided("toes", s), { at: side(s, [0.08, 0.012, 0.17]), parent: ankle });

    const arm = b.joint(sided("arm", s), { at: side(s, [0.06, 0.2, 0.06]), parent: chest });
    const elbow = b.joint(sided("elbow", s), { at: side(s, [0.075, 0.112, 0.095]), parent: arm });
    const wrist = b.joint(sided("wrist", s), { at: side(s, [0.072, 0.03, 0.135]), parent: elbow });
    b.joint(sided("digit", s), { at: side(s, [0.072, 0.012, 0.17]), parent: wrist });

    const wing = b.joint(sided("wing", s), { at: side(s, WING.sh), parent: chest });
    const wElbow = b.joint(sided("wingElbow", s), { at: side(s, WING.el), parent: wing });
    const wWrist = b.joint(sided("wingWrist", s), { at: side(s, WING.wr), parent: wElbow });
    b.joint(sided("wingFinger1", s), { at: side(s, WING.f1), parent: wWrist });
    b.joint(sided("wingFinger2", s), { at: side(s, WING.f2), parent: wWrist });
    b.joint(sided("wingFinger3", s), { at: side(s, WING.f3), parent: wWrist });

    // hind leg: thigh folded under the body, shin and foot forward
    bone(side(s, [0.11, 0.06, 0.085]), side(s, [0.08, 0.022, 0.125]), 0.026, TEAL);
    ball(side(s, [0.09, 0.083, 0.028]), [0.05, 0.05, 0.07], TEAL, 14);
    ball(side(s, [0.08, 0.02, 0.16]), [0.034, 0.02, 0.045], BUTTER, 12);
    for (const dx of [-0.018, 0, 0.018]) {
      ball(side(s, [0.08 + dx, 0.014, 0.19]), [0.011, 0.011, 0.011], BUTTER, 8);
      cone(null, side(s, [0.08 + dx, 0.012, 0.2]), [0, -0.25, 1], 0.02, 0.006, CREAM, 6);
    }

    // front leg: planted in front of the chest
    bone(side(s, [0.06, 0.2, 0.06]), side(s, [0.075, 0.112, 0.095]), 0.024, TEAL);
    bone(side(s, [0.075, 0.112, 0.095]), side(s, [0.072, 0.03, 0.135]), 0.02, TEAL);
    ball(side(s, [0.072, 0.016, 0.152]), [0.027, 0.016, 0.03], BUTTER, 10);
    for (const dx of [-0.012, 0, 0.012]) {
      ball(side(s, [0.072 + dx, 0.013, 0.175]), [0.009, 0.009, 0.009], BUTTER, 8);
      cone(null, side(s, [0.072 + dx, 0.012, 0.18]), [0, -0.3, 1], 0.016, 0.005, CREAM, 6);
    }

    // wing bones, knuckle, claws
    const P = (k: string) => side(s, WING[k]);
    const sh = P("sh");
    const el = P("el");
    const wr = P("wr");
    const f1 = P("f1");
    const f2 = P("f2");
    const f3 = P("f3");
    const fl = P("fl");
    bone(sh, el, 0.016, TEAL_D);
    bone(el, wr, 0.013, TEAL_D);
    ball(wr, [0.02, 0.02, 0.02], TEAL_D, 10);
    for (const f of [f1, f2, f3]) {
      bone(wr, f, 0.008, TEAL_D);
      cone(null, f, sub(f, wr), 0.022, 0.0065, CREAM, 6);
    }

    // translucent amber skin between the fingers and down to the flank
    const edge = (p: V, q: V): V[] => [p, add(mix(p, q, 0.5), [0, -0.01, 0]), q];
    b.membrane(edge(el, wr), edge(wr, f1), { color: AMBER_SKIN });
    b.membrane(edge(wr, f1), edge(wr, f2), { color: AMBER_SKIN });
    b.membrane(edge(wr, f2), edge(wr, f3), { color: AMBER_SKIN });
    b.membrane(edge(wr, f3), edge(el, fl), { color: AMBER_SKIN });
  }

  // ---- head ------------------------------------------------------------
  ball(H([0, 0.335, 0.14]), [0.085, 0.072, 0.08], TEAL, 18); // skull
  ball(H([0, 0.33, 0.2]), [0.056, 0.044, 0.052], TEAL, 16); // snout
  ball(H([0, 0.287, 0.218]), [0.03, 0.005, 0.03], MOUTH, 8); // mouth line
  ball(J([0, 0.263, 0.185]), [0.04, 0.017, 0.066], BUTTER, 14); // lower jaw

  // toothy grin: teeth on both jaws
  for (const x of [-0.03, -0.015, 0, 0.015, 0.03]) {
    cone(head, [x, 0.297, 0.225], [0, -1, 0], 0.016, 0.0075, WHITE, 6);
    cone(jaw, [x, 0.272, 0.215], [0, 1, 0], 0.016, 0.0075, WHITE, 6);
  }

  for (const s of [1, -1]) {
    // big amber eyes with slit pupils and a highlight
    const eye = side(s, [0.062, 0.355, 0.195]);
    ball(H(eye), [0.034, 0.034, 0.034], AMBER, 14);
    ball(H(side(s, [0.087, 0.362, 0.218])), [0.009, 0.017, 0.006], PUPIL, 8);
    ball(H(side(s, [0.073, 0.375, 0.225])), [0.005, 0.005, 0.005], WHITE, 6);
    // heavy, proud brow
    ball(H(side(s, [0.062, 0.39, 0.2])), [0.038, 0.012, 0.026], TEAL_D, 10);
    // nostril and cheek blush
    ball(H(side(s, [0.02, 0.338, 0.248])), [0.007, 0.006, 0.006], NOSTRIL, 6);
    ball(H(side(s, [0.06, 0.315, 0.19])), [0.016, 0.011, 0.006], BLUSH, 10);
    // stubby horns
    cone(head, side(s, [0.036, 0.39, 0.11]), side(s, [0.27, 0.91, -0.45]), 0.05, 0.017, CREAM, 8);
  }

  // wisp of smoke from the +X nostril, curling up and back
  const puffs: [V, number][] = [
    [[0.026, 0.352, 0.268], 0.009],
    [[0.038, 0.372, 0.29], 0.012],
    [[0.052, 0.396, 0.302], 0.015],
    [[0.056, 0.422, 0.298], 0.018],
    [[0.046, 0.448, 0.283], 0.02],
    [[0.03, 0.472, 0.266], 0.021],
  ];
  for (const [p, r] of puffs) ball(H(p), [r, r * 0.9, r], SMOKE, 10);

  // ---- the broken egg (standing to the dragon's right, at -X) ----------
  const EC: V = [-0.235, 0, 0];
  const EGG_R = 0.082;
  const EGG_YC = 0.085;
  const EGG_RY = 0.115;
  const SHELL = 0.005;
  const RIM = 0.122;
  const eggR = (y: number) => EGG_R * Math.sqrt(Math.max(0, 1 - ((y - EGG_YC) / EGG_RY) ** 2));

  // lower shell: a hollow, open-topped profile
  const shellYs = [0, 0.02, 0.04, 0.065, 0.085, 0.105, RIM];
  const shellInYs = [0.005, 0.02, 0.04, 0.065, 0.085, 0.105, RIM].reverse();
  const shellProfile: number[][] = [
    [0, 0],
    ...shellYs.map((y) => [eggR(y), y]),
    ...shellInYs.map((y) => [Math.max(0, eggR(y) - SHELL), y]),
    [0, 0.005],
  ];
  b.lathe(shellProfile, { at: EC, axis: [0, 1, 0], color: EGG });

  // jagged broken rim
  const rimR = eggR(RIM) - 0.002;
  for (let i = 0; i < 6; i++) {
    const th = 0.4 + (i * Math.PI * 2) / 6 + (i % 2) * 0.25;
    const cx = Math.cos(th);
    const sz = Math.sin(th);
    const h = 0.026 + 0.012 * (i % 3);
    cone(null, [EC[0] + rimR * cx, RIM - 0.004, EC[2] + rimR * sz], [cx * 0.4, 1, sz * 0.4], h, 0.017, EGG, 3);
  }

  // speckles across the shell
  for (let k = 0; k < 64; k++) {
    const th = k * 2.39996;
    const y = 0.018 + ((k * 0.618034) % 1) * 0.094;
    const r = eggR(y);
    const sr = 0.0042 + (k % 3) * 0.0012;
    ball(
      [EC[0] + r * Math.cos(th), y, EC[2] + r * Math.sin(th)],
      [sr, sr * 0.8, sr],
      k % 4 === 0 ? SPECK_TEAL : SPECK_BROWN,
      6,
    );
  }

  // the cracked-off top half, lying on its side in front of the shell
  const capYs = [RIM, 0.14, 0.16, 0.18, 0.192];
  const capProfile: number[][] = [
    ...capYs.map((y) => [eggR(y), y - RIM]),
    [0, 0.2 - RIM],
    ...capYs
      .slice()
      .reverse()
      .map((y) => [Math.max(0, eggR(y) - SHELL), y - RIM]),
  ];
  b.lathe(capProfile, { at: [-0.165, eggR(RIM), 0.2], axis: [-1, 0, 0], color: EGG });

  return b.root;
}
```
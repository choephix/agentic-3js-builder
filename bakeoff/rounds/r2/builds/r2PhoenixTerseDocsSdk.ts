import * as THREE from "three";
import { createBuilder, paint, countershade, rng } from "../../../../src/index";
import { catmull, bezier, limb } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description:
    "A stylized fire-bird at rest: wings spread in layered flame-coloured feathers, a long fanning tail, a golden crest, and a separate upper and lower beak.",
};

const RED = "#c81d17";
const DEEP = "#7d0e12";
const ORANGE = "#ff7a1a";
const GOLD = "#ffc42e";
const PALE = "#fff0a0";
const LEG = "#e0951c";
const DARK = "#1b0d0a";
const D2R = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.78, -0.25] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.25],
      [0, 0.82, 0.0],
      [0, 0.92, 0.22],
    ]),
    { parent: hips, role: "spine" },
  );
  const spineEnd = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.92, 0.22],
      [0, 1.08, 0.37],
      [0, 1.28, 0.42],
    ]),
    { parent: spineEnd, role: "neck" },
  );
  const neckEnd = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", {
    parent: neckEnd,
    at: neck.at(1).at,
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.04 }),
    aim: head.local({ forward: 0.2, down: 0.045 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.25],
      [0, 0.76, -0.6],
      [0, 0.7, -1.0],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(spine, (t) => [0.14 + 0.07 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)), 0.17 + 0.07 * Math.sin(Math.PI * t * 0.9 + 0.3)], {
    color: countershade(RED, ORANGE, { level: -0.1 }),
    sides: 10,
  });
  b.sweep(neck, [0.085, 0.06], { color: RED, sides: 8 });
  b.sweep(tail, [0.1, 0.05], { color: DEEP, sides: 8 });

  // chest and flank feather scales
  const skin = b.surface(body);
  const hits = skin.scatter(70, { rng: rng(11), minDist: 0.075, filter: (h) => h.n.y > -0.45 });
  hits.forEach((h, i) => {
    b.stick(new THREE.SphereGeometry(0.05, 5, 3), i % 3 === 0 ? GOLD : i % 3 === 1 ? ORANGE : RED, h, {
      scale: [1, 0.3, 1.5],
      flow: [0, -0.2, -1],
      embed: 0.3,
    });
  });

  // golden collar
  const neckSweep = b.sweep(neck, [0.088, 0.062], { color: RED, sides: 8 });
  const collar = b.surface(neckSweep).loop(neck.joints[0], { lift: 0.012 });
  b.sweep(collar, 0.018, { color: GOLD, sides: 6 });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.105, 10, 8), RED, { bone: head, at: head.local({ forward: 0.04 }) });
  b.spike(head.local({ forward: 0.09, up: 0.0 }), head.local({ forward: 0.27, down: 0.05 }), null, 0.05, {
    bone: head,
    color: GOLD,
    sides: 6,
  });
  b.spike(head.local({ forward: 0.09, down: 0.045 }), head.local({ forward: 0.22, down: 0.06 }), null, 0.032, {
    bone: jaw,
    color: ORANGE,
    sides: 6,
  });
  for (const s of [1, -1]) {
    const lat = (x: number) => (x >= 0 ? { left: x } : { right: -x });
    const ep = head.local({ up: 0.035, forward: 0.06, ...lat(s * 0.085) });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), PALE, { bone: head, at: ep });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), DARK, {
      bone: head,
      at: head.local({ up: 0.035, forward: 0.075, ...lat(s * 0.099) }),
    });
    // cheek tuft
    b.spike(head.local({ down: 0.03, back: 0.0, ...lat(s * 0.09) }), head.local({ down: 0.06, back: 0.12, ...lat(s * 0.16) }), null, 0.03, {
      bone: head,
      color: GOLD,
      sides: 5,
    });
  }
  // crest plumes
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.05;
    const lat = x >= 0 ? { left: x } : { right: -x };
    const p0 = head.local({ up: 0.09, forward: 0.0 });
    const p1 = head.local({ up: 0.22 - Math.abs(k - 2) * 0.03, back: 0.02 });
    const p2 = head.local({ up: 0.2 - Math.abs(k - 2) * 0.04, back: 0.33 + (2 - Math.abs(k - 2)) * 0.1, ...lat });
    b.sweep(bezier(p0, p1, p2), [0.028, 0], {
      bone: head,
      color: (t: number) => (t < 0.4 ? RED : t < 0.75 ? ORANGE : GOLD),
      sides: 5,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---------- wings ----------
  const feather = (
    p: THREE.Vector3,
    bone: any,
    s: number,
    aDeg: number,
    len: number,
    wid: number,
    lift: number,
    droop = -0.03,
  ) => {
    const a = aDeg * D2R;
    const x: [number, number, number] = [s * Math.cos(a), droop, -Math.sin(a)];
    const y: [number, number, number] = [s * Math.sin(a), 0, Math.cos(a)];
    const o: any[] = [
      [0, -0.03 * wid],
      [0.12 * len, 0.045 * wid],
      [0.5 * len, 0.065 * wid],
      [len, 0, "sharp"],
      [0.5 * len, -0.055 * wid],
      [0.12 * len, -0.045 * wid],
    ];
    const col = paint((_p, _n, sc) => (sc[0] > len * 0.78 ? GOLD : sc[0] > len * 0.5 ? ORANGE : RED));
    b.extrude(o, {
      at: [p.x, p.y + lift, p.z],
      x,
      y,
      thickness: 0.012,
      smoothing: 1,
      color: col,
      bone,
    });
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${sd}`,
      catmull([
        [s * 0.2, 0.98, 0.15],
        [s * 0.6, 1.05, 0.0],
        [s * 1.0, 1.0, -0.1],
      ]),
      { parent: spineEnd, names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`], role: "wing" },
    );
    b.sweep(arm, [0.06, 0.03], { color: RED, sides: 8 });
    const wrist = arm.at(1).at.clone();
    // primaries
    for (let i = 0; i < 9; i++) {
      feather(wrist, arm.nearestJoint(wrist), s, -8 + i * 7.5, 1.0 - i * 0.045, 1.15, i * 0.002);
    }
    // secondaries
    for (let i = 0; i < 7; i++) {
      const t = 0.9 - i * 0.12;
      const p = arm.at(t).at.clone();
      feather(p, arm.nearestJoint(p), s, 72 + i * 4, 0.58 - i * 0.02, 1.2, 0.012 + i * 0.001);
    }
    // coverts
    for (let i = 0; i < 8; i++) {
      const t = 0.95 - i * 0.11;
      const p = arm.at(t).at.clone();
      feather(p, arm.nearestJoint(p), s, 62 + i * 3, 0.3, 1.1, 0.03, -0.02);
    }
    for (let i = 0; i < 6; i++) {
      const t = 0.9 - i * 0.14;
      const p = arm.at(t).at.clone();
      feather(p, arm.nearestJoint(p), s, 58, 0.17, 0.9, 0.045, -0.02);
    }
    // wing claw
    b.spike([s * 1.0, 1.0, -0.1], [s * 1.08, 1.0, 0.0], null, 0.022, { bone: arm.joints[arm.joints.length - 1], color: GOLD, sides: 5 });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.13, 0.7, 0.0],
      [s * 0.15, 0.03, 0.1],
      [0.26, 0.3, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
    });
    b.sweep(leg, [0.055, 0.026], { color: LEG, sides: 6 });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), RED, { bone: leg.joints[0], at: [s * 0.14, 0.7, 0.0], scale: [1, 1.5, 1.1] });
    const foot = leg.joints[leg.joints.length - 1];
    const f = pts[pts.length - 1];
    const toes: [number, number][] = [
      [-0.07, 0.2],
      [0.0, 0.24],
      [0.07, 0.2],
      [0.0, -0.14],
    ];
    for (const [dx, dz] of toes) {
      b.spike([f.x, 0.022, f.z], [f.x + dx, 0.012, f.z + dz], null, 0.022, { bone: foot, color: LEG, sides: 5 });
    }
  }

  // ---------- tail feathers ----------
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i);
    const base: [number, number, number] = [i * 0.02, 0.82, -0.32];
    const ctrl: [number, number, number] = [i * 0.12, 0.88, -0.95];
    const tip: [number, number, number] = [i * 0.3, 0.14 + a * 0.07, -1.8 - (3 - a) * 0.3];
    b.sweep(bezier(base, ctrl, tip), (t) => [0.02 + 0.075 * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (1 - 0.25 * t), 0.008], {
      bone: tail,
      color: (t) => (t < 0.35 ? DEEP : t < 0.6 ? RED : t < 0.82 ? ORANGE : GOLD),
      section: "box",
      caps: { start: "flat", end: "point" },
    });
  }

  return b.root;
}

import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { glow } from "../../../../kits/glow";
import type { Fill } from "../../../../src/context";
import { arc, catmull } from "../../../../src/path";
import { grain, mix, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { along } from "../../../../src/distribute";
import type { Joint } from "../../../../src/skeleton";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Custom long-fork chopper: orange teardrop tank with white racing stripe and emblem, gunmetal hardtail frame, V-twin with finned barrels, drag pipes, ape-hanger bars, fat rear tyre, glowing headlamp and gauge. Wheels, steering, levers, throttle, pegs and kickstand are hinge joints.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const ORANGE = "#ff7a1a";
const ORANGE_DK = "#c8500a";
const ORANGE_HI = "#ffb070";
const WHITE = "#f2f5f7";
const GUN = "#3a4350";
const GUN_LT = "#566272";
const DARK = "#20252d";
const BLACK = "#15181d";
const CHROME = "#cdd6de";
const CHROME_DK = "#8391a0";
const LEATHER = "#2b2722";
const STITCH = "#6a5f50";
const RED = "#e8332a";
const LAMP = "#fff1c2";
const TREAD_A = "#1b1e24";
const TREAD_B = "#2a2e36";

const unit = (v: number[]) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const addScaled = (p: number[], d: number[], t: number) => [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
const lit = (base: string, hi: string, n: THREE.Vector3) => mix(base, hi, 0.55 * smoothstep(0.45, 1, n.y));

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // ---------------------------------------------------------------- skeleton
  const T = [0, 1.0, 0.5]; // steering head
  const A = [0, 0.33, 1.2]; // front axle
  const R = [0, 0.35, -0.95]; // rear axle
  const D = unit([A[0] - T[0], A[1] - T[1], A[2] - T[2]]);
  const FORK_LEN = Math.hypot(A[1] - T[1], A[2] - T[2]);

  const core = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: core, at: T, aim: A, role: "hinge" });
  const frontWheel = b.joint("frontWheel", { parent: steer, at: A, role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: core, at: R, role: "hinge" });
  const kickstand = b.joint("kickstand", { parent: core, at: [0.19, 0.3, -0.4], aim: [0.25, 0.14, -0.74], role: "hinge" });
  const clutchLever = b.joint("clutchLever", { parent: steer, at: [0.5, 1.215, 0.28], aim: [0.58, 1.17, 0.15], role: "hinge" });
  const brakeLever = b.joint("brakeLever", { parent: steer, at: [-0.5, 1.215, 0.28], aim: [-0.58, 1.17, 0.15], role: "hinge" });
  const throttle = b.joint("throttle", { parent: steer, at: [-0.53, 1.2, 0.2], aim: [-0.55, 1.18, 0.1], role: "hinge" });
  const pegL = b.joint("pegL", { parent: core, at: [0.13, 0.34, 0.38], aim: [0.3, 0.34, 0.38], role: "hinge" });
  const pegR = b.joint("pegR", { parent: core, at: [-0.13, 0.34, 0.38], aim: [-0.3, 0.34, 0.38], role: "hinge" });

  const part = (g: THREE.BufferGeometry, color: Fill, bone: Joint, at: number[], o: Parameters<typeof b.part>[2] = {}) =>
    b.part(g, color, { bone, at, ...o });
  const rod = (a: number[], c: number[], r: number | [number, number], color: Fill, bone: Joint) =>
    b.rod(a, c, r, color, { bone });
  const cap = (a: number[], c: number[], r: number | [number, number], color: Fill, bone: Joint) =>
    b.capsule(a, c, r, color, { bone });
  const cylX = (r: number, len: number, seg = 12) => new THREE.CylinderGeometry(r, r, len, seg);
  const bolt = (bone: Joint, at: number[], dir: number[], r = 0.01, color: Fill = CHROME) =>
    part(new THREE.CylinderGeometry(r, r, r * 1.2, 6), color, bone, at, { dir });

  // ---------------------------------------------------------------- wheels
  const tirePaint = (cy: number, cz: number, r0: number) =>
    paint((p, n) => {
      const dy = p.y - cy;
      const dz = p.z - cz;
      if (Math.abs(n.x) > 0.55) {
        const r = Math.hypot(dy, dz);
        return Math.abs(r - (r0 - 0.018)) < 0.006 ? WHITE : BLACK;
      }
      if (Math.abs(p.x) < 0.008) return DARK;
      const blk = Math.floor(Math.atan2(dy, dz) / (Math.PI / 18));
      return blk & 1 ? TREAD_A : TREAD_B;
    });

  const wheel = (j: Joint, cy: number, cz: number, ring: number, tube: number, wide: number) => {
    const c = [0, cy, cz];
    part(new THREE.TorusGeometry(ring, tube, 8, 30), tirePaint(cy, cz, ring), j, c, {
      rotation: [0, 90, 0],
      scale: [1, 1, wide],
    });
    const rimR = ring - tube - 0.01;
    part(new THREE.TorusGeometry(rimR, 0.035, 6, 26), ORANGE, j, c, { rotation: [0, 90, 0], scale: [1, 1, wide * 0.9] });
    for (const s of [1, -1]) {
      part(new THREE.TorusGeometry(rimR - 0.03, 0.008, 5, 26), CHROME, j, [s * 0.045 * wide, cy, cz], {
        rotation: [0, 90, 0],
      });
      for (let i = 0; i < 5; i++)
        part(new THREE.BoxGeometry(0.02, 2 * (rimR - 0.02), 0.026), GUN_LT, j, [s * 0.03, cy, cz], {
          rotation: [i * 36 + (s > 0 ? 18 : 0), 0, 0],
        });
    }
    part(cylX(0.06, 0.15, 12), CHROME, j, c, { dir: [1, 0, 0] });
    part(cylX(0.034, 0.2, 10), ORANGE_DK, j, c, { dir: [1, 0, 0] });
    for (const s of [1, -1]) part(cylX(0.03, 0.03, 8), CHROME, j, [s * 0.11, cy, cz], { dir: [1, 0, 0] });
  };
  wheel(frontWheel, A[1], A[2], 0.27, 0.06, 1.0);
  wheel(rearWheel, R[1], R[2], 0.26, 0.09, 1.5);

  // brake discs
  part(cylX(0.15, 0.008, 24), CHROME_DK, frontWheel, [0.055, A[1], A[2]], { dir: [1, 0, 0] });
  part(cylX(0.06, 0.012, 12), GUN, frontWheel, [0.055, A[1], A[2]], { dir: [1, 0, 0] });
  part(cylX(0.12, 0.008, 24), CHROME_DK, rearWheel, [-0.07, R[1], R[2]], { dir: [1, 0, 0] });
  part(new THREE.BoxGeometry(0.03, 0.07, 0.05), ORANGE, steer, [0.08, 0.36, 1.07]);
  part(new THREE.BoxGeometry(0.03, 0.06, 0.05), ORANGE, rearWheel, [-0.08, R[1] + 0.1, R[2] + 0.02]);
  // rear pulley and axle
  part(cylX(0.11, 0.03, 18), CHROME_DK, rearWheel, [0.16, R[1], R[2]], { dir: [1, 0, 0] });
  part(cylX(0.075, 0.034, 12), GUN, rearWheel, [0.16, R[1], R[2]], { dir: [1, 0, 0] });
  part(cylX(0.022, 0.46, 8), CHROME, rearWheel, R, { dir: [1, 0, 0] });

  // ---------------------------------------------------------------- frame
  const FR = GUN;
  b.sweep(catmull([T, [0, 0.9, 0.1], [0, 0.78, -0.4]]), 0.032, { color: FR, bone: core });
  b.sweep(catmull([[0, 0.88, 0.6], [0, 0.62, 0.34], [0, 0.4, 0.16]]), 0.034, { color: FR, bone: core });
  rod(addScaled(T, D, -0.04), addScaled(T, D, 0.19), 0.042, GUN_LT, core);
  part(cylX(0.05, 0.02, 12), CHROME, core, addScaled(T, D, 0.2), { dir: D });
  for (const s of [1, -1]) {
    b.sweep(catmull([[0, 0.78, -0.4], [s * 0.1, 0.68, -0.55], [s * 0.19, 0.5, -0.78], [s * 0.19, 0.36, -0.95]]), 0.022, {
      color: FR,
      bone: core,
    });
    cap([s * 0.09, 0.34, -0.3], [s * 0.19, 0.35, -0.93], 0.02, FR, core);
    part(new THREE.BoxGeometry(0.022, 0.13, 0.2), DARK, core, [s * 0.19, 0.35, -0.95]);
    bolt(core, [s * 0.2, 0.39, -0.9], [s, 0, 0]);
    bolt(core, [s * 0.2, 0.31, -0.9], [s, 0, 0]);
    // seat bracket and tank mounts
    rod([s * 0.06, 0.74, -0.3], [0, 0.82, -0.3], 0.012, GUN_LT, core);
    // fork
    const top = [s * 0.095, T[1], T[2]];
    const mid = addScaled(top, D, FORK_LEN * 0.5);
    const bot = [s * 0.095, A[1], A[2]];
    rod(top, mid, 0.02, CHROME, steer);
    rod(addScaled(top, D, FORK_LEN * 0.12), addScaled(top, D, FORK_LEN * 0.3), 0.034, BLACK, steer);
    rod(addScaled(top, D, FORK_LEN * 0.46), bot, 0.03, GUN, steer);
    rod(addScaled(top, D, FORK_LEN * 0.62), addScaled(top, D, FORK_LEN * 0.72), 0.034, ORANGE, steer);
    part(cylX(0.036, 0.03, 8), CHROME, steer, bot, { dir: [1, 0, 0] });
    part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), CHROME, steer, addScaled(top, D, -0.025), { dir: D });
    // headlamp bracket
    rod([s * 0.1, 0.9, 0.66], [s * 0.1, 0.92, 0.75], 0.012, CHROME, steer);
    // risers and bars
    rod([s * 0.1, 1.02, 0.5], [s * 0.11, 1.1, 0.47], 0.02, CHROME, steer);
  }
  part(new THREE.BoxGeometry(0.27, 0.04, 0.07), GUN_LT, steer, addScaled(T, D, 0.015));
  part(new THREE.BoxGeometry(0.25, 0.04, 0.07), GUN_LT, steer, addScaled(T, D, 0.2));
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), CHROME, steer, [0, 1.04, 0.49]);

  // handlebars (ape hangers with pull-back)
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.11, 1.1, 0.47], [s * 0.24, 1.22, 0.44], [s * 0.46, 1.24, 0.34], [s * 0.52, 1.21, 0.26]]), 0.014, {
      color: CHROME,
      bone: steer,
    });
    const gripBone = s > 0 ? steer : throttle;
    rod([s * 0.52, 1.21, 0.26], [s * 0.555, 1.18, 0.09], 0.025, BLACK, gripBone);
    for (let i = 0; i < 3; i++) {
      const f = 0.2 + i * 0.25;
      part(new THREE.TorusGeometry(0.025, 0.004, 4, 8), DARK, gripBone, [s * (0.52 + 0.035 * f), 1.21 - 0.03 * f, 0.26 - 0.17 * f], {
        dir: [s * 0.035, -0.03, -0.17],
        axis: "z",
      });
    }
    part(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 8), CHROME, gripBone, [s * 0.558, 1.178, 0.085], {
      dir: [s * 0.035, -0.03, -0.17],
    });
    // switch pods
    part(new THREE.BoxGeometry(0.05, 0.035, 0.07), DARK, steer, [s * 0.42, 1.245, 0.355]);
    part(new THREE.SphereGeometry(0.01, 5, 4), ORANGE, steer, [s * 0.42, 1.265, 0.34]);
  }
  // levers
  for (const [lv, s] of [
    [clutchLever, 1],
    [brakeLever, -1],
  ] as const) {
    cap([s * 0.5, 1.215, 0.28], [s * 0.58, 1.17, 0.15], [0.012, 0.008], CHROME, lv);
    part(new THREE.SphereGeometry(0.014, 6, 4), ORANGE, lv, [s * 0.585, 1.165, 0.14]);
    part(new THREE.BoxGeometry(0.03, 0.03, 0.05), GUN_LT, steer, [s * 0.5, 1.22, 0.3]);
  }

  // gauge
  const GAUGE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#10141a"/><path d="M12 47 A23 23 0 1 1 52 47" stroke="#ff7a1a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 32 L40 18" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#ff7a1a"/><path d="M20 52 h24" stroke="#ff7a1a" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const gDir = unit([0, 0.5, -0.85]);
  const gP = [0, 1.11, 0.43];
  part(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 14), CHROME, steer, gP, { dir: gDir });
  glow(
    part(new THREE.CircleGeometry(0.043, 14), "#ffffff", steer, addScaled(gP, gDir, 0.017), {
      dir: gDir,
      axis: "z",
      texture: GAUGE,
    }),
    1,
  );
  rod([0, 1.05, 0.46], [0, 1.1, 0.43], 0.012, GUN_LT, steer);

  // ---------------------------------------------------------------- headlamp
  const bucket = b.lathe(
    [
      [0, -0.09],
      [0.06, -0.08],
      [0.1, -0.03],
      [0.1, 0.04],
      [0.088, 0.072],
      [0, 0.078],
    ],
    { at: [0, 0.92, 0.76], axis: [0, 0, 1], color: CHROME, bone: steer, smoothing: 1, segments: 16 },
  );
  void bucket;
  part(new THREE.TorusGeometry(0.092, 0.012, 6, 18), GUN, steer, [0, 0.92, 0.84]);
  glow(part(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 16), LAMP, steer, [0, 0.92, 0.835], { dir: [0, 0, 1] }), 1.4);
  part(new THREE.SphereGeometry(0.03, 6, 4), WHITE, steer, [0, 0.92, 0.83], { scale: [1, 1, 0.4] });
  part(new THREE.BoxGeometry(0.1, 0.02, 0.03), ORANGE, steer, [0, 1.0, 0.78]);

  // fenders
  const fenderPaint = (base: string) =>
    paint((p, n) => {
      if (Math.abs(p.x) < 0.014) return WHITE;
      if (Math.abs(p.x) < 0.024) return DARK;
      return lit(base, ORANGE_HI, n);
    });
  const FF = 0.39;
  const ff = (deg: number) => [0, A[1] + FF * Math.cos((deg * Math.PI) / 180), A[2] + FF * Math.sin((deg * Math.PI) / 180)];
  b.sweep(arc(A, ff(80), [1, 0, 0], -125), () => [0.08, 0.012], {
    section: "box",
    caps: "flat",
    color: fenderPaint(ORANGE),
    bone: steer,
  });
  for (const s of [1, -1]) {
    b.sweep(arc([s * 0.08, A[1], A[2]], [s * 0.08, ff(80)[1], ff(80)[2]], [1, 0, 0], -125), 0.007, {
      color: CHROME,
      bone: steer,
    });
    rod([s * 0.08, ff(30)[1], ff(30)[2]], [s * 0.095, ff(30)[1] - 0.04, ff(30)[2] - 0.03], 0.01, CHROME, steer);
  }
  const RF = 0.42;
  const rf = (deg: number) => [0, R[1] + RF * Math.cos((deg * Math.PI) / 180), R[2] + RF * Math.sin((deg * Math.PI) / 180)];
  b.sweep(arc(R, rf(40), [1, 0, 0], -110), () => [0.15, 0.012], {
    section: "box",
    caps: "flat",
    color: fenderPaint(ORANGE),
    bone: core,
  });
  for (const s of [1, -1]) {
    b.sweep(arc([s * 0.15, R[1], R[2]], [s * 0.15, rf(40)[1], rf(40)[2]], [1, 0, 0], -110), 0.008, { color: CHROME, bone: core });
    rod([s * 0.15, rf(30)[1], rf(30)[2]], [s * 0.19, 0.5, -0.78], 0.01, CHROME, core);
  }

  // ---------------------------------------------------------------- tank
  const tankPaint = paint((p, n) => {
    if (n.y < -0.4) return GUN;
    if ((p.z > 0.17 && p.z < 0.2) || (p.z > -0.06 && p.z < -0.03)) return CHROME_DK;
    const ax = Math.abs(p.x);
    if (n.y > 0.2 && ax < 0.03) return WHITE;
    if (n.y > 0.2 && ax < 0.042) return DARK;
    if (p.y < 0.9 + 0.02 && n.y < 0.2 && Math.abs(p.y - 0.935) < 0.006) return ORANGE_DK;
    return lit(ORANGE, ORANGE_HI, n);
  });
  const tank = b.loft(
    [
      { at: [0, 0.96, 0.44], w: 0.1, h: 0.08 },
      { at: [0, 1.0, 0.3], w: 0.24, h: 0.2 },
      { at: [0, 1.01, 0.1], w: 0.3, h: 0.23 },
      { at: [0, 0.99, -0.1], w: 0.27, h: 0.2 },
      { at: [0, 0.95, -0.22], w: 0.14, h: 0.12 },
    ],
    { color: tankPaint, bone: core },
  );
  part(new THREE.CylinderGeometry(0.04, 0.045, 0.02, 12), CHROME, core, [0, 1.12, 0.22]);
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 8), ORANGE_DK, core, [0, 1.135, 0.22]);
  const EMBLEM = svg(
    `<svg viewBox="0 0 120 80"><polygon points="8,40 44,8 40,30 78,30 60,8 112,40 60,72 78,50 40,50 44,72" fill="#f2f5f7" stroke="#15181d" stroke-width="5" stroke-linejoin="round"/><circle cx="60" cy="40" r="6" fill="#ff7a1a" stroke="#15181d" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(tank, EMBLEM, {
      at: [s * 0.15, 1.0, 0.12],
      dir: [s, 0, 0],
      size: [0.2, 0.13],
      mirror: s > 0,
      name: `emblem${s > 0 ? "L" : "R"}`,
    });

  // ---------------------------------------------------------------- seat, sissy bar, tail
  const seatPaint = paint((p, n, s) => {
    if (Math.abs(s[1] - 90) < 9 || Math.abs(s[1] - 270) < 9) return ORANGE;
    if (n.y > 0.5 && Math.abs(((p.z + 1) / 0.06) % 1 - 0.5) < 0.04) return STITCH;
    return LEATHER;
  });
  b.loft(
    [
      { at: [0, 0.78, -0.18], w: 0.2, h: 0.07 },
      { at: [0, 0.77, -0.38], w: 0.32, h: 0.09 },
      { at: [0, 0.765, -0.56], w: 0.3, h: 0.08 },
      { at: [0, 0.76, -0.7], w: 0.18, h: 0.06 },
    ],
    { color: seatPaint, bone: core },
  );
  for (const s of [1, -1]) rod([s * 0.1, 0.78, -0.45], [s * 0.1, 0.72, -0.45], 0.012, GUN_LT, core);
  b.sweep(
    catmull([
      [0.15, 0.55, -0.9],
      [0.15, 1.0, -0.86],
      [0.1, 1.18, -0.8],
      [-0.1, 1.18, -0.8],
      [-0.15, 1.0, -0.86],
      [-0.15, 0.55, -0.9],
    ]),
    0.015,
    { color: CHROME, bone: core },
  );
  part(new THREE.BoxGeometry(0.2, 0.1, 0.035), LEATHER, core, [0, 1.0, -0.88], { rotation: [-8, 0, 0] });
  part(new THREE.BoxGeometry(0.205, 0.012, 0.04), ORANGE, core, [0, 1.056, -0.884], { rotation: [-8, 0, 0] });
  glow(part(new THREE.SphereGeometry(0.03, 6, 4), RED, core, [0, 0.52, -1.37], { scale: [1.3, 1, 1] }), 1.3);
  part(new THREE.BoxGeometry(0.1, 0.03, 0.04), GUN, core, [0, 0.52, -1.35]);
  const PLATE = svg(
    `<svg viewBox="0 0 100 50"><rect x="1" y="1" width="98" height="48" rx="5" fill="#f2f5f7" stroke="#15181d" stroke-width="3"/><rect x="4" y="4" width="92" height="9" fill="#ff7a1a"/><text x="50" y="40" font-size="24" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#15181d">CH0P-77</text></svg>`,
    { size: 192 },
  );
  part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", core, [0, 0.4, -1.345], { dir: [0, 0, -1], axis: "z", texture: PLATE });
  part(new THREE.BoxGeometry(0.205, 0.105, 0.01), DARK, core, [0, 0.4, -1.337]);
  rod([0, 0.5, -1.33], [0, 0.44, -1.337], 0.01, GUN_LT, core);

  // ---------------------------------------------------------------- engine
  const crank = [0, 0.42, -0.05];
  const caseP = grain(GUN, GUN_LT, { size: 0.012, axis: "z" });
  part(new THREE.BoxGeometry(0.2, 0.2, 0.34), caseP, core, crank);
  part(new THREE.BoxGeometry(0.18, 0.22, 0.24), caseP, core, [0, 0.4, -0.3]);
  part(new THREE.BoxGeometry(0.16, 0.05, 0.3), DARK, core, [0, 0.3, -0.12]);
  for (const s of [1, -1]) {
    bolt(core, [s * 0.101, 0.46, 0.06], [s, 0, 0]);
    bolt(core, [s * 0.101, 0.35, -0.16], [s, 0, 0]);
    bolt(core, [s * 0.092, 0.34, -0.38], [s, 0, 0]);
  }
  // primary cover (left) and air cleaner (right)
  part(cylX(0.15, 0.05, 18), CHROME, core, [0.125, 0.4, -0.08], { dir: [1, 0, 0] });
  part(cylX(0.12, 0.03, 18), GUN_LT, core, [0.15, 0.4, -0.08], { dir: [1, 0, 0] });
  part(cylX(0.04, 0.04, 10), ORANGE, core, [0.165, 0.4, -0.08], { dir: [1, 0, 0] });
  glow(part(new THREE.TorusGeometry(0.135, 0.007, 5, 22), ORANGE, core, [0.152, 0.4, -0.08], { rotation: [0, 90, 0] }), 1.2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    bolt(core, [0.153, 0.4 + 0.105 * Math.cos(a), -0.08 + 0.105 * Math.sin(a)], [1, 0, 0], 0.008, CHROME_DK);
  }
  part(cylX(0.1, 0.05, 16), CHROME, core, [-0.13, 0.66, -0.06], { dir: [1, 0, 0] });
  part(cylX(0.08, 0.02, 16), DARK, core, [-0.16, 0.66, -0.06], { dir: [1, 0, 0] });
  part(cylX(0.03, 0.03, 8), ORANGE, core, [-0.175, 0.66, -0.06], { dir: [1, 0, 0] });

  const barrel = (dir: number[]) => {
    const base = addScaled(crank, dir, 0.05);
    part(new THREE.CylinderGeometry(0.065, 0.065, 0.25, 10), GUN, core, addScaled(base, dir, 0.125), { dir });
    for (let i = 0; i < 6; i++)
      part(new THREE.CylinderGeometry(0.095, 0.095, 0.012, 10), i % 2 ? GUN_LT : CHROME_DK, core, addScaled(base, dir, 0.04 + i * 0.038), {
        dir,
      });
    part(new THREE.CylinderGeometry(0.088, 0.085, 0.1, 10), DARK, core, addScaled(base, dir, 0.3), { dir });
    part(new THREE.BoxGeometry(0.2, 0.06, 0.13), ORANGE, core, addScaled(base, dir, 0.365), { dir });
    for (const s of [1, -1]) {
      for (const k of [-1, 1]) {
        const side = addScaled(addScaled(base, dir, 0.365), [0, dir[2], -dir[1]], k * 0.045);
        bolt(core, [side[0] + s * 0.07, side[1], side[2]], dir, 0.008);
      }
      rod(
        [s * 0.075, addScaled(base, dir, 0.06)[1], addScaled(base, dir, 0.06)[2]],
        [s * 0.075, addScaled(base, dir, 0.3)[1], addScaled(base, dir, 0.3)[2]],
        0.011,
        CHROME,
        core,
      );
    }
  };
  barrel([0, 0.8, 0.6]);
  barrel([0, 0.8, -0.6]);

  // drag pipes
  const pipeR = (t: number) => 0.026 + 0.03 * t * t;
  for (const [s, hz] of [
    [1, 0.19],
    [-1, -0.29],
  ] as const) {
    const pts = [
      [s * 0.09, 0.7, hz],
      [s * 0.17, 0.62, hz],
      [s * 0.25, 0.48, hz - 0.04],
      [s * 0.3, 0.34, hz - 0.12],
      [s * 0.31, 0.3, hz - 0.45],
      [s * 0.3, 0.3, -1.0],
      [s * 0.3, 0.32, -1.38],
    ];
    const path = catmull(pts);
    b.sweep(path, pipeR, { color: (t) => (t > 0.42 && t < 0.88 ? DARK : CHROME), bone: core, sides: 10, caps: "flat" });
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), CHROME_DK, core, [s * 0.09, 0.7, hz], { dir: [s, 0.3, 0] });
    part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 10), BLACK, core, [s * 0.3, 0.32, -1.385], { dir: [0, 0, 1] });
    along(path, 4, (at) =>
      part(new THREE.TorusGeometry(pipeR(at.t) + 0.004, 0.006, 4, 10), CHROME, core, at.at, { dir: at, axis: "z" }),
    );
    // pipe hangers
    rod([s * 0.3, 0.3, -0.7], [s * 0.19, 0.38, -0.78], 0.008, GUN_LT, core);
  }

  // belt drive
  for (const [y0, y1] of [
    [0.41, 0.46],
    [0.31, 0.24],
  ])
    rod([0.16, y0, -0.42], [0.16, y1, -0.95], 0.01, BLACK, core);
  part(cylX(0.05, 0.03, 12), CHROME_DK, core, [0.16, 0.36, -0.42], { dir: [1, 0, 0] });

  // oil tank + battery box
  part(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), GUN, core, [-0.13, 0.52, -0.5], { dir: [0, 0.2, 1] });
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), ORANGE, core, [-0.13, 0.57, -0.4]);
  part(new THREE.BoxGeometry(0.1, 0.12, 0.16), DARK, core, [0.12, 0.55, -0.5]);

  // foot pegs
  for (const [pj, s] of [
    [pegL, 1],
    [pegR, -1],
  ] as const) {
    part(new THREE.BoxGeometry(0.05, 0.05, 0.05), GUN_LT, core, [s * 0.1, 0.34, 0.38]);
    cap([s * 0.12, 0.34, 0.38], [s * 0.3, 0.34, 0.38], 0.014, CHROME, pj);
    part(cylX(0.026, 0.1, 8), BLACK, pj, [s * 0.26, 0.34, 0.38], { dir: [1, 0, 0] });
    for (let i = 0; i < 3; i++) part(cylX(0.029, 0.008, 8), DARK, pj, [s * (0.225 + i * 0.035), 0.34, 0.38], { dir: [1, 0, 0] });
  }
  // brake pedal
  rod([-0.12, 0.3, -0.02], [-0.24, 0.26, 0.1], 0.012, CHROME, core);
  part(new THREE.BoxGeometry(0.05, 0.015, 0.04), BLACK, core, [-0.25, 0.26, 0.11]);

  // kickstand
  rod([0.19, 0.3, -0.4], [0.25, 0.14, -0.74], 0.014, GUN_LT, kickstand);
  part(new THREE.BoxGeometry(0.06, 0.02, 0.05), BLACK, kickstand, [0.25, 0.135, -0.75]);
  part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), CHROME_DK, kickstand, [0.19, 0.3, -0.4], { dir: [1, 0, 0] });

  return b.root;
}

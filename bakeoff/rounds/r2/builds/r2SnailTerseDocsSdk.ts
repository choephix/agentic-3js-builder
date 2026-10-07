import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Garden Snail",
  description:
    "A rigged garden snail: banded spiral shell, mottled body with a bendable neck and tail, two eye stalks, two lower tentacles and a separate upper lip and lower jaw.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  const EYE = "#141414";
  const LIP_UP = "#b98b73";
  const LIP_LO = "#a87763";
  const STALK = "#8f7650";
  const LIP_RING = "#e8d8b0";
  const APERTURE = "#a8745c";

  const skin = countershade(mottle("#b8996a", "#957650", { size: 0.012, seed: 3 }), "#d9c7a0", { level: -0.15 });

  // ---------- skeleton ----------
  const bodyPts: number[][] = [
    [0, 0.0035, -0.08],
    [0, 0.0075, -0.045],
    [0, 0.0095, -0.01],
    [0, 0.0095, 0.03],
    [0, 0.02, 0.062],
    [0, 0.034, 0.082],
  ];
  const body = catmull(bodyPts);
  const core = b.joint("core", { at: bodyPts[2], dir: [0, 0, 1], role: "spine" });
  const rootT = body.closestT(core.at);
  const neck = b.chain("neck", body.slice(rootT, 1), { parent: core, count: 3, role: "neck" });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 2, role: "tail" });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: body.at(1),
    dir: body.tangentAt(1),
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.028, 0.084],
    aim: [0, 0.024, 0.095],
    role: "jaw",
  });

  // ---------- body ----------
  const keys: number[][] = [
    [0, 0.003],
    [0.2, 0.009],
    [0.45, 0.0118],
    [0.7, 0.0115],
    [0.88, 0.009],
    [1, 0.0072],
  ];
  const radius = (t: number): [number, number] => {
    let r = keys[keys.length - 1][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, r0] = keys[i];
      const [t1, r1] = keys[i + 1];
      if (t >= t0 && t <= t1) {
        r = r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
        break;
      }
    }
    return [r, r * 0.8];
  };
  b.sweep(body, radius, { bone: [tail, core, neck], color: skin, sides: 10 });

  // ---------- mouth ----------
  b.part(new THREE.SphereGeometry(0.004, 6, 4), LIP_UP, {
    at: [0, 0.0315, 0.0885],
    bone: head,
    scale: [1.5, 0.6, 1],
  });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), LIP_LO, {
    at: [0, 0.0255, 0.0865],
    bone: jaw,
    scale: [1.3, 0.6, 1],
  });

  // ---------- tentacles ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // upper eye stalks
    const stalk = b.chain(
      `eyeStalk${side}`,
      catmull([
        [s * 0.0035, 0.037, 0.082],
        [s * 0.006, 0.05, 0.087],
        [s * 0.011, 0.066, 0.094],
      ]),
      { parent: head, names: [`eyeStalk${side}1`, `eyeStalk${side}2`], role: "tentacle" },
    );
    b.sweep(stalk, [0.0026, 0.0016], { color: STALK, sides: 6 });
    const tipJ = stalk.joints[1];
    const eyeAt: [number, number, number] = [s * 0.0115, 0.0685, 0.0955];
    b.part(new THREE.SphereGeometry(0.0033, 6, 5), EYE, { at: eyeAt, bone: tipJ });
    b.part(new THREE.SphereGeometry(0.0008, 4, 3), "#ffffff", {
      at: [s * 0.0125, 0.0705, 0.0985],
      bone: tipJ,
    });

    // lower oral tentacles
    const low = b.chain(
      `lowTentacle${side}`,
      catmull([
        [s * 0.004, 0.03, 0.085],
        [s * 0.0065, 0.027, 0.095],
        [s * 0.009, 0.0235, 0.105],
      ]),
      { parent: head, names: [`lowTentacle${side}1`, `lowTentacle${side}2`], role: "tentacle" },
    );
    b.sweep(low, [0.0022, 0.0012], { color: STALK, sides: 6 });
  }

  // ---------- shell ----------
  const shellJ = b.joint("shell", { parent: core, at: [0, 0.037, -0.014], dir: [0, 1, 0] });
  const C: [number, number, number] = [-0.003, 0.037, -0.014];
  const coil = spiral(C, [C[0], C[1] - 0.016, C[2]], [1, 0, 0], { turns: 2.6, r1: 0.004, pitch: 0.003 });

  const BASE = "#c08a50";
  const MID = "#9a6636";
  const DARK = "#4f3320";
  const shellPaint = paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    if (a % 72 < 22) return DARK;
    if (Math.floor(s[0] * 70) % 5 === 0) return MID;
    return BASE;
  });
  b.sweep(coil, (t) => 0.013 * Math.pow(0.22, t), {
    bone: shellJ,
    color: shellPaint,
    sides: 8,
    caps: { start: "flat", end: "round" },
    detail: 1.2,
  });

  // aperture lip
  const ap = coil.at(0);
  b.part(new THREE.TorusGeometry(0.0122, 0.002, 5, 12), LIP_RING, {
    at: [ap.x, ap.y, ap.z + 0.0005],
    bone: shellJ,
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.CircleGeometry(0.0115, 12), APERTURE, {
    at: [ap.x, ap.y, ap.z + 0.0004],
    bone: shellJ,
    dir: [0, 0, 1],
    axis: "z",
  });

  return b.root;
}

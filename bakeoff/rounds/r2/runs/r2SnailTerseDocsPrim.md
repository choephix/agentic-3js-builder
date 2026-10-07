```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Garden Snail",
  description: "A stylized garden snail with a striped spiral shell, eye stalks, lower tentacles and a jointed mouth.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });
  const BODY = mottle("#b9a58a", "#8f7a62", { size: 0.02, seed: 3 });
  const SOLE = "#e0d0aa";
  const SHELLA = "#d49a45";
  const SHELLB = "#5a3418";
  const EYE = "#101010";
  const LIP = "#c98f7a";

  // Body path (tail -> head)
  const body = catmull([
    [0, 0.004, -0.095],
    [0, 0.011, -0.06],
    [0, 0.017, -0.01],
    [0, 0.018, 0.04],
    [0, 0.032, 0.075],
    [0, 0.05, 0.095],
  ]);
  const core = b.joint("core", { at: [0, 0.017, -0.01], role: "spine" });
  const rootT = body.closestT(core.at);
  const front = b.chain("spineF", body.slice(rootT, 1), { parent: core, count: 4, role: "spine" });
  const back = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 3, role: "tail" });

  const radius = (t: number): [number, number] => {
    const k = Math.min(1, t / 0.4);
    let w = 0.005 + 0.017 * Math.sqrt(k);
    if (t > 0.78) w = 0.022 - (0.022 - 0.0125) * ((t - 0.78) / 0.22);
    return [w, w * 0.75];
  };
  b.sweep(body, radius, {
    bone: [back, core, front],
    color: BODY,
    sides: 10,
    sectors: [[125, 235, SOLE, 0, 0.8]],
  });

  // Head
  const headJ = b.joint("head", {
    parent: front.joints[front.joints.length - 1],
    at: [0, 0.05, 0.095],
    dir: [0, 0.3, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.0135, 8, 6), BODY, { bone: headJ, at: [0, 0.052, 0.1], scale: [1, 0.9, 1.1] });

  // Mouth: upper lip fixed, lower jaw separate
  const jaw = b.joint("jaw", {
    parent: headJ,
    at: [0, 0.045, 0.108],
    aim: [0, 0.04, 0.125],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), LIP, { bone: headJ, at: [0, 0.049, 0.11], scale: [1.2, 0.6, 0.9] });
  b.part(new THREE.SphereGeometry(0.0075, 6, 4), LIP, { bone: jaw, at: [0, 0.042, 0.11], scale: [1.2, 0.55, 0.9] });

  // Tentacles
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalkPath = catmull([
      [s * 0.007, 0.058, 0.1],
      [s * 0.011, 0.08, 0.106],
      [s * 0.016, 0.105, 0.112],
    ]);
    const stalk = b.chain(`eyeStalk${side}`, stalkPath, {
      parent: headJ,
      names: [`eyeStalk${side}1`, `eyeStalk${side}2`],
      role: "tentacle",
    });
    b.sweep(stalk, [0.0045, 0.003], { color: BODY, sides: 6 });
    const tip = stalkPath.at(1);
    const tipJ = stalk.joints[stalk.joints.length - 1];
    const eye = b.part(new THREE.SphereGeometry(0.0055, 6, 5), EYE, { bone: tipJ, at: [tip.x, tip.y + 0.002, tip.z] });
    b.part(new THREE.SphereGeometry(0.0013, 4, 3), "#ffffff", {
      bone: tipJ,
      at: [tip.x - s * 0.0015, tip.y + 0.005, tip.z + 0.003],
    });
    void eye;

    const lowPath = catmull([
      [s * 0.009, 0.044, 0.105],
      [s * 0.014, 0.039, 0.122],
      [s * 0.019, 0.034, 0.136],
    ]);
    const low = b.chain(`tentacle${side}`, lowPath, {
      parent: headJ,
      names: [`tentacle${side}1`, `tentacle${side}2`],
      role: "tentacle",
    });
    b.sweep(low, [0.0034, 0.002], { color: BODY, sides: 6 });
  }

  // Shell
  const c: [number, number, number] = [0, 0.068, -0.015];
  const shellJ = b.joint("shell", { parent: core, at: c, dir: [1, 0, 0], role: "hinge" });
  const coil = spiral(c, [0, c[1] - 0.026, c[2]], [1, 0, 0], { turns: 2.5, r1: 0.005, pitch: 0.006 });
  const shellPaint = paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    const dark = a < 55 || (a > 150 && a < 195);
    return dark ? SHELLB : SHELLA;
  });
  b.sweep(coil, [0.019, 0.004], {
    bone: shellJ,
    color: shellPaint,
    sides: 10,
    caps: "round",
  });
  // apex nub
  const end = coil.at(1);
  b.part(new THREE.SphereGeometry(0.005, 6, 4), SHELLB, { bone: shellJ, at: [end.x, end.y, end.z] });

  void rng;
  return b.root;
}
```
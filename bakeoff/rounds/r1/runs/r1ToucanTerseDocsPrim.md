```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, gradient, stripes, rng } from "agentic-3js-builder";

export const meta = { name: "Toucan", description: "Stylized toco toucan standing on a perch-less rest pose with a big banded bill." };

export default function build() {
  const b = createBuilder({ name: "toucan" });
  const BLACK = "#16161a", WHITE = "#f6f2e6", ORANGE = "#ff9a1a", YEL = "#ffd23a", RED = "#e03a24";
  const BLUE = "#3a9de0", LEG = "#5a8fb0", DARK = "#2a2a30", CLAW = "#222";

  // Skeleton: body tilted slightly, standing upright
  const hips = b.joint("hips", { at: [0, 0.2, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.2, -0.02], [0, 0.3, 0.0], [0, 0.4, 0.03]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] });
  const neck = b.chain("neck", catmull([[0, 0.4, 0.03], [0, 0.47, 0.06], [0, 0.52, 0.09]]), { parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "neckTip"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.52, 0.09], dir: [0, 0.1, 1], role: "head" });
  const jawUp = head;
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.515, 0.14], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.2, -0.05], [0, 0.12, -0.2], [0, 0.04, -0.34]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tailTip"] });

  // Body
  b.sweep(catmull([[0, 0.17, -0.1], [0, 0.28, -0.01], [0, 0.4, 0.04], [0, 0.48, 0.07]]), (t) => [0.075 + 0.045 * Math.sin(t * 3.0), 0.09 + 0.05 * Math.sin(t * 3.0)], {
    bone: [hips, ...spine.joints, ...neck.joints], color: countershade(BLACK, BLACK, {}), sectors: [], caps: "round",
  });
  // white bib
  b.part(new THREE.SphereGeometry(0.075, 10, 8), WHITE, { bone: spine.joints[2], at: [0, 0.43, 0.075], scale: [1.05, 1.1, 0.75] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), YEL, { bone: head, at: [0, 0.5, 0.1], scale: [1, 0.9, 0.8] });
  // red undertail
  b.part(new THREE.SphereGeometry(0.05, 8, 6), RED, { bone: hips, at: [0, 0.13, -0.1], scale: [1, 0.8, 1] });
  // white rump
  b.part(new THREE.SphereGeometry(0.045, 8, 6), WHITE, { bone: hips, at: [0, 0.2, -0.13] });

  // Tail
  b.sweep(tail, [0.05, 0.04], { color: BLACK, section: "box", caps: "flat" });

  // Head
  b.part(new THREE.SphereGeometry(0.075, 10, 8), BLACK, { bone: head, at: [0, 0.55, 0.1], scale: [1, 1, 1.05] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BLACK, { bone: head, at: [0, 0.545, 0.075] });

  for (const s of [1, -1]) {
    // eye with blue skin ring
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BLUE, { bone: head, at: [s * 0.058, 0.57, 0.14], scale: [0.5, 1, 1] });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), "#fff", { bone: head, at: [s * 0.068, 0.57, 0.145] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), "#000", { bone: head, at: [s * 0.075, 0.57, 0.15] });
  }

  // Bill: upper (jaw-fixed to head) and lower (jaw)
  const billTop = (y0: number) => y0;
  b.sweep(bezier([0, 0.56, 0.14], [0, 0.6, 0.3], [0, 0.585, 0.42], [0, 0.52, 0.5]), (t) => [0.04 * (1 - 0.55 * t) + 0.005, 0.055 * (1 - 0.6 * t) + 0.01], {
    bone: head, color: ORANGE, sectors: [[-40, 40, YEL], [150, 210, RED]], bands: [[0.85, ORANGE], [1, DARK]], caps: "round",
  });
  b.sweep(bezier([0, 0.5, 0.14], [0, 0.5, 0.3], [0, 0.49, 0.4], [0, 0.48, 0.47]), (t) => [0.032 * (1 - 0.55 * t) + 0.005, 0.025 * (1 - 0.4 * t) + 0.008], {
    bone: jaw, color: ORANGE, bands: [[0.85, ORANGE], [1, DARK]], caps: "round",
  });
  // black tip spot
  b.part(new THREE.SphereGeometry(0.022, 6, 5), BLACK, { bone: head, at: [0, 0.53, 0.5], scale: [1, 1.1, 1.2] });
  // base ring
  b.part(new THREE.TorusGeometry(0.05, 0.006, 5, 10), BLACK, { bone: head, at: [0, 0.555, 0.15], dir: [0, 0, 1], axis: "z", scale: [1, 1.1, 1] });

  // Wings (folded, hung down)
  for (const s of [1, -1]) {
    const sh = b.joint(s > 0 ? "shoulderL" : "shoulderR", { parent: spine.joints[2], at: [s * 0.1, 0.39, 0.0], dir: [s * 0.3, -1, -0.3], role: "wing" });
    const wt = b.joint(s > 0 ? "wingTipL" : "wingTipR", { parent: sh, at: [s * 0.13, 0.15, -0.1], dir: [s * 0.1, -1, -0.6], role: "wing" });
    b.sweep([[s * 0.1, 0.39, 0.0], [s * 0.125, 0.28, -0.04], [s * 0.13, 0.15, -0.1]], (t) => [0.04 * (1 - 0.5 * t) + 0.015, 0.025], { bone: [sh, wt], color: BLACK, section: "box", caps: "round" });
  }

  // Legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const hip = b.joint(`hip${n}`, { parent: hips, at: [s * 0.055, 0.16, 0.0], dir: [0, -1, 0], role: "leg" });
    const knee = b.joint(`knee${n}`, { parent: hip, at: [s * 0.055, 0.09, 0.01], dir: [0, -1, 0.1], role: "leg" });
    b.rod([s * 0.055, 0.17, 0.0], [s * 0.055, 0.09, 0.01], [0.03, 0.02], { bone: hip, color: BLACK });
    b.rod([s * 0.055, 0.09, 0.01], [s * 0.055, 0.012, 0.02], 0.014, { bone: knee, color: LEG });
    for (let k = 0; k < 4; k++) {
      const front = k < 2;
      const ang = (front ? (k === 0 ? -0.3 : 0.3) : (k === 2 ? -0.25 : 0.25));
      const tipz = front ? 0.09 : -0.05;
      const toe = b.joint(`toe${n}${k + 1}`, { parent: knee, at: [s * 0.055, 0.012, 0.02], dir: [ang, -0.02, front ? 1 : -1], role: "digit" });
      b.rod([s * 0.055, 0.012, 0.02], [s * 0.055 + ang * 0.2, 0.01, 0.02 + tipz], 0.01, { bone: toe, color: LEG, caps: "round" });
    }
  }

  const root = b.root;
  return root;
}
```
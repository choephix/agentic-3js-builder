```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Capybara with Bird",
  description: "A chunky, sleepy whimsical capybara with a tiny round bird perched on its head.",
};

const FUR = "#a8743f", FUR_D = "#6e4526", BELLY = "#d2a56a", NOSE = "#3a2418";
const BIRD = "#4fb6e8", BIRD_L = "#bfeaff", BEAK = "#ffb02e", INK = "#1d1410";

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const r = rng(3);

  const coat = paint((p, n) => {
    let c = mix(FUR, BELLY, smoothstep(-0.1, -0.8, n.y));
    c = mix(c, FUR_D, smoothstep(0.55, 0.8, noise(p, 0.12, 3)) * 0.4);
    return mix(c, "#c89558", smoothstep(0.6, 1, n.y) * 0.35);
  });

  const hips = b.joint("hips", { at: [0, 0.4, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.42, -0.3], [0, 0.45, 0.1], [0, 0.46, 0.4]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: chest, at: [0, 0.5, 0.45], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.4, 0.62], aim: [0, 0.38, 0.85], role: "jaw" });

  b.sweep(catmull([[0, 0.42, -0.5], [0, 0.44, -0.2], [0, 0.46, 0.15], [0, 0.47, 0.42]]),
    [0.22, 0.27, 0.26, 0.2], { bone: [hips, spine], color: coat, sides: 10, name: "body", shift: [0, 0] });

  // head
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: head, at: [0, 0.5, 0.62], scale: [0.2, 0.2, 0.26], name: "skull" });
  b.part(new THREE.BoxGeometry(0.22, 0.17, 0.22), coat, { bone: head, at: [0, 0.46, 0.84], name: "muzzle" });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), BELLY, { bone: jaw, at: [0, 0.35, 0.8], name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.2, 0.09, 0.05), NOSE, { bone: head, at: [0, 0.5, 0.96], name: "nose" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), NOSE, { bone: head, at: [s * 0.05, 0.51, 0.99], name: "nostril" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#fff6e0", { bone: head, at: [s * 0.13, 0.56, 0.77], name: "eyeWhite" });
    b.part(new THREE.SphereGeometry(0.018, 6, 5), INK, { bone: head, at: [s * 0.14, 0.55, 0.795], name: "pupil" });
    b.part(new THREE.SphereGeometry(0.006, 4, 3), "#ffffff", { bone: head, at: [s * 0.145, 0.562, 0.81], name: "glint" });
    b.part(new THREE.BoxGeometry(0.07, 0.014, 0.02), FUR_D, { bone: head, at: [s * 0.13, 0.6, 0.78], rotation: [0, 0, s * -10], name: "lid" });
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.14, 0.65, 0.52], dir: [s * 0.4, 1, 0], role: "hinge" });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), FUR_D, { bone: ear, at: [s * 0.15, 0.68, 0.52], scale: [0.8, 1, 0.5], name: "ear" });
  }

  // legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const [z, par, tag] of [[0.3, chest, "F"], [-0.45, hips, "H"]] as const) {
      const pts = limb([s * 0.17, 0.3, z], [s * 0.17, 0.05, z + 0.03], [0.14, 0.14], [[0, 0, tag === "F" ? -1 : 1]]);
      const leg = b.chain(`leg${tag}${k}`, pts, { parent: par, names: [`hip${tag}${k}`, `knee${tag}${k}`, `foot${tag}${k}`], role: "leg" });
      b.sweep(leg, [0.1, 0.06], { color: coat, sides: 7, name: `leg${tag}${k}` });
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.16), FUR_D, { bone: leg.tip!, at: [s * 0.17, 0.025, z + 0.07], name: "foot" });
    }
  }

  // bird on head
  const bj = b.joint("bird", { parent: head, at: [0, 0.69, 0.6], dir: [0, 1, 0] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BIRD, { bone: bj, at: [0, 0.74, 0.6], scale: [1, 0.95, 1.1], name: "birdBody" });
  b.part(new THREE.SphereGeometry(0.04, 7, 5), BIRD_L, { bone: bj, at: [0, 0.725, 0.64], scale: [1, 0.9, 0.8], name: "birdBelly" });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), BEAK, { bone: bj, at: [0, 0.75, 0.68], dir: [0, 0, 1], name: "beak" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 5, 4), INK, { bone: bj, at: [s * 0.03, 0.765, 0.65], name: "birdEye" });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#2f93c8", { bone: bj, at: [s * 0.06, 0.74, 0.58], scale: [0.4, 0.8, 1.2], name: "wing" });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 4), BEAK, { bone: bj, at: [s * 0.02, 0.69, 0.6], name: "birdLeg" });
  }
  b.part(new THREE.ConeGeometry(0.02, 0.07, 4), "#2f93c8", { bone: bj, at: [0, 0.76, 0.54], dir: [0, 0.4, -1], name: "birdTail" });
  b.part(new THREE.ConeGeometry(0.012, 0.05, 4), BEAK, { bone: bj, at: [0, 0.81, 0.62], name: "crest" });

  return b.root;
}
```
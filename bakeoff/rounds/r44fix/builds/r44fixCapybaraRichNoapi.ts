import * as THREE from "three";
import { createBuilder, catmull, rng, paint, mix, noise, smoothstep, svg, frame } from "../../../../src/index";

export const meta = {
  name: "Capybara with Bird",
  description: "A whimsical, chunky capybara with a blunt snout, tiny ears and a small bluebird perched on its head.",
};

const FUR = "#a8703c", FUR_D = "#6e4526", FUR_L = "#d9a465", BELLY = "#d8b583";
const NOSE = "#2c1a16", HOOF = "#3a2a22", EYE = "#1a0f0c", WHITE = "#fff8e8";
const BLUE = "#4aa8e0", BLUE_D = "#2a6fb0", CREAM = "#fff0c8", BEAK = "#ffb02a";

const coat = paint((p, n) => {
  let c = mix(FUR_D, FUR, smoothstep(-0.5, 0.5, n.y));
  c = mix(c, FUR_L, smoothstep(0.6, 1, n.y) * 0.5 * noise(p, 0.08, 3));
  c = mix(c, BELLY, smoothstep(-0.4, -0.9, n.y));
  c = mix(c, FUR_D, smoothstep(0.6, 0.8, noise(p, 0.05, 7)) * 0.3);
  return c;
});

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><polygon points="2,48 10,48 5,4" fill="#c8c8c8"/><polygon points="10,48 22,48 16,0" fill="#fff"/><polygon points="22,48 30,48 27,8" fill="#d8d8d8"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });
  const r = rng(5);

  const hips = b.joint("hips", { at: [0, 0.4, -0.2], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.42, 0.2], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.45, 0.4], dir: [0, 0.2, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.5, 0.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.4, 0.62], aim: [0, 0.38, 0.8], role: "jaw" });

  // body
  b.part(new THREE.SphereGeometry(1, 14, 10), coat, { bone: hips, at: [0, 0.4, -0.05], scale: [0.27, 0.27, 0.55], name: "body" });
  b.part(new THREE.SphereGeometry(1, 12, 8), coat, { bone: chest, at: [0, 0.42, 0.25], scale: [0.26, 0.26, 0.28], name: "shoulders" });
  // head
  b.part(new THREE.SphereGeometry(1, 14, 10), coat, { bone: head, at: [0, 0.5, 0.52], scale: [0.2, 0.2, 0.26], name: "skull" });
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.2), coat, { bone: head, at: [0, 0.44, 0.7], name: "snout" });
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, { bone: head, at: [0, 0.5, 0.8], scale: [0.14, 0.08, 0.04], name: "nose" });
  b.part(new THREE.BoxGeometry(0.24, 0.07, 0.17), BELLY, { bone: jaw, at: [0, 0.34, 0.68], name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), WHITE, { bone: head, at: [0, 0.385, 0.8], name: "tooth" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), EYE, { bone: head, at: [s * 0.15, 0.56, 0.62], name: "eye" });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), WHITE, { bone: head, at: [s * 0.15 + s * 0.005, 0.575, 0.65], name: "glint" });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), NOSE, { bone: head, at: [s * 0.06, 0.5, 0.815], name: "nostril" });
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.13, 0.68, 0.4], dir: [s * 0.3, 1, 0], role: "hinge" });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), FUR_D, { bone: ear, at: [s * 0.13, 0.69, 0.4], scale: [1, 1, 0.6], name: "ear" });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#d08a78", { bone: ear, at: [s * 0.13, 0.69, 0.43], scale: [1, 1, 0.4], name: "earIn" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), FUR_L, { bone: head, at: [s * 0.1, 0.65, 0.58], scale: [1.4, 0.5, 1], name: "brow" });
  }

  // legs
  for (const s of [1, -1]) {
    for (const [z, par, tag] of [[0.35, chest, "F"], [-0.4, hips, "H"]] as const) {
      const side = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * 0.17, 0.3, z];
      const knee: [number, number, number] = [s * 0.18, 0.17, z + 0.02];
      const foot: [number, number, number] = [s * 0.18, 0.04, z + 0.04];
      const leg = b.chain(`leg${tag}${side}`, [root, knee, foot], {
        parent: par,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `foot${tag}${side}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.095, 0.07, 0.06], { color: coat, sides: 8, name: "leg" });
      const fj = leg.tip!;
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.16), FUR_D, { bone: fj, at: [foot[0], 0.025, foot[2] + 0.03], name: "foot" });
      for (const k of [-1, 0, 1])
        b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), HOOF, { bone: fj, at: [foot[0] + k * 0.04, 0.02, foot[2] + 0.115], name: "toe" });
    }
  }

  // tail nub
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.4, -0.6], dir: [0, 0, -1], role: "tail" });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), FUR_D, { bone: tail, at: [0, 0.38, -0.62], name: "tail" });

  // fur tufts on back

  for (let i = 0; i < 14; i++) {
    const z = -0.4 + i * 0.07;
    b.cards([frame([(r() - 0.5) * 0.2, 0.66 - Math.abs(z - 0.1) * 0.12, z], [0, 1, 0])], TUFT, { size: [0.04, 0.07], color: FUR_L, bone: hips });
  }

  // bird on head
  const bird = b.joint("bird", { parent: head, at: [0, 0.71, 0.5], dir: [0, 0, 1], role: "spine" });
  const by = 0.78, bz = 0.5;
  b.part(new THREE.SphereGeometry(1, 10, 8), BLUE, { bone: bird, at: [0, by, bz], scale: [0.065, 0.06, 0.08], name: "birdBody" });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { bone: bird, at: [0, by - 0.02, bz + 0.03], scale: [0.05, 0.04, 0.05], name: "birdBelly" });
  b.part(new THREE.SphereGeometry(0.045, 10, 8), BLUE, { bone: bird, at: [0, by + 0.06, bz + 0.05], name: "birdHead" });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), BEAK, { bone: bird, at: [0, by + 0.055, bz + 0.1], dir: [0, 0, 1], name: "beak" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 5, 4), EYE, { bone: bird, at: [s * 0.03, by + 0.075, bz + 0.08], name: "birdEye" });
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_D, { bone: bird, at: [s * 0.06, by + 0.01, bz - 0.01], scale: [0.015, 0.045, 0.07], rotation: [0, 0, s * 10], name: "wing" });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 4), BEAK, { bone: bird, at: [s * 0.02, by - 0.06, bz], name: "birdLeg" });
  }
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.1), BLUE_D, { bone: bird, at: [0, by - 0.005, bz - 0.1], rotation: [-15, 0, 0], name: "birdTail" });
  b.part(new THREE.ConeGeometry(0.012, 0.05, 4), BLUE_D, { bone: bird, at: [0, by + 0.12, bz + 0.03], rotation: [-20, 0, 0], name: "crest" });

  return b.root;
}
